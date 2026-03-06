use rosc::OscType;
use serde::Serialize;

// ── helpers ─────────────────────────────────────────────────────────────────

fn unwrap_arg(arg: &OscType) -> f64 {
    match arg {
        OscType::Float(v) => *v as f64,
        OscType::Double(v) => *v,
        OscType::Int(v) => *v as f64,
        OscType::Long(v) => *v as f64,
        _ => f64::NAN,
    }
}

fn unwrap_string(arg: &OscType) -> Option<String> {
    match arg {
        OscType::String(s) => Some(s.clone()),
        _ => None,
    }
}

fn to_number(v: f64) -> Option<f64> {
    if v.is_finite() {
        Some(v)
    } else {
        None
    }
}

fn clamp(v: f64, min: f64, max: f64) -> f64 {
    v.max(min).min(max)
}

fn spherical_to_cartesian(az_deg: f64, el_deg: f64, dist: f64) -> (f64, f64, f64) {
    let az = az_deg.to_radians();
    let el = el_deg.to_radians();
    let x = dist * el.cos() * az.cos();
    let y = dist * el.sin();
    let z = dist * el.cos() * az.sin();
    (x, y, z)
}

fn gsrd_speaker_to_scene(az_deg: f64, el_deg: f64, dist: f64) -> (f64, f64, f64) {
    spherical_to_cartesian(az_deg, el_deg, dist)
}

fn find_id_in_address(parts: &[&str]) -> Option<String> {
    let anchors = ["source", "sources", "object", "obj", "track", "channel"];
    let reserved: std::collections::HashSet<&str> = [
        "position",
        "pos",
        "xyz",
        "aed",
        "spherical",
        "polar",
        "angles",
        "remove",
        "delete",
        "off",
    ]
    .iter()
    .copied()
    .collect();

    for i in 0..parts.len().saturating_sub(1) {
        if anchors.contains(&parts[i]) {
            let candidate = parts[i + 1];
            if !reserved.contains(candidate) {
                return Some(candidate.to_string());
            }
        }
    }
    None
}

// ── return types ────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Clone)]
pub struct Position {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

#[derive(Debug, Serialize, Clone)]
pub struct SpeakerPosition {
    pub x: f64,
    pub y: f64,
    pub z: f64,
    #[serde(rename = "azimuthDeg")]
    pub azimuth_deg: f64,
    #[serde(rename = "elevationDeg")]
    pub elevation_deg: f64,
    #[serde(rename = "distanceM")]
    pub distance_m: f64,
}

#[derive(Debug, Serialize, Clone)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum OscEvent {
    #[serde(rename = "spatial:frame")]
    SpatialFrame {
        #[serde(rename = "samplePos")]
        sample_pos: i64,
        #[serde(rename = "objectCount")]
        object_count: u32,
    },

    #[serde(rename = "update")]
    Update {
        id: String,
        position: Position,
        #[serde(skip_serializing_if = "Option::is_none")]
        name: Option<String>,
    },
    #[serde(rename = "remove")]
    Remove { id: String },

    #[serde(rename = "config:speakers:count")]
    ConfigSpeakersCount { count: u32 },

    #[serde(rename = "config:speaker")]
    ConfigSpeaker {
        index: u32,
        name: String,
        #[serde(rename = "azimuthDeg")]
        azimuth_deg: f64,
        #[serde(rename = "elevationDeg")]
        elevation_deg: f64,
        #[serde(rename = "distanceM")]
        distance_m: f64,
        #[serde(rename = "delayMs")]
        delay_ms: f64,
        spatialize: u8,
        position: SpeakerPosition,
    },

    #[serde(rename = "meter:object")]
    MeterObject {
        id: String,
        #[serde(rename = "peakDbfs")]
        peak_dbfs: f64,
        #[serde(rename = "rmsDbfs")]
        rms_dbfs: f64,
    },

    #[serde(rename = "meter:object:gains")]
    MeterObjectGains { id: String, gains: Vec<f64> },

    #[serde(rename = "meter:speaker")]
    MeterSpeaker {
        id: String,
        #[serde(rename = "peakDbfs")]
        peak_dbfs: f64,
        #[serde(rename = "rmsDbfs")]
        rms_dbfs: f64,
    },

    #[serde(rename = "state:object:gain")]
    StateObjectGain { id: String, gain: f64 },
    #[serde(rename = "state:speaker:gain")]
    StateSpeakerGain { id: String, gain: f64 },
    #[serde(rename = "state:speaker:delay")]
    StateSpeakerDelay { id: String, delay_ms: f64 },
    #[serde(rename = "state:object:mute")]
    StateObjectMute { id: String, muted: bool },
    #[serde(rename = "state:speaker:mute")]
    StateSpeakerMute { id: String, muted: bool },
    #[serde(rename = "state:speaker:spatialize")]
    StateSpeakerSpatialize { id: String, spatialize: bool },
    #[serde(rename = "state:speaker:name")]
    StateSpeakerName { id: String, name: String },

    #[serde(rename = "state:room_ratio")]
    StateRoomRatio {
        width: f64,
        length: f64,
        height: f64,
    },
    #[serde(rename = "state:room_ratio:rear")]
    StateRoomRatioRear { value: f64 },
    #[serde(rename = "state:layout:radius_m")]
    StateLayoutRadiusM { value: f64 },
    #[serde(rename = "state:spread:min")]
    StateSpreadMin { value: f64 },
    #[serde(rename = "state:spread:max")]
    StateSpreadMax { value: f64 },
    #[serde(rename = "state:dialog_norm")]
    StateDialogNorm { enabled: bool },
    #[serde(rename = "state:dialog_norm:level")]
    StateDialogNormLevel { value: f64 },
    #[serde(rename = "state:dialog_norm:gain")]
    StateDialogNormGain { value: f64 },
    #[serde(rename = "state:master:gain")]
    StateMasterGain { value: f64 },
    #[serde(rename = "state:latency")]
    StateLatency { value: f64 },
    #[serde(rename = "state:resample_ratio")]
    StateResampleRatio { value: f64 },
    #[serde(rename = "state:audio:sample_rate")]
    StateAudioSampleRate { value: u32 },
    #[serde(rename = "state:audio:sample_format")]
    StateAudioSampleFormat { value: String },
    #[serde(rename = "state:distance_diffuse:enabled")]
    StateDistanceDiffuseEnabled { enabled: bool },
    #[serde(rename = "state:distance_diffuse:threshold")]
    StateDistanceDiffuseThreshold { value: f64 },
    #[serde(rename = "state:distance_diffuse:curve")]
    StateDistanceDiffuseCurve { value: f64 },
    #[serde(rename = "state:config:saved")]
    StateConfigSaved { saved: bool },
}

// ── sub-parsers ─────────────────────────────────────────────────────────────

fn parse_gsrd_config(parts: &[&str], args: &[f64], raw_args: &[OscType]) -> Option<OscEvent> {
    if !parts.contains(&"gsrd") || !parts.contains(&"config") {
        return None;
    }

    if parts.len() == 3 && parts[2] == "speakers" {
        let count = args.first().copied().and_then(to_number)? as u32;
        return Some(OscEvent::ConfigSpeakersCount { count });
    }

    if parts.len() == 4 && parts[2] == "speaker" {
        let index = parts[3].parse::<u32>().ok()?;
        // raw_args: name, az, el, dist, spatialize
        let name = raw_args
            .first()
            .and_then(unwrap_string)
            .unwrap_or_else(|| format!("spk-{index}"));
        let az = args.get(1).copied().and_then(to_number)?;
        let el = args.get(2).copied().and_then(to_number)?;
        let dist = args.get(3).copied().and_then(to_number)?;
        let spatialize_raw = args.get(4).copied().and_then(to_number);
        let spatialize = match spatialize_raw {
            None => 1u8,
            Some(v) => {
                if v != 0.0 {
                    1
                } else {
                    0
                }
            }
        };
        let (px, py, pz) = gsrd_speaker_to_scene(az, el, dist);
        let delay_ms = args
            .get(5)
            .copied()
            .and_then(to_number)
            .unwrap_or(0.0)
            .max(0.0);

        return Some(OscEvent::ConfigSpeaker {
            index,
            name,
            azimuth_deg: az,
            elevation_deg: el,
            distance_m: dist,
            delay_ms,
            spatialize,
            position: SpeakerPosition {
                x: px,
                y: py,
                z: pz,
                azimuth_deg: az,
                elevation_deg: el,
                distance_m: dist,
            },
        });
    }

    None
}

fn parse_gsrd_object_xyz(parts: &[&str], args: &[f64], raw_args: &[OscType]) -> Option<OscEvent> {
    if !parts.contains(&"gsrd") || !parts.contains(&"object") || !parts.contains(&"xyz") {
        return None;
    }

    let id = find_id_in_address(parts)?;
    let x = to_number(args[0])?;
    let y = to_number(args[1])?;
    let z = to_number(args[2])?;

    // name at arg index 7
    let name = raw_args
        .get(7)
        .and_then(|a| unwrap_string(a))
        .filter(|s| !s.trim().is_empty());

    // gsrd xyz: x=right, y=front, z=up → scene: x=front, y=up, z=right
    let (mx, my, mz) = (y, z, x);

    Some(OscEvent::Update {
        id,
        position: Position {
            x: clamp(mx, -1.0, 1.0),
            y: clamp(my, -1.0, 1.0),
            z: clamp(mz, -1.0, 1.0),
        },
        name,
    })
}

fn parse_gsrd_spatial_frame(parts: &[&str], args: &[f64]) -> Option<OscEvent> {
    if parts.len() != 3 || parts[0] != "gsrd" || parts[1] != "spatial" || parts[2] != "frame" {
        return None;
    }
    let sample_pos = to_number(args[0])? as i64;
    let object_count_raw = to_number(args[1])?;
    let object_count = object_count_raw.max(0.0) as u32;
    Some(OscEvent::SpatialFrame {
        sample_pos,
        object_count,
    })
}

fn parse_gsrd_state(parts: &[&str], args: &[f64], raw_args: &[OscType]) -> Option<OscEvent> {
    if parts.len() < 3 || parts[0] != "gsrd" || parts[1] != "state" {
        return None;
    }

    match (parts.len(), parts[2]) {
        (3, "latency") => Some(OscEvent::StateLatency {
            value: to_number(args[0])?,
        }),
        (3, "resample_ratio") => Some(OscEvent::StateResampleRatio {
            value: to_number(args[0])?,
        }),
        (3, "gain") => Some(OscEvent::StateMasterGain {
            value: to_number(args[0])?,
        }),
        (3, "dialog_norm") => Some(OscEvent::StateDialogNorm {
            enabled: to_number(args[0])? != 0.0,
        }),
        (3, "room_ratio") => {
            let w = to_number(args[0])?;
            let l = to_number(args[1])?;
            let h = to_number(args[2])?;
            Some(OscEvent::StateRoomRatio {
                width: w,
                length: l,
                height: h,
            })
        }
        (3, "room_ratio_rear") => Some(OscEvent::StateRoomRatioRear {
            value: to_number(args[0])?,
        }),
        (4, "layout") if parts[3] == "radius_m" => Some(OscEvent::StateLayoutRadiusM {
            value: to_number(args[0])?,
        }),
        (4, "dialog_norm") => {
            let value = to_number(args[0])?;
            match parts[3] {
                "level" => Some(OscEvent::StateDialogNormLevel { value }),
                "gain" => Some(OscEvent::StateDialogNormGain { value }),
                _ => None,
            }
        }
        (4, "spread") => {
            let value = to_number(args[0])?;
            match parts[3] {
                "min" => Some(OscEvent::StateSpreadMin { value }),
                "max" => Some(OscEvent::StateSpreadMax { value }),
                _ => None,
            }
        }
        (4, "distance_diffuse") => match parts[3] {
            "enabled" => Some(OscEvent::StateDistanceDiffuseEnabled {
                enabled: to_number(args[0])? != 0.0,
            }),
            "threshold" => Some(OscEvent::StateDistanceDiffuseThreshold {
                value: to_number(args[0])?,
            }),
            "curve" => Some(OscEvent::StateDistanceDiffuseCurve {
                value: to_number(args[0])?,
            }),
            _ => None,
        },
        (4, "config") if parts[3] == "saved" => Some(OscEvent::StateConfigSaved {
            saved: to_number(args[0])? != 0.0,
        }),
        (4, "audio") => match parts[3] {
            "sample_rate" => Some(OscEvent::StateAudioSampleRate {
                value: to_number(args[0])?.max(0.0) as u32,
            }),
            "sample_format" => {
                let value = raw_args.first().and_then(unwrap_string)?;
                Some(OscEvent::StateAudioSampleFormat { value })
            }
            _ => None,
        },
        (5, kind) if kind == "object" || kind == "speaker" => match parts[4] {
            "gain" => {
                let id = parts[3].parse::<u32>().ok()?.to_string();
                let gain = clamp(to_number(args[0])?, 0.0, 2.0);
                if kind == "speaker" {
                    Some(OscEvent::StateSpeakerGain { id, gain })
                } else {
                    Some(OscEvent::StateObjectGain { id, gain })
                }
            }
            "delay" if kind == "speaker" => {
                let id = parts[3].parse::<u32>().ok()?.to_string();
                let delay_ms = clamp(to_number(args[0])?, 0.0, 10_000.0);
                Some(OscEvent::StateSpeakerDelay { id, delay_ms })
            }
            "mute" => {
                let id = parts[3].parse::<u32>().ok()?.to_string();
                let muted = to_number(args[0])? != 0.0;
                if kind == "speaker" {
                    Some(OscEvent::StateSpeakerMute { id, muted })
                } else {
                    Some(OscEvent::StateObjectMute { id, muted })
                }
            }
            "spatialize" if kind == "speaker" => {
                let id = parts[3].parse::<u32>().ok()?.to_string();
                let spatialize = to_number(args[0])? != 0.0;
                Some(OscEvent::StateSpeakerSpatialize { id, spatialize })
            }
            "name" if kind == "speaker" => {
                let id = parts[3].parse::<u32>().ok()?.to_string();
                let name = raw_args.first().and_then(unwrap_string)?;
                Some(OscEvent::StateSpeakerName { id, name })
            }
            _ => None,
        },
        _ => None,
    }
}

fn parse_meter(parts: &[&str], args: &[f64]) -> Option<OscEvent> {
    let meter_idx = parts.iter().position(|&p| p == "meter")?;
    let after = &parts[meter_idx..];

    // gains sub-message: meter / object / {id} / gains
    if after.len() >= 4 && after[1] == "object" && after[3] == "gains" {
        let id = after[2].to_string();
        let gains: Vec<f64> = args.iter().map(|&v| clamp(v, 0.0, 1.0)).collect();
        return Some(OscEvent::MeterObjectGains { id, gains });
    }

    if after.len() >= 3 {
        let kind = after[1];
        let id = after[2].to_string();
        let peak = clamp(to_number(args[0]).unwrap_or(-100.0), -100.0, 0.0);
        let rms = clamp(to_number(args[1]).unwrap_or(-100.0), -100.0, 0.0);
        match kind {
            "object" => {
                return Some(OscEvent::MeterObject {
                    id,
                    peak_dbfs: peak,
                    rms_dbfs: rms,
                })
            }
            "speaker" => {
                return Some(OscEvent::MeterSpeaker {
                    id,
                    peak_dbfs: peak,
                    rms_dbfs: rms,
                })
            }
            _ => {}
        }
    }

    None
}

// ── public entry point ───────────────────────────────────────────────────────

pub fn parse_osc_message(address: &str, raw_args: &[OscType]) -> Option<OscEvent> {
    let parts_owned: Vec<String> = address
        .split('/')
        .filter(|s| !s.is_empty())
        .map(|s| s.to_lowercase())
        .collect();
    let parts: Vec<&str> = parts_owned.iter().map(|s| s.as_str()).collect();

    let args: Vec<f64> = raw_args.iter().map(|a| unwrap_arg(a)).collect();

    // config
    if let Some(ev) = parse_gsrd_config(&parts, &args, raw_args) {
        return Some(ev);
    }

    // gsrd object xyz
    if let Some(ev) = parse_gsrd_object_xyz(&parts, &args, raw_args) {
        return Some(ev);
    }

    // gsrd spatial frame
    if let Some(ev) = parse_gsrd_spatial_frame(&parts, &args) {
        return Some(ev);
    }

    // gsrd state
    if let Some(ev) = parse_gsrd_state(&parts, &args, raw_args) {
        return Some(ev);
    }

    // meters
    if parts.contains(&"meter") {
        return parse_meter(&parts, &args);
    }

    // remove
    if parts
        .iter()
        .any(|&p| p == "remove" || p == "delete" || p == "off")
    {
        let id_from_arg = if !args.is_empty() {
            Some(args[0].to_string())
        } else {
            None
        };
        let id = id_from_arg.or_else(|| find_id_in_address(&parts))?;
        return Some(OscEvent::Remove { id });
    }

    // generic position (cartesian / spherical)
    let id = {
        let from_addr = find_id_in_address(&parts);
        if from_addr.is_none() && args.len() >= 4 {
            Some(args[0].to_string())
        } else {
            from_addr
        }
    }?;

    let numeric_args: Vec<f64> = if find_id_in_address(&parts).is_none() && raw_args.len() >= 4 {
        args[1..]
            .iter()
            .copied()
            .filter(|v| v.is_finite())
            .collect()
    } else {
        args.iter().copied().filter(|v| v.is_finite()).collect()
    };

    if numeric_args.len() < 3 {
        return None;
    }

    let has_spherical = parts
        .iter()
        .any(|&p| matches!(p, "aed" | "spherical" | "polar" | "angles"));

    let (x, y, z) = if has_spherical {
        let (px, py, pz) =
            spherical_to_cartesian(numeric_args[0], numeric_args[1], numeric_args[2]);
        (px, py, pz)
    } else {
        (numeric_args[0], numeric_args[1], numeric_args[2])
    };

    Some(OscEvent::Update {
        id,
        position: Position {
            x: clamp(x, -1.0, 1.0),
            y: clamp(y, -1.0, 1.0),
            z: clamp(z, -1.0, 1.0),
        },
        name: None,
    })
}

pub fn is_heartbeat_address(address: &str) -> HeartbeatResponse {
    let lower = address.to_lowercase();
    if lower == "/gsrd/heartbeat/ack" {
        HeartbeatResponse::Ack
    } else if lower == "/gsrd/heartbeat/unknown" {
        HeartbeatResponse::Unknown
    } else {
        HeartbeatResponse::None
    }
}

pub enum HeartbeatResponse {
    Ack,
    Unknown,
    None,
}
