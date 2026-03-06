use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::layouts::Layout;

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct SourcePosition {
    pub x: f64,
    pub y: f64,
    pub z: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct Meter {
    #[serde(rename = "peakDbfs")]
    pub peak_dbfs: f64,
    #[serde(rename = "rmsDbfs")]
    pub rms_dbfs: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RoomRatio {
    pub width: f64,
    pub length: f64,
    pub height: f64,
    pub rear: f64,
}

impl Default for RoomRatio {
    fn default() -> Self {
        Self {
            width: 1.0,
            length: 2.0,
            height: 1.0,
            rear: 1.0,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct SpreadState {
    pub min: Option<f64>,
    pub max: Option<f64>,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct DistanceDiffuse {
    pub enabled: Option<bool>,
    pub threshold: Option<f64>,
    pub curve: Option<f64>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AppState {
    pub sources: HashMap<String, SourcePosition>,
    #[serde(rename = "sourceLevels")]
    pub source_levels: HashMap<String, Meter>,
    #[serde(rename = "speakerLevels")]
    pub speaker_levels: HashMap<String, Meter>,
    #[serde(rename = "objectSpeakerGains")]
    pub object_speaker_gains: HashMap<String, Vec<f64>>,
    #[serde(rename = "objectGains")]
    pub object_gains: HashMap<String, f64>,
    #[serde(rename = "speakerGains")]
    pub speaker_gains: HashMap<String, f64>,
    #[serde(rename = "objectMutes")]
    pub object_mutes: HashMap<String, u8>,
    #[serde(rename = "speakerMutes")]
    pub speaker_mutes: HashMap<String, u8>,
    #[serde(rename = "roomRatio")]
    pub room_ratio: RoomRatio,
    pub spread: SpreadState,
    #[serde(rename = "dialogNorm")]
    pub dialog_norm: Option<u8>,
    #[serde(rename = "dialogNormLevel")]
    pub dialog_norm_level: Option<f64>,
    #[serde(rename = "dialogNormGain")]
    pub dialog_norm_gain: Option<f64>,
    #[serde(rename = "masterGain")]
    pub master_gain: Option<f64>,
    #[serde(rename = "distanceDiffuse")]
    pub distance_diffuse: DistanceDiffuse,
    #[serde(rename = "configSaved")]
    pub config_saved: Option<u8>,
    #[serde(rename = "latencyMs")]
    pub latency_ms: Option<i64>,
    #[serde(rename = "resampleRatio")]
    pub resample_ratio: Option<f64>,
    #[serde(rename = "audioSampleRate")]
    pub audio_sample_rate: Option<u32>,
    #[serde(rename = "audioSampleFormat")]
    pub audio_sample_format: Option<String>,
    #[serde(rename = "oscStatus")]
    pub osc_status: Option<String>,
    #[serde(rename = "lastSpatialSamplePos")]
    pub last_spatial_sample_pos: Option<i64>,
    pub layouts: Vec<Layout>,
    #[serde(rename = "selectedLayoutKey")]
    pub selected_layout_key: Option<String>,
}

impl AppState {
    pub fn new(layouts: Vec<Layout>) -> Self {
        let selected_layout_key = layouts.first().map(|l| l.key.clone());
        Self {
            layouts,
            selected_layout_key,
            room_ratio: RoomRatio {
                width: 1.0,
                length: 2.0,
                height: 1.0,
                rear: 1.0,
            },
            ..Default::default()
        }
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            sources: HashMap::new(),
            source_levels: HashMap::new(),
            speaker_levels: HashMap::new(),
            object_speaker_gains: HashMap::new(),
            object_gains: HashMap::new(),
            speaker_gains: HashMap::new(),
            object_mutes: HashMap::new(),
            speaker_mutes: HashMap::new(),
            room_ratio: RoomRatio::default(),
            spread: SpreadState::default(),
            dialog_norm: None,
            dialog_norm_level: None,
            dialog_norm_gain: None,
            master_gain: None,
            distance_diffuse: DistanceDiffuse::default(),
            config_saved: None,
            latency_ms: None,
            resample_ratio: None,
            audio_sample_rate: None,
            audio_sample_format: None,
            osc_status: Some("initializing".to_string()),
            last_spatial_sample_pos: None,
            layouts: Vec::new(),
            selected_layout_key: None,
        }
    }
}
