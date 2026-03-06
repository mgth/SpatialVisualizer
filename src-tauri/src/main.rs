// Prevents an additional console window on Windows in release builds.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod app_state;
mod config;
mod layouts;
mod osc_listener;
mod osc_parser;

use std::path::PathBuf;
use std::sync::{Arc, Mutex};

use app_state::AppState;
use config::{load_config, save_config, OscConfig};
use osc_listener::{spawn_osc_task, OscControlMsg};
use tauri::{Manager, State};
use tokio::sync::mpsc::UnboundedSender;

// ── shared state wrapper ──────────────────────────────────────────────────

struct SharedState {
    inner: Arc<Mutex<AppState>>,
    osc_tx: Arc<Mutex<Option<UnboundedSender<OscControlMsg>>>>,
    config_dir: PathBuf,
    listen_port: Arc<Mutex<u16>>,
}

// ── helper ────────────────────────────────────────────────────────────────

fn send_control(tx: &Arc<Mutex<Option<UnboundedSender<OscControlMsg>>>>, msg: OscControlMsg) {
    if let Some(tx) = tx.lock().unwrap().as_ref() {
        let _ = tx.send(msg);
    }
}

// ── Tauri commands ────────────────────────────────────────────────────────

#[tauri::command]
fn get_state(state: State<SharedState>) -> serde_json::Value {
    let s = state.inner.lock().unwrap();
    serde_json::to_value(&*s).unwrap_or(serde_json::Value::Null)
}

#[tauri::command]
fn get_osc_config(state: State<SharedState>) -> OscConfig {
    load_config(&state.config_dir)
}

#[tauri::command]
fn save_osc_config(state: State<SharedState>, config: OscConfig) -> Result<(), String> {
    save_config(&state.config_dir, &config)?;
    let listen_port = *state.listen_port.lock().unwrap();
    send_control(
        &state.osc_tx,
        OscControlMsg::Reconnect {
            host: config.host,
            rx_port: config.osc_rx_port,
            listen_port,
        },
    );
    Ok(())
}

#[tauri::command]
fn select_layout(state: State<SharedState>, key: String) -> bool {
    let mut s = state.inner.lock().unwrap();
    let exists = s.layouts.iter().any(|l| l.key == key);
    if exists {
        s.selected_layout_key = Some(key);
    }
    exists
}

#[tauri::command]
fn import_layout_from_path(state: State<SharedState>, path: String) -> Result<serde_json::Value, String> {
    let trimmed = path.trim();
    if trimmed.is_empty() {
        return Err("empty layout path".to_string());
    }
    let mut layout = layouts::load_layout_file(std::path::Path::new(trimmed))
        .ok_or_else(|| "failed to parse layout file".to_string())?;

    let mut s = state.inner.lock().unwrap();
    let base_key = layout.key.clone();
    let mut suffix = 1usize;
    while s.layouts.iter().any(|l| l.key == layout.key) {
        layout.key = format!("{base_key}-{}", suffix);
        suffix += 1;
    }
    s.selected_layout_key = Some(layout.key.clone());
    s.layouts.push(layout);
    s.layouts
        .sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    Ok(serde_json::json!({
        "layouts": s.layouts,
        "selectedLayoutKey": s.selected_layout_key
    }))
}

#[tauri::command]
fn control_object_gain(state: State<SharedState>, id: i32, gain: f32) {
    let clamped = gain.max(0.0).min(2.0);
    send_control(
        &state.osc_tx,
        OscControlMsg::SendFloat {
            address: format!("/gsrd/control/object/{id}/gain"),
            value: clamped,
        },
    );
}

#[tauri::command]
fn control_speaker_gain(state: State<SharedState>, id: i32, gain: f32) {
    let clamped = gain.max(0.0).min(2.0);
    send_control(
        &state.osc_tx,
        OscControlMsg::SendFloat {
            address: format!("/gsrd/control/speaker/{id}/gain"),
            value: clamped,
        },
    );
}

#[tauri::command]
fn control_object_mute(state: State<SharedState>, id: i32, muted: i32) {
    send_control(
        &state.osc_tx,
        OscControlMsg::SendInt {
            address: format!("/gsrd/control/object/{id}/mute"),
            value: if muted != 0 { 1 } else { 0 },
        },
    );
}

#[tauri::command]
fn control_speaker_mute(state: State<SharedState>, id: i32, muted: i32) {
    send_control(
        &state.osc_tx,
        OscControlMsg::SendInt {
            address: format!("/gsrd/control/speaker/{id}/mute"),
            value: if muted != 0 { 1 } else { 0 },
        },
    );
}

#[tauri::command]
fn control_master_gain(state: State<SharedState>, gain: f32) {
    let clamped = gain.max(0.0).min(2.0);
    send_control(
        &state.osc_tx,
        OscControlMsg::SendFloat {
            address: "/gsrd/control/gain".to_string(),
            value: clamped,
        },
    );
}

#[tauri::command]
fn control_dialog_norm(state: State<SharedState>, enable: i32) {
    send_control(
        &state.osc_tx,
        OscControlMsg::SendInt {
            address: "/gsrd/control/dialog_norm".to_string(),
            value: if enable != 0 { 1 } else { 0 },
        },
    );
}

#[tauri::command]
fn control_spread_min(state: State<SharedState>, value: f32) {
    let clamped = value.max(0.0).min(1.0);
    send_control(
        &state.osc_tx,
        OscControlMsg::SendFloat {
            address: "/gsrd/control/spread/min".to_string(),
            value: clamped,
        },
    );
}

#[tauri::command]
fn control_spread_max(state: State<SharedState>, value: f32) {
    let clamped = value.max(0.0).min(1.0);
    send_control(
        &state.osc_tx,
        OscControlMsg::SendFloat {
            address: "/gsrd/control/spread/max".to_string(),
            value: clamped,
        },
    );
}

#[tauri::command]
fn control_distance_diffuse_enabled(state: State<SharedState>, enable: i32) {
    send_control(
        &state.osc_tx,
        OscControlMsg::SendInt {
            address: "/gsrd/control/distance_diffuse/enabled".to_string(),
            value: if enable != 0 { 1 } else { 0 },
        },
    );
}

#[tauri::command]
fn control_distance_diffuse_threshold(state: State<SharedState>, value: f32) {
    let v = value.max(0.01);
    send_control(
        &state.osc_tx,
        OscControlMsg::SendFloat {
            address: "/gsrd/control/distance_diffuse/threshold".to_string(),
            value: v,
        },
    );
}

#[tauri::command]
fn control_distance_diffuse_curve(state: State<SharedState>, value: f32) {
    let v = value.max(0.0);
    send_control(
        &state.osc_tx,
        OscControlMsg::SendFloat {
            address: "/gsrd/control/distance_diffuse/curve".to_string(),
            value: v,
        },
    );
}

#[tauri::command]
fn control_room_ratio(state: State<SharedState>, width: f32, length: f32, height: f32) {
    let w = width.max(0.01);
    let l = length.max(0.01);
    let h = height.max(0.01);
    send_control(
        &state.osc_tx,
        OscControlMsg::SendFloats3 {
            address: "/gsrd/control/room_ratio".to_string(),
            a: w,
            b: l,
            c: h,
        },
    );
}

#[tauri::command]
fn control_room_ratio_rear(state: State<SharedState>, value: f32) {
    let v = value.max(0.01);
    send_control(
        &state.osc_tx,
        OscControlMsg::SendFloat {
            address: "/gsrd/control/room_ratio_rear".to_string(),
            value: v,
        },
    );
}

#[tauri::command]
fn control_layout_radius_m(state: State<SharedState>, value: f32) {
    let v = value.max(0.01);
    send_control(
        &state.osc_tx,
        OscControlMsg::SendFloat {
            address: "/gsrd/control/layout/radius_m".to_string(),
            value: v,
        },
    );
}

#[tauri::command]
fn control_speaker_az(state: State<SharedState>, id: i32, value: f32) {
    send_control(
        &state.osc_tx,
        OscControlMsg::SendFloat {
            address: format!("/gsrd/control/speaker/{id}/az"),
            value,
        },
    );
}

#[tauri::command]
fn control_speaker_el(state: State<SharedState>, id: i32, value: f32) {
    send_control(
        &state.osc_tx,
        OscControlMsg::SendFloat {
            address: format!("/gsrd/control/speaker/{id}/el"),
            value,
        },
    );
}

#[tauri::command]
fn control_speaker_distance(state: State<SharedState>, id: i32, value: f32) {
    send_control(
        &state.osc_tx,
        OscControlMsg::SendFloat {
            address: format!("/gsrd/control/speaker/{id}/distance"),
            value,
        },
    );
}

#[tauri::command]
fn control_speaker_delay(state: State<SharedState>, id: i32, delay_ms: f32) {
    let v = delay_ms.max(0.0);
    send_control(
        &state.osc_tx,
        OscControlMsg::SendFloat {
            address: format!("/gsrd/control/speaker/{id}/delay"),
            value: v,
        },
    );
}

#[tauri::command]
fn control_speaker_spatialize(state: State<SharedState>, id: i32, spatialize: i32) {
    send_control(
        &state.osc_tx,
        OscControlMsg::SendInt {
            address: format!("/gsrd/control/speaker/{id}/spatialize"),
            value: if spatialize != 0 { 1 } else { 0 },
        },
    );
}

#[tauri::command]
fn control_speaker_name(state: State<SharedState>, id: i32, name: String) {
    let trimmed = name.trim();
    if trimmed.is_empty() {
        return;
    }
    send_control(
        &state.osc_tx,
        OscControlMsg::SendString {
            address: format!("/gsrd/control/speaker/{id}/name"),
            value: trimmed.to_string(),
        },
    );
}

#[tauri::command]
fn control_speakers_apply(state: State<SharedState>) {
    send_control(
        &state.osc_tx,
        OscControlMsg::SendNoArgs {
            address: "/gsrd/control/speakers/apply".to_string(),
        },
    );
}

#[tauri::command]
fn control_speakers_add(
    state: State<SharedState>,
    name: String,
    azimuth: f32,
    elevation: f32,
    distance: f32,
    spatialize: i32,
    delay_ms: f32,
) {
    let n = if name.trim().is_empty() { "speaker" } else { name.trim() };
    send_control(
        &state.osc_tx,
        OscControlMsg::SendSpeakerAdd {
            name: n.to_string(),
            azimuth,
            elevation,
            distance: distance.max(0.01),
            spatialize: if spatialize != 0 { 1 } else { 0 },
            delay_ms: delay_ms.max(0.0),
        },
    );
}

#[tauri::command]
fn control_speakers_remove(state: State<SharedState>, index: i32) {
    send_control(
        &state.osc_tx,
        OscControlMsg::SendInt {
            address: "/gsrd/control/speakers/remove".to_string(),
            value: index.max(0),
        },
    );
}

#[tauri::command]
fn control_speakers_move(state: State<SharedState>, from: i32, to: i32) {
    send_control(&state.osc_tx, OscControlMsg::SendSpeakersMove { from, to });
}

#[tauri::command]
fn control_save_config(state: State<SharedState>) {
    send_control(
        &state.osc_tx,
        OscControlMsg::SendNoArgs {
            address: "/gsrd/control/save_config".to_string(),
        },
    );
}

#[tauri::command]
fn control_export_layout(state: State<SharedState>, name: Option<String>) {
    if let Some(raw) = name {
        let trimmed = raw.trim();
        if !trimmed.is_empty() {
            send_control(
                &state.osc_tx,
                OscControlMsg::SendString {
                    address: "/gsrd/control/layout/export".to_string(),
                    value: trimmed.to_string(),
                },
            );
            return;
        }
    }
    send_control(
        &state.osc_tx,
        OscControlMsg::SendNoArgs {
            address: "/gsrd/control/layout/export".to_string(),
        },
    );
}

#[tauri::command]
fn control_audio_sample_rate(state: State<SharedState>, sample_rate: i32) {
    send_control(
        &state.osc_tx,
        OscControlMsg::SendInt {
            address: "/gsrd/control/audio/sample_rate".to_string(),
            value: sample_rate.max(0),
        },
    );
}

// ── main ─────────────────────────────────────────────────────────────────

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let config_dir = app
                .path()
                .app_config_dir()
                .expect("could not resolve app config dir");

            let osc_cfg = load_config(&config_dir);

            // layouts dir: bundled as a resource
            let layouts_dir = app
                .path()
                .resource_dir()
                .map(|d| d.join("layouts"))
                .unwrap_or_else(|_| PathBuf::from("layouts"));

            let loaded_layouts = layouts::load_layouts(&layouts_dir);

            let app_state = Arc::new(Mutex::new(AppState::new(loaded_layouts)));
            let osc_tx: Arc<Mutex<Option<UnboundedSender<OscControlMsg>>>> =
                Arc::new(Mutex::new(None));
            let listen_port = Arc::new(Mutex::new(0u16));

            let (tx, rx) = tokio::sync::mpsc::unbounded_channel::<OscControlMsg>();
            *osc_tx.lock().unwrap() = Some(tx);

            let shared = SharedState {
                inner: app_state.clone(),
                osc_tx: osc_tx.clone(),
                config_dir,
                listen_port: listen_port.clone(),
            };
            app.manage(shared);

            spawn_osc_task(
                app.handle().clone(),
                app_state,
                osc_cfg.host,
                osc_cfg.osc_port,
                osc_cfg.osc_rx_port,
                rx,
                listen_port.clone(),
            );

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_state,
            get_osc_config,
            save_osc_config,
            select_layout,
            import_layout_from_path,
            control_object_gain,
            control_speaker_gain,
            control_object_mute,
            control_speaker_mute,
            control_master_gain,
            control_dialog_norm,
            control_spread_min,
            control_spread_max,
            control_distance_diffuse_enabled,
            control_distance_diffuse_threshold,
            control_distance_diffuse_curve,
            control_room_ratio,
            control_room_ratio_rear,
            control_layout_radius_m,
            control_speaker_az,
            control_speaker_el,
            control_speaker_distance,
            control_speaker_delay,
            control_speaker_spatialize,
            control_speaker_name,
            control_speakers_apply,
            control_speakers_add,
            control_speakers_remove,
            control_speakers_move,
            control_save_config,
            control_export_layout,
            control_audio_sample_rate,
        ])
        .run(tauri::generate_context!())
        .expect("error running Tauri application");
}
