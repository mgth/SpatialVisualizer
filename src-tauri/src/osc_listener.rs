use rosc::{decoder, OscPacket};
use std::net::UdpSocket;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};
use tokio::sync::mpsc::UnboundedReceiver;

use crate::app_state::{AppState, Meter};
use crate::layouts::build_live_layout;
use crate::osc_parser::{is_heartbeat_address, parse_osc_message, HeartbeatResponse, OscEvent};

const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);
const HEARTBEAT_ACK_TIMEOUT: Duration = Duration::from_secs(10);
const LATENCY_EMA_ALPHA: f64 = 0.03;

// ── control messages (frontend → OSC listener) ────────────────────────────

pub enum OscControlMsg {
    SendFloat {
        address: String,
        value: f32,
    },
    SendInt {
        address: String,
        value: i32,
    },
    SendNoArgs {
        address: String,
    },
    Reconnect {
        host: String,
        rx_port: u16,
        listen_port: u16,
    },
}

// ── OSC send helpers ─────────────────────────────────────────────────────

fn send_osc_float(socket: &UdpSocket, addr: &str, host: &str, rx_port: u16, value: f32) {
    use rosc::{encoder, OscMessage, OscType};
    let msg = OscPacket::Message(OscMessage {
        addr: addr.to_string(),
        args: vec![OscType::Float(value)],
    });
    if let Ok(data) = encoder::encode(&msg) {
        let _ = socket.send_to(&data, format!("{host}:{rx_port}"));
    }
}

fn send_osc_int(socket: &UdpSocket, addr: &str, host: &str, rx_port: u16, value: i32) {
    use rosc::{encoder, OscMessage, OscType};
    let msg = OscPacket::Message(OscMessage {
        addr: addr.to_string(),
        args: vec![OscType::Int(value)],
    });
    if let Ok(data) = encoder::encode(&msg) {
        let _ = socket.send_to(&data, format!("{host}:{rx_port}"));
    }
}

fn send_osc_no_args(socket: &UdpSocket, addr: &str, host: &str, rx_port: u16) {
    use rosc::{encoder, OscMessage};
    let msg = OscPacket::Message(OscMessage {
        addr: addr.to_string(),
        args: vec![],
    });
    if let Ok(data) = encoder::encode(&msg) {
        let _ = socket.send_to(&data, format!("{host}:{rx_port}"));
    }
}

fn send_register(socket: &UdpSocket, host: &str, rx_port: u16, listen_port: u16) {
    send_osc_int(socket, "/gsrd/register", host, rx_port, listen_port as i32);
    log::info!("[osc] register sent → udp://{host}:{rx_port} listen_port={listen_port}");
}

fn send_heartbeat(socket: &UdpSocket, host: &str, rx_port: u16, listen_port: u16) {
    send_osc_int(socket, "/gsrd/heartbeat", host, rx_port, listen_port as i32);
}

// ── public spawn function ─────────────────────────────────────────────────

pub fn spawn_osc_task(
    app: AppHandle,
    state: Arc<Mutex<AppState>>,
    host: String,
    osc_port: u16,
    osc_rx_port: u16,
    ctrl_rx: UnboundedReceiver<OscControlMsg>,
    listen_port_out: Arc<Mutex<u16>>,
) {
    std::thread::spawn(move || {
        osc_thread(
            app,
            state,
            host,
            osc_port,
            osc_rx_port,
            ctrl_rx,
            listen_port_out,
        );
    });
}

fn debug_log_packet(packet: &OscPacket) {
    match packet {
        OscPacket::Message(msg) => {
            let args_repr: Vec<String> = msg
                .args
                .iter()
                .map(|a| match a {
                    rosc::OscType::Float(v) => format!("f:{v:.3}"),
                    rosc::OscType::Double(v) => format!("d:{v:.3}"),
                    rosc::OscType::Int(v) => format!("i:{v}"),
                    rosc::OscType::Long(v) => format!("l:{v}"),
                    rosc::OscType::String(s) => format!("s:{s:?}"),
                    _ => "?".to_string(),
                })
                .collect();
            eprintln!(
                "[osc] {addr}  [{args}]",
                addr = msg.addr,
                args = args_repr.join(", ")
            );
        }
        OscPacket::Bundle(b) => {
            for pkt in &b.content {
                debug_log_packet(pkt);
            }
        }
    }
}

fn osc_thread(
    app: AppHandle,
    state: Arc<Mutex<AppState>>,
    mut host: String,
    osc_port: u16,
    mut osc_rx_port: u16,
    mut ctrl_rx: UnboundedReceiver<OscControlMsg>,
    listen_port_out: Arc<Mutex<u16>>,
) {
    let bind_addr = format!("0.0.0.0:{osc_port}");
    let socket = match UdpSocket::bind(&bind_addr) {
        Ok(s) => s,
        Err(e) => {
            log::error!("[osc] bind failed: {e}");
            return;
        }
    };
    socket
        .set_read_timeout(Some(Duration::from_millis(50)))
        .ok();

    let listen_port = socket.local_addr().map(|a| a.port()).unwrap_or(osc_port);
    *listen_port_out.lock().unwrap() = listen_port;
    log::info!("[osc] listening on udp://0.0.0.0:{listen_port}");

    send_register(&socket, &host, osc_rx_port, listen_port);

    let mut last_ack_at = Instant::now();
    let mut last_heartbeat_at = Instant::now();
    let mut latency_ema: Option<f64> = None;

    let mut buf = [0u8; 65536];

    loop {
        // drain control messages (non-blocking)
        loop {
            match ctrl_rx.try_recv() {
                Ok(msg) => match msg {
                    OscControlMsg::SendFloat { address, value } => {
                        send_osc_float(&socket, &address, &host, osc_rx_port, value);
                    }
                    OscControlMsg::SendInt { address, value } => {
                        send_osc_int(&socket, &address, &host, osc_rx_port, value);
                    }
                    OscControlMsg::SendNoArgs { address } => {
                        send_osc_no_args(&socket, &address, &host, osc_rx_port);
                    }
                    OscControlMsg::Reconnect {
                        host: h,
                        rx_port,
                        listen_port: lp,
                    } => {
                        host = h;
                        osc_rx_port = rx_port;
                        latency_ema = None;
                        send_register(&socket, &host, osc_rx_port, lp);
                        last_ack_at = Instant::now();
                    }
                },
                Err(tokio::sync::mpsc::error::TryRecvError::Empty) => break,
                Err(_) => return, // channel closed
            }
        }

        // heartbeat timer
        if last_heartbeat_at.elapsed() >= HEARTBEAT_INTERVAL {
            last_heartbeat_at = Instant::now();
            send_heartbeat(&socket, &host, osc_rx_port, listen_port);

            if last_ack_at.elapsed() >= HEARTBEAT_ACK_TIMEOUT {
                log::warn!("[osc] heartbeat timeout, re-registering");
                latency_ema = None;
                send_register(&socket, &host, osc_rx_port, listen_port);
                last_ack_at = Instant::now();
            }
        }

        // receive packet
        let n = match socket.recv_from(&mut buf) {
            Ok((n, _)) => n,
            Err(_) => continue, // timeout
        };

        match decoder::decode_udp(&buf[..n]) {
            Ok((_, packet)) => {
                debug_log_packet(&packet);
                handle_packet(
                    packet,
                    &app,
                    &state,
                    &socket,
                    &host,
                    osc_rx_port,
                    listen_port,
                    &mut last_ack_at,
                    &mut latency_ema,
                );
            }
            Err(e) => eprintln!("[osc] decode error: {e}"),
        }
    }
}

fn handle_packet(
    packet: OscPacket,
    app: &AppHandle,
    state: &Arc<Mutex<AppState>>,
    socket: &UdpSocket,
    host: &str,
    osc_rx_port: u16,
    listen_port: u16,
    last_ack_at: &mut Instant,
    latency_ema: &mut Option<f64>,
) {
    match packet {
        OscPacket::Message(msg) => {
            match is_heartbeat_address(&msg.addr) {
                HeartbeatResponse::Ack => {
                    *last_ack_at = Instant::now();
                    return;
                }
                HeartbeatResponse::Unknown => {
                    log::info!("[osc] heartbeat/unknown → re-registering");
                    send_register(socket, host, osc_rx_port, listen_port);
                    *last_ack_at = Instant::now();
                    return;
                }
                HeartbeatResponse::None => {}
            }

            if let Some(ev) = parse_osc_message(&msg.addr, &msg.args) {
                handle_event(ev, app, state, latency_ema);
            }
        }
        OscPacket::Bundle(bundle) => {
            let mut config_events: Vec<OscEvent> = Vec::new();

            for pkt in bundle.content {
                match pkt {
                    OscPacket::Message(msg) => {
                        match is_heartbeat_address(&msg.addr) {
                            HeartbeatResponse::Ack => {
                                *last_ack_at = Instant::now();
                                continue;
                            }
                            HeartbeatResponse::Unknown => {
                                send_register(socket, host, osc_rx_port, listen_port);
                                *last_ack_at = Instant::now();
                                continue;
                            }
                            HeartbeatResponse::None => {}
                        }

                        if let Some(ev) = parse_osc_message(&msg.addr, &msg.args) {
                            let is_config = matches!(
                                &ev,
                                OscEvent::ConfigSpeakersCount { .. }
                                    | OscEvent::ConfigSpeaker { .. }
                            );
                            if is_config {
                                config_events.push(ev);
                            } else {
                                handle_event(ev, app, state, latency_ema);
                            }
                        }
                    }
                    OscPacket::Bundle(inner) => {
                        for pkt2 in inner.content {
                            if let OscPacket::Message(msg) = pkt2 {
                                if let Some(ev) = parse_osc_message(&msg.addr, &msg.args) {
                                    handle_event(ev, app, state, latency_ema);
                                }
                            }
                        }
                    }
                }
            }

            if !config_events.is_empty() {
                apply_speaker_config(config_events, app, state);
            }
        }
    }
}

fn apply_speaker_config(events: Vec<OscEvent>, app: &AppHandle, state: &Arc<Mutex<AppState>>) {
    if let Some(live) = build_live_layout(&events) {
        let payload = {
            let mut s = state.lock().unwrap();
            s.layouts.retain(|l| l.key != "gsrd-live");
            s.layouts.insert(0, live.clone());
            s.selected_layout_key = Some(live.key.clone());
            serde_json::json!({
                "layouts": s.layouts,
                "selectedLayoutKey": s.selected_layout_key
            })
        }; // mutex released here
        let _ = app.emit("layouts:update", payload);
    }
}

fn handle_event(
    ev: OscEvent,
    app: &AppHandle,
    state: &Arc<Mutex<AppState>>,
    latency_ema: &mut Option<f64>,
) {
    // Update state under the lock, collect emit data, then release before emitting.
    let (to_emit, removed_ids): (Option<(&'static str, serde_json::Value)>, Vec<String>) = {
        let mut s = state.lock().unwrap();
        let mut removed_ids: Vec<String> = Vec::new();
        match ev {
            OscEvent::SpatialFrame {
                sample_pos,
                object_count,
            } => {
                let is_reset = s
                    .last_spatial_sample_pos
                    .is_some_and(|prev| sample_pos < prev);
                s.last_spatial_sample_pos = Some(sample_pos);

                let stale_ids: Vec<String> = if is_reset {
                    s.sources.keys().cloned().collect()
                } else {
                    s.sources
                        .keys()
                        .filter_map(|id| {
                            id.parse::<u32>().ok().and_then(|idx| {
                                if idx >= object_count {
                                    Some(id.clone())
                                } else {
                                    None
                                }
                            })
                        })
                        .collect()
                };

                for id in &stale_ids {
                    s.sources.remove(id);
                    s.source_levels.remove(id);
                    s.object_speaker_gains.remove(id);
                    s.object_gains.remove(id);
                    s.object_mutes.remove(id);
                }
                removed_ids.extend(stale_ids);
                (
                    Some((
                        "spatial:frame",
                        serde_json::json!({
                            "samplePos": sample_pos,
                            "objectCount": object_count,
                            "reset": is_reset
                        }),
                    )),
                    removed_ids,
                )
            }

            OscEvent::Update { id, position, name } => {
                let entry = s.sources.entry(id.clone()).or_default();
                entry.x = position.x;
                entry.y = position.y;
                entry.z = position.z;
                if let Some(n) = name {
                    entry.name = Some(n);
                }
                let payload = serde_json::json!({
                    "id": id,
                    "position": { "x": entry.x, "y": entry.y, "z": entry.z, "name": entry.name }
                });
                (Some(("source:update", payload)), removed_ids)
            }

            OscEvent::Remove { id } => {
                s.sources.remove(&id);
                s.source_levels.remove(&id);
                s.object_speaker_gains.remove(&id);
                (
                    Some(("source:remove", serde_json::json!({ "id": id }))),
                    removed_ids,
                )
            }

            OscEvent::MeterObject {
                id,
                peak_dbfs,
                rms_dbfs,
            } => {
                s.source_levels.insert(
                    id.clone(),
                    Meter {
                        peak_dbfs,
                        rms_dbfs,
                    },
                );
                (
                    Some((
                        "source:meter",
                        serde_json::json!({
                            "id": id,
                            "meter": { "peakDbfs": peak_dbfs, "rmsDbfs": rms_dbfs }
                        }),
                    )),
                    removed_ids,
                )
            }

            OscEvent::MeterObjectGains { id, gains } => {
                s.object_speaker_gains.insert(id.clone(), gains.clone());
                (
                    Some((
                        "source:gains",
                        serde_json::json!({ "id": id, "gains": gains }),
                    )),
                    removed_ids,
                )
            }

            OscEvent::MeterSpeaker {
                id,
                peak_dbfs,
                rms_dbfs,
            } => {
                s.speaker_levels.insert(
                    id.clone(),
                    Meter {
                        peak_dbfs,
                        rms_dbfs,
                    },
                );
                (
                    Some((
                        "speaker:meter",
                        serde_json::json!({
                            "id": id,
                            "meter": { "peakDbfs": peak_dbfs, "rmsDbfs": rms_dbfs }
                        }),
                    )),
                    removed_ids,
                )
            }

            OscEvent::StateObjectGain { id, gain } => {
                s.object_gains.insert(id.clone(), gain);
                (
                    Some(("object:gain", serde_json::json!({ "id": id, "gain": gain }))),
                    removed_ids,
                )
            }

            OscEvent::StateSpeakerGain { id, gain } => {
                s.speaker_gains.insert(id.clone(), gain);
                (
                    Some((
                        "speaker:gain",
                        serde_json::json!({ "id": id, "gain": gain }),
                    )),
                    removed_ids,
                )
            }

            OscEvent::StateObjectMute { id, muted } => {
                if muted {
                    s.object_mutes.insert(id.clone(), 1);
                } else {
                    s.object_mutes.remove(&id);
                }
                (
                    Some((
                        "object:mute",
                        serde_json::json!({ "id": id, "muted": muted as u8 }),
                    )),
                    removed_ids,
                )
            }

            OscEvent::StateSpeakerMute { id, muted } => {
                if muted {
                    s.speaker_mutes.insert(id.clone(), 1);
                } else {
                    s.speaker_mutes.remove(&id);
                }
                (
                    Some((
                        "speaker:mute",
                        serde_json::json!({ "id": id, "muted": muted as u8 }),
                    )),
                    removed_ids,
                )
            }

            OscEvent::StateRoomRatio {
                width,
                length,
                height,
            } => {
                s.room_ratio.width = width;
                s.room_ratio.length = length;
                s.room_ratio.height = height;
                (
                    Some((
                        "room_ratio",
                        serde_json::json!({
                            "roomRatio": { "width": width, "length": length, "height": height }
                        }),
                    )),
                    removed_ids,
                )
            }

            OscEvent::StateSpreadMin { value } => {
                s.spread.min = Some(value);
                (
                    Some(("spread:min", serde_json::json!({ "value": value }))),
                    removed_ids,
                )
            }

            OscEvent::StateSpreadMax { value } => {
                s.spread.max = Some(value);
                (
                    Some(("spread:max", serde_json::json!({ "value": value }))),
                    removed_ids,
                )
            }

            OscEvent::StateDialogNorm { enabled } => {
                s.dialog_norm = Some(if enabled { 1 } else { 0 });
                (
                    Some((
                        "dialog_norm",
                        serde_json::json!({ "enabled": if enabled { 1 } else { 0 } }),
                    )),
                    removed_ids,
                )
            }

            OscEvent::StateDialogNormLevel { value } => {
                s.dialog_norm_level = Some(value);
                (
                    Some(("dialog_norm:level", serde_json::json!({ "value": value }))),
                    removed_ids,
                )
            }

            OscEvent::StateDialogNormGain { value } => {
                s.dialog_norm_gain = Some(value);
                (
                    Some(("dialog_norm:gain", serde_json::json!({ "value": value }))),
                    removed_ids,
                )
            }

            OscEvent::StateMasterGain { value } => {
                s.master_gain = Some(value);
                (
                    Some(("master:gain", serde_json::json!({ "value": value }))),
                    removed_ids,
                )
            }

            OscEvent::StateLatency { value } => {
                let ema = latency_ema.map_or(value, |prev| {
                    LATENCY_EMA_ALPHA * value + (1.0 - LATENCY_EMA_ALPHA) * prev
                });
                *latency_ema = Some(ema);
                s.latency_ms = Some(ema.round() as i64);
                (
                    Some(("latency", serde_json::json!({ "value": s.latency_ms }))),
                    removed_ids,
                )
            }

            OscEvent::StateResampleRatio { value } => {
                s.resample_ratio = Some(value);
                (
                    Some(("resample_ratio", serde_json::json!({ "value": value }))),
                    removed_ids,
                )
            }

            OscEvent::StateDistanceDiffuseEnabled { enabled } => {
                s.distance_diffuse.enabled = Some(enabled);
                (
                    Some((
                        "distance_diffuse:enabled",
                        serde_json::json!({ "enabled": enabled }),
                    )),
                    removed_ids,
                )
            }

            OscEvent::StateDistanceDiffuseThreshold { value } => {
                s.distance_diffuse.threshold = Some(value);
                (
                    Some((
                        "distance_diffuse:threshold",
                        serde_json::json!({ "value": value }),
                    )),
                    removed_ids,
                )
            }

            OscEvent::StateDistanceDiffuseCurve { value } => {
                s.distance_diffuse.curve = Some(value);
                (
                    Some((
                        "distance_diffuse:curve",
                        serde_json::json!({ "value": value }),
                    )),
                    removed_ids,
                )
            }

            OscEvent::StateConfigSaved { saved } => {
                s.config_saved = Some(if saved { 1 } else { 0 });
                (
                    Some((
                        "config:saved",
                        serde_json::json!({ "saved": if saved { 1 } else { 0 } }),
                    )),
                    removed_ids,
                )
            }

            OscEvent::ConfigSpeakersCount { .. } | OscEvent::ConfigSpeaker { .. } => {
                // handled in bundle context via apply_speaker_config
                (None, removed_ids)
            }
        }
    }; // mutex released here, before any emit

    for id in removed_ids {
        let _ = app.emit("source:remove", serde_json::json!({ "id": id }));
    }

    if let Some((event, payload)) = to_emit {
        let _ = app.emit(event, payload);
    }
}
