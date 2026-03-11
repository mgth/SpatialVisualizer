use serde::{Deserialize, Serialize};
use std::path::Path;

// ── types ─────────────────────────────────────────────────────────────────

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Speaker {
    pub id: String,
    pub x: f64,
    pub y: f64,
    pub z: f64,
    #[serde(default = "default_spatialize")]
    pub spatialize: u8,
    #[serde(default)]
    pub delay_ms: f64,
}

fn default_radius_m() -> f64 {
    1.0
}
fn default_spatialize() -> u8 {
    1
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Layout {
    pub key: String,
    pub name: String,
    pub speakers: Vec<Speaker>,
    /// Physical radius of the speaker array in metres.
    /// Used by the visualizer to convert normalised distances to real delays.
    /// Defaults to 1.0 when absent from the layout file.
    #[serde(default = "default_radius_m")]
    pub radius_m: f64,
}

// ── helpers ───────────────────────────────────────────────────────────────

fn clamp(v: f64, min: f64, max: f64) -> f64 {
    v.max(min).min(max)
}

fn spherical_to_cartesian(az_deg: f64, el_deg: f64, dist: f64) -> (f64, f64, f64) {
    let az = az_deg.to_radians();
    let el = el_deg.to_radians();
    (
        dist * el.cos() * az.cos(),
        dist * el.sin(),
        dist * el.cos() * az.sin(),
    )
}

// ── raw deserialization types ─────────────────────────────────────────────

#[derive(Deserialize, Debug, Default)]
struct RawSpeaker {
    #[serde(default)]
    id: Option<serde_json::Value>,
    #[serde(default)]
    name: Option<serde_json::Value>,
    #[serde(default)]
    x: Option<f64>,
    #[serde(default)]
    y: Option<f64>,
    #[serde(default)]
    z: Option<f64>,
    #[serde(default)]
    azimuth: Option<f64>,
    #[serde(default)]
    az: Option<f64>,
    #[serde(default)]
    elevation: Option<f64>,
    #[serde(default)]
    el: Option<f64>,
    #[serde(default)]
    distance: Option<f64>,
    #[serde(default)]
    dist: Option<f64>,
    #[serde(default)]
    delay_ms: Option<f64>,
    #[serde(default)]
    delay: Option<f64>,
    #[serde(default)]
    spatialize: Option<serde_json::Value>,
}

#[derive(Deserialize, Debug, Default)]
struct RawLayout {
    #[serde(default)]
    name: Option<String>,
    #[serde(default)]
    radius_m: Option<f64>,
    #[serde(default)]
    speakers: Vec<RawSpeaker>,
}

fn normalize_speaker(raw: RawSpeaker) -> Speaker {
    let id = {
        let v = raw.id.or(raw.name);
        match v {
            Some(serde_json::Value::String(s)) => s,
            Some(serde_json::Value::Number(n)) => n.to_string(),
            _ => "spk".to_string(),
        }
    };

    let delay_ms = raw.delay_ms.or(raw.delay).unwrap_or(0.0).max(0.0);
    let spatialize = match raw.spatialize {
        Some(serde_json::Value::Bool(v)) => {
            if v {
                1
            } else {
                0
            }
        }
        Some(serde_json::Value::Number(v)) => {
            if v.as_f64().unwrap_or(1.0) != 0.0 {
                1
            } else {
                0
            }
        }
        Some(serde_json::Value::String(v)) => {
            if v == "0" || v.eq_ignore_ascii_case("false") {
                0
            } else {
                1
            }
        }
        _ => 1,
    };

    if let (Some(x), Some(y), Some(z)) = (raw.x, raw.y, raw.z) {
        return Speaker {
            id,
            x: clamp(x, -1.0, 1.0),
            y: clamp(y, -1.0, 1.0),
            z: clamp(z, -1.0, 1.0),
            spatialize,
            delay_ms,
        };
    }

    let az = raw.azimuth.or(raw.az).unwrap_or(0.0);
    let el = raw.elevation.or(raw.el).unwrap_or(0.0);
    let dist = raw.distance.or(raw.dist).unwrap_or(1.0);
    let (x, y, z) = spherical_to_cartesian(az, el, dist);

    Speaker {
        id,
        x: clamp(x, -1.0, 1.0),
        y: clamp(y, -1.0, 1.0),
        z: clamp(z, -1.0, 1.0),
        spatialize,
        delay_ms,
    }
}

// ── YAML parser (minimal, mirrors layouts.js implementation) ──────────────

fn parse_yaml_value(raw: &str) -> serde_json::Value {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return serde_json::Value::String(String::new());
    }
    if (trimmed.starts_with('"') && trimmed.ends_with('"'))
        || (trimmed.starts_with('\'') && trimmed.ends_with('\''))
    {
        return serde_json::Value::String(trimmed[1..trimmed.len() - 1].to_string());
    }
    if trimmed == "true" {
        return serde_json::Value::Bool(true);
    }
    if trimmed == "false" {
        return serde_json::Value::Bool(false);
    }
    if let Ok(n) = trimmed.parse::<f64>() {
        if let Some(v) = serde_json::Number::from_f64(n) {
            return serde_json::Value::Number(v);
        }
    }
    serde_json::Value::String(trimmed.to_string())
}

fn parse_yaml_layout(text: &str) -> RawLayout {
    let mut speakers: Vec<serde_json::Map<String, serde_json::Value>> = Vec::new();
    let mut current: Option<serde_json::Map<String, serde_json::Value>> = None;
    let mut in_speakers_block = false;
    let mut top_level: serde_json::Map<String, serde_json::Value> = serde_json::Map::new();

    for line in text.lines() {
        // strip inline comments
        let without_comment = {
            // find whitespace followed by '#'
            let mut result = line;
            let bytes = line.as_bytes();
            for i in 0..bytes.len() {
                if bytes[i] == b'#' && i > 0 && (bytes[i - 1] == b' ' || bytes[i - 1] == b'\t') {
                    result = &line[..i];
                    break;
                }
            }
            result
        };
        let trimmed = without_comment.trim();
        if trimmed.is_empty() {
            continue;
        }
        if trimmed == "speakers:" {
            in_speakers_block = true;
            if let Some(c) = current.take() {
                speakers.push(c);
            }
            continue;
        }
        if !in_speakers_block {
            // Capture top-level scalars (name, radius_m, …).
            if let Some(sep) = trimmed.find(':') {
                let key = trimmed[..sep].trim().to_string();
                let val = parse_yaml_value(&trimmed[sep + 1..]);
                top_level.insert(key, val);
            }
            continue;
        }
        if let Some(rest) = trimmed.strip_prefix("- ") {
            if let Some(c) = current.take() {
                speakers.push(c);
            }
            let mut map = serde_json::Map::new();
            let rest = rest.trim();
            if !rest.is_empty() {
                if let Some(sep) = rest.find(':') {
                    let key = rest[..sep].trim().to_string();
                    let val = parse_yaml_value(&rest[sep + 1..]);
                    map.insert(key, val);
                }
            }
            current = Some(map);
            continue;
        }
        if let Some(map) = current.as_mut() {
            if let Some(sep) = trimmed.find(':') {
                let key = trimmed[..sep].trim().to_string();
                let val = parse_yaml_value(&trimmed[sep + 1..]);
                map.insert(key, val);
            }
        }
    }
    if let Some(c) = current.take() {
        speakers.push(c);
    }

    let raw_speakers = speakers
        .into_iter()
        .map(|map| serde_json::from_value(serde_json::Value::Object(map)).unwrap_or_default())
        .collect();

    let name = top_level
        .get("name")
        .and_then(|v| v.as_str())
        .map(str::to_owned);
    let radius_m = top_level.get("radius_m").and_then(|v| v.as_f64());

    RawLayout {
        name,
        radius_m,
        speakers: raw_speakers,
    }
}

// ── public API ────────────────────────────────────────────────────────────

pub fn load_layouts(layouts_dir: &Path) -> Vec<Layout> {
    if !layouts_dir.exists() {
        return Vec::new();
    }

    let entries = match std::fs::read_dir(layouts_dir) {
        Ok(e) => e,
        Err(_) => return Vec::new(),
    };

    let mut files: Vec<std::path::PathBuf> = entries
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| {
            matches!(
                p.extension()
                    .and_then(|e| e.to_str())
                    .map(|e| e.to_lowercase())
                    .as_deref(),
                Some("json") | Some("yaml") | Some("yml")
            )
        })
        .collect();

    files.sort_by_key(|p| p.file_name().map(|n| n.to_os_string()));

    // detect duplicate stems
    let mut stem_counts: std::collections::HashMap<String, usize> =
        std::collections::HashMap::new();
    for path in &files {
        let ext = path
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
            .to_lowercase();
        let stem = path
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("")
            .to_string();
        let stem_key = format!("{stem}.{ext}");
        *stem_counts.entry(stem.clone()).or_insert(0) += 1;
        let _ = stem_key;
    }

    let mut layouts: Vec<Layout> = files
        .iter()
        .filter_map(|path| {
            let ext = path.extension().and_then(|e| e.to_str())?.to_lowercase();
            let stem = path.file_stem().and_then(|s| s.to_str())?.to_string();
            let text = std::fs::read_to_string(path).ok()?;

            let raw: RawLayout = if ext == "json" {
                serde_json::from_str(&text).unwrap_or_default()
            } else {
                parse_yaml_layout(&text)
            };

            let has_dup = *stem_counts.get(&stem).unwrap_or(&0) > 1;
            let key = if has_dup {
                format!("{stem}-{ext}")
            } else {
                stem.clone()
            };
            let name = raw.name.clone().unwrap_or_else(|| {
                if has_dup {
                    format!("{stem} ({ext})")
                } else {
                    stem.clone()
                }
            });

            let speakers = raw.speakers.into_iter().map(normalize_speaker).collect();
            let radius_m = raw.radius_m.unwrap_or(1.0).max(0.01);
            Some(Layout {
                key,
                name,
                speakers,
                radius_m,
            })
        })
        .collect();

    layouts.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    layouts
}

pub fn load_layout_file(path: &Path) -> Option<Layout> {
    let ext = path.extension().and_then(|e| e.to_str())?.to_lowercase();
    if ext != "json" && ext != "yaml" && ext != "yml" {
        return None;
    }
    let stem = path.file_stem().and_then(|s| s.to_str())?.to_string();
    let text = std::fs::read_to_string(path).ok()?;
    let raw: RawLayout = if ext == "json" {
        serde_json::from_str(&text).unwrap_or_default()
    } else {
        parse_yaml_layout(&text)
    };
    let name = raw.name.clone().unwrap_or_else(|| stem.clone());
    let speakers = raw.speakers.into_iter().map(normalize_speaker).collect();
    let radius_m = raw.radius_m.unwrap_or(1.0).max(0.01);
    Some(Layout {
        key: stem,
        name,
        speakers,
        radius_m,
    })
}

/// Build a live layout from a list of config:speaker events.
pub fn build_live_layout(speakers: &[crate::osc_parser::OscEvent]) -> Option<Layout> {
    use crate::osc_parser::OscEvent;

    let mut sorted: Vec<_> = speakers
        .iter()
        .filter_map(|ev| {
            if let OscEvent::ConfigSpeaker {
                index,
                name,
                azimuth_deg,
                elevation_deg,
                distance_m,
                delay_ms,
                spatialize,
                position,
            } = ev
            {
                Some((
                    *index,
                    name.clone(),
                    position.clone(),
                    *spatialize,
                    *azimuth_deg,
                    *elevation_deg,
                    *distance_m,
                    *delay_ms,
                ))
            } else {
                None
            }
        })
        .collect();

    if sorted.is_empty() {
        return None;
    }
    sorted.sort_by_key(|(idx, ..)| *idx);

    let spk_list = sorted
        .into_iter()
        .map(|(_, name, pos, spatialize, _, _, _, delay_ms)| Speaker {
            id: name,
            x: pos.x,
            y: pos.y,
            z: pos.z,
            spatialize,
            delay_ms,
        })
        .collect();

    Some(Layout {
        key: "gsrd-live".to_string(),
        name: "gsrd (live)".to_string(),
        speakers: spk_list,
        radius_m: 1.0,
    })
}
