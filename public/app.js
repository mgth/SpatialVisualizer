import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js?module';
import { OrbitControls } from 'https://unpkg.com/three@0.165.0/examples/jsm/controls/OrbitControls.js?module';

const statusEl = document.getElementById('status');
const layoutSelectEl = document.getElementById('layoutSelect');
const speakersListEl = document.getElementById('speakersList');
const objectsListEl = document.getElementById('objectsList');
const speakersSectionEl = document.getElementById('speakersSection');
const objectsSectionEl = document.getElementById('objectsSection');
const roomRatioEl = document.getElementById('roomRatio');
const spreadInfoEl = document.getElementById('spreadInfo');
const dialogNormInfoEl = document.getElementById('dialogNormInfo');
const latencyInfoEl = document.getElementById('latencyInfo');
const resampleRatioInfoEl = document.getElementById('resampleRatioInfo');
const dialogNormToggleEl = document.getElementById('dialogNormToggle');
const latencyMeterFillEl = document.getElementById('latencyMeterFill');
const masterGainSliderEl = document.getElementById('masterGainSlider');
const masterGainBoxEl = document.getElementById('masterGainBox');
const masterMeterTextEl = document.getElementById('masterMeterText');
const masterMeterFillEl = document.getElementById('masterMeterFill');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0b10);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(2.5, 1.8, 3.6);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.update();

const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const directional = new THREE.DirectionalLight(0xffffff, 1);
directional.position.set(3, 4, 2);
scene.add(directional);

const room = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshBasicMaterial({ color: 0x4d6eff, wireframe: true, transparent: true, opacity: 0.2 })
);
scene.add(room);

const roomRatio = { width: 1, length: 2, height: 1 };
const spreadState = { min: null, max: null };
let dialogNormEnabled = null;
let dialogNormLevel = null;
let dialogNormGain = null;
let latencyMs = null;
let resampleRatio = null;
let masterGain = 1;

const axes = new THREE.AxesHelper(1.2);
scene.add(axes);

const sourceMeshes = new Map();
const sourceLabels = new Map();
const sourceOutlines = new Map();
const speakerMeshes = [];
const speakerLabels = [];
const sourceLevels = new Map();
const speakerLevels = new Map();
const sourceGains = new Map();
const speakerGainCache = new Map();
const objectGainCache = new Map();
const speakerBaseGains = new Map();
const objectBaseGains = new Map();
const speakerMuted = new Set();
const objectMuted = new Set();
const speakerItems = new Map();
const objectItems = new Map();
const speakerManualMuted = new Set();
const objectManualMuted = new Set();
const sourceNames = new Map();
const sourcePositionsRaw = new Map();

let selectedSourceId = null;

const sourceMaterial = new THREE.MeshStandardMaterial({
  color: 0xff7c4d,
  emissive: 0x64210c,
  transparent: true,
  opacity: 0.7
});
const sourceGeometry = new THREE.SphereGeometry(0.07, 24, 24);
const speakerGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.08);
const speakerMaterial = new THREE.MeshStandardMaterial({
  color: 0x8ec8ff,
  emissive: 0x10253a,
  transparent: true,
  opacity: 0.65
});

const speakerBaseColor = new THREE.Color(0x8ec8ff);
const speakerHotColor = new THREE.Color(0xff3030);
const sourceDefaultEmissive = new THREE.Color(0x64210c);
const sourceSelectedEmissive = new THREE.Color(0x9b7f22);
const sourceOutlineColor = new THREE.Color(0xd9ecff);
const sourceOutlineSelectedColor = new THREE.Color(0xffde8a);

const layoutsByKey = new Map();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerDownPosition = null;
let currentLayoutKey = null;
let currentLayoutSpeakers = [];

function formatNumber(value, digits = 2) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }
  return value.toFixed(digits);
}

function formatPosition(position) {
  if (!position) {
    return 'x:— y:— z:—';
  }
  const x = Number(position.x);
  const y = Number(position.y);
  const z = Number(position.z);
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
    return 'x:— y:— z:—';
  }

  const az = (Math.atan2(z, x) * 180) / Math.PI;
  const planar = Math.sqrt(x * x + z * z);
  const el = (Math.atan2(y, planar) * 180) / Math.PI;
  const dist = Math.sqrt(x * x + y * y + z * z);

  return `x:${formatNumber(x)} y:${formatNumber(y)} z:${formatNumber(z)} | az:${formatNumber(az, 1)} el:${formatNumber(el, 1)} r:${formatNumber(dist, 2)}`;
}

function formatLevel(meter) {
  if (!meter) {
    return '— dB';
  }
  return `${formatNumber(meter.rmsDbfs, 1)} dB`;
}

function meterToPercent(meter) {
  const db = typeof meter?.rmsDbfs === 'number' ? meter.rmsDbfs : -100;
  const clamped = Math.min(0, Math.max(-100, db));
  return ((clamped + 100) / 100) * 100;
}

function linearToDb(value) {
  const v = Number(value);
  if (!Number.isFinite(v) || v <= 0) {
    return '-∞ dB';
  }
  return `${(20 * Math.log10(v)).toFixed(1)} dB`;
}

function dbToLinear(db) {
  const v = Number(db);
  if (!Number.isFinite(v)) {
    return 0;
  }
  return Math.pow(10, v / 20);
}

function updateMeterUI(entry, meter) {
  if (!entry) return;
  entry.levelText.textContent = formatLevel(meter);
  entry.meterFill.style.setProperty('--level', `${meterToPercent(meter).toFixed(1)}%`);
}

function updateItemClasses(entry, isMuted, isDimmed) {
  entry.root.classList.toggle('is-muted', isMuted);
  entry.root.classList.toggle('is-dimmed', isDimmed);
}

function updateSpeakerMeterUI(id) {
  const entry = speakerItems.get(id);
  if (!entry) return;
  updateMeterUI(entry, speakerLevels.get(id));
}

function updateObjectMeterUI(id) {
  const entry = objectItems.get(id);
  if (!entry) return;
  updateMeterUI(entry, sourceLevels.get(id));
}

function updateObjectPositionUI(id, position) {
  const entry = objectItems.get(id);
  if (!entry) return;
  entry.position.textContent = formatPosition(position);
}

function updateObjectLabelUI(id) {
  const entry = objectItems.get(id);
  if (!entry) return;
  entry.label.textContent = getObjectDisplayName(id);
}

function getObjectDisplayName(id) {
  const raw = sourceNames.get(id);
  if (raw && typeof raw === 'string' && raw.trim()) {
    return raw.trim();
  }
  return String(id);
}

function formatObjectLabel(id) {
  const raw = sourceNames.get(id);
  if (raw && typeof raw === 'string') {
    const trimmed = raw.trim();
    const underscoreIndex = trimmed.indexOf('_');
    const cleaned = underscoreIndex >= 0 ? trimmed.slice(underscoreIndex + 1) : trimmed;
    if (cleaned) {
      return cleaned;
    }
  }
  return String(id);
}

function updateSpeakerControlsUI() {
  const soloTarget = getSoloTarget('speaker');
  speakerItems.forEach((entry, id) => {
    const gainValue = getBaseGain(speakerBaseGains, speakerGainCache, id);
    entry.gainSlider.value = String(gainValue);
    entry.gainBox.textContent = linearToDb(gainValue);
    entry.muteBtn.classList.toggle('active', speakerMuted.has(id));
    entry.soloBtn.classList.toggle('active', soloTarget === id);
    updateItemClasses(entry, speakerMuted.has(id), soloTarget && soloTarget !== id);
  });
}

function updateObjectControlsUI() {
  const soloTarget = getSoloTarget('object');
  objectItems.forEach((entry, id) => {
    const gainValue = getBaseGain(objectBaseGains, objectGainCache, id);
    entry.gainSlider.value = String(gainValue);
    entry.gainBox.textContent = linearToDb(gainValue);
    entry.muteBtn.classList.toggle('active', objectMuted.has(id));
    entry.soloBtn.classList.toggle('active', soloTarget === id);
    updateItemClasses(entry, objectMuted.has(id), soloTarget && soloTarget !== id);
    entry.root.classList.toggle('is-selected', selectedSourceId === id);
  });
}

function createSpeakerItem(id, speaker) {
  const root = document.createElement('div');
  root.className = 'info-item speaker-item';

  const idStrip = document.createElement('div');
  idStrip.className = 'id-strip';
  const idText = document.createElement('span');
  idStrip.appendChild(idText);

  const content = document.createElement('div');
  content.className = 'speaker-content';

  const position = document.createElement('div');
  content.appendChild(position);

  const level = document.createElement('div');
  level.className = 'meter-row';

  const levelText = document.createElement('div');
  level.appendChild(levelText);

  const meterBar = document.createElement('div');
  meterBar.className = 'meter-bar';
  const meterFill = document.createElement('div');
  meterFill.className = 'meter-fill';
  meterBar.appendChild(meterFill);
  level.appendChild(meterBar);
  content.appendChild(level);

  const controls = document.createElement('div');
  controls.className = 'control-row';

  const gainSlider = document.createElement('input');
  gainSlider.type = 'range';
  gainSlider.min = '0';
  gainSlider.max = '2';
  gainSlider.step = '0.01';
  gainSlider.className = 'gain-slider';
  gainSlider.addEventListener('input', () => {
    speakerBaseGains.set(id, Number(gainSlider.value));
    applyGroupGains('speaker');
  });
  gainSlider.addEventListener('dblclick', () => {
    gainSlider.value = '1';
    speakerBaseGains.set(id, 1);
    applyGroupGains('speaker');
    updateSpeakerControlsUI();
  });
  controls.appendChild(gainSlider);

  const gainBox = document.createElement('div');
  gainBox.className = 'gain-box';
  gainBox.textContent = '0.0 dB';
  controls.appendChild(gainBox);

  const muteBtn = document.createElement('button');
  muteBtn.type = 'button';
  muteBtn.className = 'toggle-btn';
  muteBtn.textContent = 'M';
  muteBtn.addEventListener('click', (event) => {
    event.preventDefault();
    toggleMute('speaker', id);
  });
  controls.appendChild(muteBtn);

  const soloBtn = document.createElement('button');
  soloBtn.type = 'button';
  soloBtn.className = 'toggle-btn';
  soloBtn.textContent = 'S';
  soloBtn.addEventListener('click', (event) => {
    event.preventDefault();
    toggleSolo('speaker', id);
  });
  controls.appendChild(soloBtn);

  content.appendChild(controls);
  root.appendChild(content);
  root.appendChild(idStrip);

  return { root, label: idText, position, levelText, meterFill, gainSlider, gainBox, muteBtn, soloBtn };
}

function updateSpeakerItem(entry, id, speaker) {
  const soloTarget = getSoloTarget('speaker');
  entry.label.textContent = String(speaker.id ?? id);
  entry.position.textContent = formatPosition(speaker);
  const gainValue = getBaseGain(speakerBaseGains, speakerGainCache, id);
  entry.gainSlider.value = String(gainValue);
  entry.gainBox.textContent = linearToDb(gainValue);
  entry.muteBtn.classList.toggle('active', speakerMuted.has(id));
  entry.soloBtn.classList.toggle('active', soloTarget === id);
  updateItemClasses(entry, speakerMuted.has(id), soloTarget && soloTarget !== id);
  updateMeterUI(entry, speakerLevels.get(id));
}

function createObjectItem(id) {
  const root = document.createElement('div');
  root.className = 'info-item object-item';
  root.addEventListener('click', () => {
    setSelectedSource(id);
  });

  const idStrip = document.createElement('div');
  idStrip.className = 'id-strip flip';
  const idText = document.createElement('span');
  idText.textContent = String(id);
  idStrip.appendChild(idText);
  root.appendChild(idStrip);

  const content = document.createElement('div');
  content.className = 'object-content';

  const position = document.createElement('div');
  content.appendChild(position);

  const level = document.createElement('div');
  level.className = 'meter-row';

  const levelText = document.createElement('div');
  level.appendChild(levelText);

  const meterBar = document.createElement('div');
  meterBar.className = 'meter-bar';
  const meterFill = document.createElement('div');
  meterFill.className = 'meter-fill';
  meterBar.appendChild(meterFill);
  level.appendChild(meterBar);
  content.appendChild(level);

  const controls = document.createElement('div');
  controls.className = 'control-row';

  const gainSlider = document.createElement('input');
  gainSlider.type = 'range';
  gainSlider.min = '0';
  gainSlider.max = '2';
  gainSlider.step = '0.01';
  gainSlider.className = 'gain-slider';
  gainSlider.addEventListener('input', () => {
    objectBaseGains.set(id, Number(gainSlider.value));
    applyGroupGains('object');
  });
  gainSlider.addEventListener('dblclick', () => {
    gainSlider.value = '1';
    objectBaseGains.set(id, 1);
    applyGroupGains('object');
    updateObjectControlsUI();
  });
  controls.appendChild(gainSlider);

  const gainBox = document.createElement('div');
  gainBox.className = 'gain-box';
  gainBox.textContent = '0.0 dB';
  controls.appendChild(gainBox);

  const muteBtn = document.createElement('button');
  muteBtn.type = 'button';
  muteBtn.className = 'toggle-btn';
  muteBtn.textContent = 'M';
  muteBtn.addEventListener('click', (event) => {
    event.preventDefault();
    toggleMute('object', id);
  });
  controls.appendChild(muteBtn);

  const soloBtn = document.createElement('button');
  soloBtn.type = 'button';
  soloBtn.className = 'toggle-btn';
  soloBtn.textContent = 'S';
  soloBtn.addEventListener('click', (event) => {
    event.preventDefault();
    toggleSolo('object', id);
  });
  controls.appendChild(soloBtn);

  content.appendChild(controls);
  root.appendChild(content);

  return { root, label: idText, position, levelText, meterFill, gainSlider, gainBox, muteBtn, soloBtn };
}

function updateObjectItem(entry, id, position, name) {
  const soloTarget = getSoloTarget('object');
  if (name) {
    sourceNames.set(id, name);
  }
  entry.label.textContent = getObjectDisplayName(id);
  entry.position.textContent = formatPosition(position);
  const gainValue = getBaseGain(objectBaseGains, objectGainCache, id);
  entry.gainSlider.value = String(gainValue);
  entry.gainBox.textContent = linearToDb(gainValue);
  entry.muteBtn.classList.toggle('active', objectMuted.has(id));
  entry.soloBtn.classList.toggle('active', soloTarget === id);
  updateItemClasses(entry, objectMuted.has(id), soloTarget && soloTarget !== id);
  entry.root.classList.toggle('is-selected', selectedSourceId === id);
  updateMeterUI(entry, sourceLevels.get(id));
}

function renderSpeakersList() {
  if (!speakersListEl) return;

  if (!currentLayoutSpeakers.length) {
    speakersListEl.textContent = 'Aucun speaker.';
    speakerItems.clear();
    updateSectionProportions();
    return;
  }

  speakersListEl.textContent = '';
  const activeIds = new Set();
  currentLayoutSpeakers.forEach((speaker, index) => {
    const id = String(index);
    activeIds.add(id);
    let entry = speakerItems.get(id);
    if (!entry) {
      entry = createSpeakerItem(id, speaker);
      speakerItems.set(id, entry);
    }
    updateSpeakerItem(entry, id, speaker);
    speakersListEl.appendChild(entry.root);
  });
  speakerItems.forEach((entry, id) => {
    if (!activeIds.has(id)) {
      entry.root.remove();
      speakerItems.delete(id);
    }
  });
  updateSectionProportions();
}

function renderObjectsList() {
  if (!objectsListEl) return;

  const ids = [...sourceMeshes.keys()].sort((a, b) => {
    const aNum = Number(a);
    const bNum = Number(b);
    const aIsNum = Number.isFinite(aNum);
    const bIsNum = Number.isFinite(bNum);
    if (aIsNum && bIsNum) {
      return aNum - bNum;
    }
    if (aIsNum) {
      return -1;
    }
    if (bIsNum) {
      return 1;
    }
    return String(a).localeCompare(String(b));
  });
  if (!ids.length) {
    objectsListEl.textContent = 'Aucun objet.';
    objectItems.clear();
    updateSectionProportions();
    return;
  }

  objectsListEl.textContent = '';
  const activeIds = new Set();
  ids.forEach((id) => {
    const mesh = sourceMeshes.get(id);
    if (!mesh) return;
    const key = String(id);
    activeIds.add(key);
    let entry = objectItems.get(key);
    if (!entry) {
      entry = createObjectItem(key);
      objectItems.set(key, entry);
    }
    const raw = sourcePositionsRaw.get(key) || mesh.position;
    updateObjectItem(entry, key, raw, sourceNames.get(key));
    objectsListEl.appendChild(entry.root);
  });
  objectItems.forEach((entry, id) => {
    if (!activeIds.has(id)) {
      entry.root.remove();
      objectItems.delete(id);
    }
  });
  updateSectionProportions();
}

function refreshOverlayLists() {
  renderSpeakersList();
  renderObjectsList();
  updateSectionProportions();
}

function getBaseGain(map, cache, id) {
  if (map.has(id)) {
    return map.get(id);
  }
  if (cache.has(id)) {
    return cache.get(id);
  }
  return 1;
}

function getSpeakerIds() {
  return currentLayoutSpeakers.map((_, index) => String(index));
}

function getObjectIds() {
  return [...sourceMeshes.keys()].map((id) => String(id));
}

function sendObjectGain(id, gain) {
  if (ws.readyState !== WebSocket.OPEN) {
    return;
  }
  ws.send(
    JSON.stringify({
      type: 'control:object:gain',
      id,
      gain
    })
  );
}

function sendSpeakerGain(id, gain) {
  if (ws.readyState !== WebSocket.OPEN) {
    return;
  }
  ws.send(
    JSON.stringify({
      type: 'control:speaker:gain',
      id,
      gain
    })
  );
}

function getSoloTarget(group) {
  const ids = group === 'speaker' ? getSpeakerIds() : getObjectIds();
  const mutedSet = group === 'speaker' ? speakerMuted : objectMuted;
  if (ids.length <= 1) {
    return null;
  }

  const unmuted = ids.filter((id) => !mutedSet.has(id));
  if (unmuted.length !== 1) {
    return null;
  }

  const target = unmuted[0];
  const othersMuted = ids.every((id) => id === target || mutedSet.has(id));
  return othersMuted ? target : null;
}

function areAllOthersMuted(group, id) {
  const ids = group === 'speaker' ? getSpeakerIds() : getObjectIds();
  const mutedSet = group === 'speaker' ? speakerMuted : objectMuted;
  return ids.every((other) => other === id || mutedSet.has(other));
}

function sendObjectMute(id, muted) {
  if (ws.readyState !== WebSocket.OPEN) {
    return;
  }
  ws.send(
    JSON.stringify({
      type: 'control:object:mute',
      id,
      muted: muted ? 1 : 0
    })
  );
}

function sendSpeakerMute(id, muted) {
  if (ws.readyState !== WebSocket.OPEN) {
    return;
  }
  ws.send(
    JSON.stringify({
      type: 'control:speaker:mute',
      id,
      muted: muted ? 1 : 0
    })
  );
}

function applyGroupGains(group) {
  const isSpeaker = group === 'speaker';
  const ids = isSpeaker ? getSpeakerIds() : getObjectIds();
  const baseMap = isSpeaker ? speakerBaseGains : objectBaseGains;
  const cache = isSpeaker ? speakerGainCache : objectGainCache;
  const mutedSet = isSpeaker ? speakerMuted : objectMuted;

  ids.forEach((id) => {
    const baseGain = getBaseGain(baseMap, cache, id);
    const muted = mutedSet.has(id);
    const effectiveGain = muted ? 0 : baseGain;
    if (isSpeaker) {
      sendSpeakerGain(id, effectiveGain);
    } else {
      sendObjectGain(id, effectiveGain);
    }
  });
}

function updateRoomRatioDisplay() {
  if (!roomRatioEl) return;
  roomRatioEl.textContent = `room_ratio: ${formatNumber(roomRatio.width, 2)} ${formatNumber(roomRatio.length, 2)} ${formatNumber(roomRatio.height, 2)}`;
}

function updateSpreadDisplay() {
  if (!spreadInfoEl) return;
  const minText = spreadState.min === null ? '—' : formatNumber(spreadState.min, 2);
  const maxText = spreadState.max === null ? '—' : formatNumber(spreadState.max, 2);
  spreadInfoEl.textContent = `spread: ${minText} / ${maxText}`;
}

function updateDialogNormDisplay() {
  if (!dialogNormInfoEl) return;
  const enabledText = dialogNormEnabled === null ? '—' : dialogNormEnabled ? 'on' : 'off';
  const levelText = dialogNormLevel === null ? '—' : `${formatNumber(dialogNormLevel, 0)} dBFS`;
  const gainText =
    dialogNormGain === null
      ? '—'
      : `${formatNumber(dialogNormGain, 2)} (${linearToDb(dialogNormGain)})`;
  dialogNormInfoEl.textContent = `dialog_norm: ${enabledText} | level: ${levelText} | gain: ${gainText}`;
  if (dialogNormToggleEl) {
    dialogNormToggleEl.checked = dialogNormEnabled === true;
  }
}

function updateLatencyDisplay() {
  if (!latencyInfoEl) return;
  latencyInfoEl.textContent = latencyMs === null
    ? 'latency: —'
    : `latency: ${formatNumber(latencyMs, 0)} ms`;
}

function updateResampleRatioDisplay() {
  if (!resampleRatioInfoEl) return;
  if (resampleRatio === null) {
    resampleRatioInfoEl.textContent = 'resample: —';
    return;
  }
  // Express as ppm deviation from nominal (1.0)
  const ppm = Math.round((resampleRatio - 1.0) * 1e6);
  const sign = ppm >= 0 ? '+' : '';
  resampleRatioInfoEl.textContent = `resample: ${sign}${ppm} ppm`;
}

function updateLatencyMeterUI() {
  if (!latencyMeterFillEl) return;
  if (latencyMs === null) {
    latencyMeterFillEl.style.setProperty('--level', '0%');
    return;
  }
  const value = Math.max(0, Number(latencyMs));
  const maxMs = 2000;
  const percent = Math.min(100, (value / maxMs) * 100);
  latencyMeterFillEl.style.setProperty('--level', `${percent.toFixed(1)}%`);
}

function updateMasterGainUI() {
  if (masterGainSliderEl) {
    masterGainSliderEl.value = String(masterGain);
  }
  if (masterGainBoxEl) {
    masterGainBoxEl.textContent = linearToDb(masterGain);
  }
}

function getAverageSpeakerRmsDb() {
  const levels = speakerMeshes.length
    ? speakerMeshes.map((_, index) => speakerLevels.get(String(index)))
    : [];
  const valid = levels.filter((meter) => meter && typeof meter.rmsDbfs === 'number');
  if (valid.length === 0) {
    return null;
  }
  const sumLinear = valid.reduce((acc, meter) => acc + dbToLinear(meter.rmsDbfs), 0);
  const avgLinear = sumLinear / valid.length;
  const avgDb = 20 * Math.log10(Math.max(avgLinear, 1e-6));
  return Math.max(-100, Math.min(0, avgDb));
}

function updateMasterMeterUI() {
  if (!masterMeterTextEl || !masterMeterFillEl) return;
  const avgDb = getAverageSpeakerRmsDb();
  if (avgDb === null) {
    masterMeterTextEl.textContent = '— dB';
    masterMeterFillEl.style.setProperty('--level', '0%');
    return;
  }
  masterMeterTextEl.textContent = `${formatNumber(avgDb, 1)} dB`;
  const percent = ((avgDb + 100) / 100) * 100;
  masterMeterFillEl.style.setProperty('--level', `${percent.toFixed(1)}%`);
}

function applyRoomRatioToScene() {
  const maxDim = Math.max(roomRatio.width, roomRatio.length, roomRatio.height, 1e-6);
  const sx = (roomRatio.length / maxDim) * 2;
  const sy = (roomRatio.height / maxDim) * 2;
  const sz = (roomRatio.width / maxDim) * 2;
  room.scale.set(sx, sy, sz);
}

function toggleMute(group, id) {
  const mutedSet = group === 'speaker' ? speakerMuted : objectMuted;
  const manualMutedSet = group === 'speaker' ? speakerManualMuted : objectManualMuted;
  if (mutedSet.has(id)) {
    mutedSet.delete(id);
    manualMutedSet.delete(id);
  } else {
    mutedSet.add(id);
    manualMutedSet.add(id);
  }
  if (group === 'speaker') {
    sendSpeakerMute(id, speakerMuted.has(id));
    updateSpeakerControlsUI();
  } else {
    sendObjectMute(id, objectMuted.has(id));
    updateObjectControlsUI();
  }
}

function toggleSolo(group, id) {
  const isSpeaker = group === 'speaker';
  const ids = isSpeaker ? getSpeakerIds() : getObjectIds();
  const mutedSet = isSpeaker ? speakerMuted : objectMuted;
  const manualMutedSet = isSpeaker ? speakerManualMuted : objectManualMuted;
  const currentSolo = getSoloTarget(group);

  if (currentSolo && currentSolo !== id) {
    mutedSet.add(currentSolo);
    manualMutedSet.add(currentSolo);
    mutedSet.delete(id);
    manualMutedSet.delete(id);
    if (isSpeaker) {
      sendSpeakerMute(currentSolo, true);
      sendSpeakerMute(id, false);
      updateSpeakerControlsUI();
    } else {
      sendObjectMute(currentSolo, true);
      sendObjectMute(id, false);
      updateObjectControlsUI();
      setSelectedSource(id);
    }
    return;
  }

  if (currentSolo === id) {
    ids.forEach((other) => {
      if (other === id) {
        return;
      }
      mutedSet.delete(other);
      manualMutedSet.delete(other);
      if (isSpeaker) {
        sendSpeakerMute(other, false);
      } else {
        sendObjectMute(other, false);
      }
    });
    if (isSpeaker) {
      updateSpeakerControlsUI();
    } else {
      updateObjectControlsUI();
    }
    return;
  }

  ids.forEach((other) => {
    if (other === id) {
      return;
    }
    if (!mutedSet.has(other)) {
      mutedSet.add(other);
      if (isSpeaker) {
        sendSpeakerMute(other, true);
      } else {
        sendObjectMute(other, true);
      }
    }
  });

  if (!isSpeaker) {
    setSelectedSource(id);
  }

  if (isSpeaker) {
    updateSpeakerControlsUI();
  } else {
    updateObjectControlsUI();
  }
}

function updateSectionProportions() {
  if (speakersSectionEl) {
    speakersSectionEl.style.flex = '1 1 0%';
  }
  if (objectsSectionEl) {
    objectsSectionEl.style.flex = '1 1 0%';
  }
}

function createLabelSprite(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.42, 0.16, 1);
  sprite.userData.labelCanvas = canvas;
  sprite.userData.labelCtx = ctx;
  sprite.userData.labelTexture = texture;
  sprite.userData.labelText = '';
  setLabelSpriteText(sprite, text);
  return sprite;
}

function setLabelSpriteText(sprite, text) {
  if (!sprite?.userData?.labelCanvas || !sprite.userData.labelCtx) {
    return;
  }
  const nextText = String(text ?? '');
  if (sprite.userData.labelText === nextText) {
    return;
  }

  const canvas = sprite.userData.labelCanvas;
  const ctx = sprite.userData.labelCtx;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(nextText, canvas.width / 2, canvas.height / 2);
  sprite.userData.labelText = nextText;
  if (sprite.userData.labelTexture) {
    sprite.userData.labelTexture.needsUpdate = true;
  }
}

function createSourceOutline() {
  const points = [];
  const segments = 64;
  for (let i = 0; i < segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(a), Math.sin(a), 0));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: sourceOutlineColor.clone(),
    transparent: true,
    opacity: 0.98,
    depthTest: false,
    depthWrite: false
  });

  const outline = new THREE.LineLoop(geometry, material);
  outline.renderOrder = 20;
  return outline;
}

function updateSourceDecorations(id) {
  const mesh = sourceMeshes.get(id);
  const label = sourceLabels.get(id);
  const outline = sourceOutlines.get(id);

  if (!mesh) {
    return;
  }

  if (label) {
    label.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
  }

  if (outline) {
    const radius = 0.07 * mesh.scale.x * 1.08;
    outline.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
    outline.scale.setScalar(radius);
  }
}

function dbfsToScale(dbfs, minScale, maxScale) {
  const clamped = Math.min(0, Math.max(-100, Number(dbfs ?? -100)));
  const normalized = (clamped + 100) / 100;
  return minScale + normalized * (maxScale - minScale);
}

function gainToMix(gain) {
  return Math.min(1, Math.max(0, Number(gain ?? 0)));
}

function applySourceLevel(id, mesh, meter) {
  const scale = dbfsToScale(meter?.rmsDbfs, 0.5, 2.4);
  mesh.scale.setScalar(scale);
  updateSourceDecorations(id);
}

function applySpeakerLevel(mesh, meter) {
  const scale = dbfsToScale(meter?.rmsDbfs, 0.65, 2.2);
  mesh.scale.setScalar(scale);
}

function getSelectedSourceGains() {
  if (!selectedSourceId) {
    return null;
  }
  return sourceGains.get(selectedSourceId) || null;
}

function updateSourceSelectionStyles() {
  sourceMeshes.forEach((mesh, id) => {
    const isSelected = id === selectedSourceId;
    mesh.material.emissive.copy(isSelected ? sourceSelectedEmissive : sourceDefaultEmissive);

    const outline = sourceOutlines.get(id);
    if (outline) {
      outline.material.color.copy(isSelected ? sourceOutlineSelectedColor : sourceOutlineColor);
      outline.material.opacity = isSelected ? 1 : 0.98;
    }
  });
}

function updateSpeakerColorsFromSelection() {
  const gains = getSelectedSourceGains();

  speakerMeshes.forEach((mesh, index) => {
    const mix = gainToMix(gains?.[index]);
    mesh.material.color.copy(speakerBaseColor).lerp(speakerHotColor, mix);

    const baseOpacity = Number(mesh.userData.baseOpacity ?? 0.65);
    if (!selectedSourceId) {
      mesh.material.opacity = baseOpacity;
      return;
    }

    mesh.material.opacity = mix <= 1e-6 ? Math.min(baseOpacity, 0.08) : baseOpacity;
  });
}

function setSelectedSource(id) {
  selectedSourceId = id;
  updateSourceSelectionStyles();
  updateSpeakerColorsFromSelection();
  updateObjectControlsUI();
}

function getSourceMesh(id) {
  if (!sourceMeshes.has(id)) {
    const mesh = new THREE.Mesh(sourceGeometry, sourceMaterial.clone());
    mesh.material.color.setHSL(Math.random(), 0.8, 0.6);
    mesh.material.emissive.copy(sourceDefaultEmissive);
    mesh.material.opacity = 0.0;
    mesh.material.depthWrite = false;
    mesh.userData.sourceId = id;

    const outline = createSourceOutline();
    scene.add(mesh);
    scene.add(outline);

    const label = createLabelSprite(formatObjectLabel(id));
    label.userData.sourceId = id;
    scene.add(label);

    sourceMeshes.set(id, mesh);
    sourceLabels.set(id, label);
    sourceOutlines.set(id, outline);
    applySourceLevel(id, mesh, sourceLevels.get(id));
    updateSourceSelectionStyles();
  }
  return sourceMeshes.get(id);
}

function updateSource(id, position) {
  const mesh = getSourceMesh(id);
  const raw = {
    x: Number(position.x) || 0,
    y: Number(position.y) || 0,
    z: Number(position.z) || 0
  };
  sourcePositionsRaw.set(String(id), raw);
  const scaled = {
    x: raw.x * roomRatio.length,
    y: raw.y * roomRatio.height,
    z: raw.z * roomRatio.width
  };
  mesh.position.set(scaled.x, scaled.y, scaled.z);
  updateSourceDecorations(id);
  if (position && typeof position.name === 'string' && position.name.trim()) {
    sourceNames.set(String(id), position.name.trim());
  }
  const label = sourceLabels.get(id);
  if (label) {
    setLabelSpriteText(label, formatObjectLabel(String(id)));
  }
  const key = String(id);
  if (!objectItems.has(key)) {
    renderObjectsList();
  } else {
    updateObjectPositionUI(key, raw);
    updateObjectLabelUI(key);
  }
}

function updateSourceLevel(id, meter) {
  sourceLevels.set(id, meter);
  const mesh = sourceMeshes.get(id);
  if (mesh) {
    applySourceLevel(id, mesh, meter);
  }
  updateObjectMeterUI(String(id));
}

function normalizeGainsPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && Array.isArray(payload.gains)) {
    return payload.gains;
  }
  return [];
}

function updateSourceGains(id, gainsPayload) {
  sourceGains.set(id, normalizeGainsPayload(gainsPayload));
  if (selectedSourceId === id) {
    updateSpeakerColorsFromSelection();
  }
}

function removeSource(id) {
  const mesh = sourceMeshes.get(id);
  if (!mesh) return;
  const label = sourceLabels.get(id);
  scene.remove(mesh);
  if (label) {
    scene.remove(label);
    label.material.map.dispose();
    label.material.dispose();
  }
  const outline = sourceOutlines.get(id);
  if (outline) {
    scene.remove(outline);
    outline.geometry.dispose();
    outline.material.dispose();
  }
  mesh.geometry.dispose();
  mesh.material.dispose();
  sourceMeshes.delete(id);
  sourceLabels.delete(id);
  sourceLevels.delete(id);
  sourceGains.delete(id);
  sourceOutlines.delete(id);
  sourceNames.delete(String(id));

  if (selectedSourceId === id) {
    setSelectedSource(null);
  }
  objectMuted.delete(String(id));
  objectManualMuted.delete(String(id));
  objectBaseGains.delete(String(id));
  const entry = objectItems.get(String(id));
  if (entry) {
    entry.root.remove();
    objectItems.delete(String(id));
  }
  updateObjectControlsUI();
  updateSectionProportions();
}

function clearSpeakers() {
  speakerMeshes.forEach((mesh) => {
    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
  });
  speakerLabels.forEach((label) => {
    scene.remove(label);
    label.material.map.dispose();
    label.material.dispose();
  });
  speakerMeshes.length = 0;
  speakerLabels.length = 0;
}

function renderLayout(key) {
  clearSpeakers();
  const layout = layoutsByKey.get(key);
  if (!layout) {
    currentLayoutKey = null;
    currentLayoutSpeakers = [];
    renderSpeakersList();
    return;
  }

  currentLayoutKey = key;
  currentLayoutSpeakers = Array.isArray(layout.speakers) ? layout.speakers : [];
  const speakerIds = getSpeakerIds();
  speakerMuted.forEach((id) => {
    if (!speakerIds.includes(id)) {
      speakerMuted.delete(id);
    }
  });
  speakerManualMuted.forEach((id) => {
    if (!speakerIds.includes(id)) {
      speakerManualMuted.delete(id);
    }
  });
  speakerBaseGains.forEach((_, id) => {
    if (!speakerIds.includes(id)) {
      speakerBaseGains.delete(id);
    }
  });

  layout.speakers.forEach((speaker, index) => {
    const mesh = new THREE.Mesh(speakerGeometry.clone(), speakerMaterial.clone());
    mesh.position.set(speaker.x, speaker.y, speaker.z);
    const baseOpacity = speaker.spatialize === 0 ? 0.3 : 0.65;
    mesh.userData.baseOpacity = baseOpacity;
    mesh.material.opacity = baseOpacity;
    scene.add(mesh);
    speakerMeshes.push(mesh);

    const label = createLabelSprite(String(speaker.id || index));
    label.position.set(speaker.x, speaker.y + 0.12, speaker.z);
    scene.add(label);
    speakerLabels.push(label);

    applySpeakerLevel(mesh, speakerLevels.get(String(index)));
  });

  updateSpeakerColorsFromSelection();
  refreshOverlayLists();
}

function updateSpeakerLevel(index, meter) {
  speakerLevels.set(String(index), meter);
  const mesh = speakerMeshes[index];
  if (mesh) {
    applySpeakerLevel(mesh, meter);
  }
  updateSpeakerMeterUI(String(index));
  updateMasterMeterUI();
}

function applyRoomRatio(nextRatio) {
  roomRatio.width = Number(nextRatio.width) || 1;
  roomRatio.length = Number(nextRatio.length) || 1;
  roomRatio.height = Number(nextRatio.height) || 1;
  updateRoomRatioDisplay();
  applyRoomRatioToScene();

  sourceMeshes.forEach((mesh, id) => {
    const raw = sourcePositionsRaw.get(String(id));
    if (!raw) return;
    mesh.position.set(raw.x * roomRatio.length, raw.y * roomRatio.height, raw.z * roomRatio.width);
    updateSourceDecorations(id);
  });

  speakerMeshes.forEach((mesh, index) => {
    const speaker = currentLayoutSpeakers[index];
    if (!speaker) return;
    mesh.position.set(speaker.x, speaker.y, speaker.z);
    const label = speakerLabels[index];
    if (label) {
      label.position.set(speaker.x, speaker.y + 0.12, speaker.z);
    }
  });
}

function hydrateLayoutSelect(layouts, selectedLayoutKey) {
  layoutsByKey.clear();
  layoutSelectEl.innerHTML = '';

  layouts.forEach((layout) => {
    layoutsByKey.set(layout.key, layout);

    const option = document.createElement('option');
    option.value = layout.key;
    option.textContent = layout.name;
    layoutSelectEl.appendChild(option);
  });

  if (selectedLayoutKey && layoutsByKey.has(selectedLayoutKey)) {
    layoutSelectEl.value = selectedLayoutKey;
    renderLayout(selectedLayoutKey);
  } else {
    currentLayoutKey = null;
    currentLayoutSpeakers = [];
    renderSpeakersList();
  }

  layoutSelectEl.disabled = layouts.length === 0;
}

function pointerEventToNdc(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function selectSourceFromPointer(event) {
  pointerEventToNdc(event);

  raycaster.setFromCamera(pointer, camera);
  const hitTargets = [...sourceLabels.values(), ...sourceMeshes.values()];
  const intersects = raycaster.intersectObjects(hitTargets, false);

  if (intersects.length > 0) {
    const selectedId = intersects[0].object?.userData?.sourceId || null;
    setSelectedSource(selectedId);
    return;
  }

  setSelectedSource(null);
}

renderer.domElement.addEventListener('pointerdown', (event) => {
  pointerDownPosition = { x: event.clientX, y: event.clientY };
});

renderer.domElement.addEventListener('pointerup', (event) => {
  if (!pointerDownPosition) {
    return;
  }

  const dx = event.clientX - pointerDownPosition.x;
  const dy = event.clientY - pointerDownPosition.y;
  pointerDownPosition = null;

  if (Math.hypot(dx, dy) <= 6) {
    selectSourceFromPointer(event);
  }
});

const wsProtocol = location.protocol === 'https:' ? 'wss' : 'ws';
const ws = new WebSocket(`${wsProtocol}://${location.host}`);

if (masterGainSliderEl) {
  masterGainSliderEl.addEventListener('input', () => {
    const value = Number(masterGainSliderEl.value);
    if (!Number.isFinite(value)) {
      return;
    }
    masterGain = value;
    updateMasterGainUI();
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'control:master:gain',
          gain: masterGain
        })
      );
    }
  });

  masterGainSliderEl.addEventListener('dblclick', () => {
    masterGain = 1;
    updateMasterGainUI();
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'control:master:gain',
          gain: masterGain
        })
      );
    }
  });
}

if (dialogNormToggleEl) {
  dialogNormToggleEl.addEventListener('change', () => {
    const enabled = dialogNormToggleEl.checked ? 1 : 0;
    dialogNormEnabled = enabled === 1;
    updateDialogNormDisplay();
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'control:dialog_norm',
          enable: enabled
        })
      );
    }
  });
}

ws.onopen = () => {
  statusEl.textContent = 'connecté';
};

ws.onclose = () => {
  statusEl.textContent = 'déconnecté';
};

layoutSelectEl.addEventListener('change', () => {
  if (ws.readyState !== WebSocket.OPEN) {
    return;
  }

  ws.send(
    JSON.stringify({
      type: 'layout:select',
      key: layoutSelectEl.value
    })
  );
});

ws.onmessage = (event) => {
  const payload = JSON.parse(event.data);

  if (payload.type === 'state:init') {
    speakerMuted.clear();
    objectMuted.clear();
    speakerManualMuted.clear();
    objectManualMuted.clear();

    Object.entries(payload.sources).forEach(([id, position]) => {
      updateSource(id, position);
    });
    Object.entries(payload.sourceLevels || {}).forEach(([id, meter]) => {
      updateSourceLevel(id, meter);
    });
    Object.entries(payload.speakerLevels || {}).forEach(([index, meter]) => {
      updateSpeakerLevel(Number(index), meter);
    });
    Object.entries(payload.objectSpeakerGains || {}).forEach(([id, gains]) => {
      updateSourceGains(id, gains);
    });
    Object.entries(payload.objectGains || {}).forEach(([id, gain]) => {
      objectGainCache.set(String(id), Number(gain));
    });
    Object.entries(payload.speakerGains || {}).forEach(([id, gain]) => {
      speakerGainCache.set(String(id), Number(gain));
    });
    Object.entries(payload.objectMutes || {}).forEach(([id, muted]) => {
      const key = String(id);
      if (Number(muted)) {
        objectMuted.add(key);
      }
    });
    Object.entries(payload.speakerMutes || {}).forEach(([id, muted]) => {
      const key = String(id);
      if (Number(muted)) {
        speakerMuted.add(key);
      }
    });

    if (payload.roomRatio) {
      applyRoomRatio(payload.roomRatio);
    } else {
      updateRoomRatioDisplay();
      applyRoomRatioToScene();
    }
    if (payload.spread) {
      if (typeof payload.spread.min === 'number') {
        spreadState.min = payload.spread.min;
      }
      if (typeof payload.spread.max === 'number') {
        spreadState.max = payload.spread.max;
      }
    }
    updateSpreadDisplay();
    if (typeof payload.dialogNorm === 'number') {
      dialogNormEnabled = payload.dialogNorm !== 0;
    }
    if (typeof payload.dialogNormLevel === 'number') {
      dialogNormLevel = payload.dialogNormLevel;
    }
    if (typeof payload.dialogNormGain === 'number') {
      dialogNormGain = payload.dialogNormGain;
    }
    updateDialogNormDisplay();
    if (typeof payload.masterGain === 'number') {
      masterGain = payload.masterGain;
    }
    updateMasterGainUI();
    if (typeof payload.latencyMs === 'number') {
      latencyMs = payload.latencyMs;
    }
    if (typeof payload.resampleRatio === 'number') {
      resampleRatio = payload.resampleRatio;
    }
    updateLatencyDisplay();
    updateLatencyMeterUI();
    updateResampleRatioDisplay();
    updateMasterMeterUI();

    hydrateLayoutSelect(payload.layouts || [], payload.selectedLayoutKey);
    refreshOverlayLists();
  }

  if (payload.type === 'layouts:update') {
    hydrateLayoutSelect(payload.layouts || [], payload.selectedLayoutKey);
  }

  if (payload.type === 'layout:selected') {
    if (payload.key && layoutsByKey.has(payload.key)) {
      layoutSelectEl.value = payload.key;
      renderLayout(payload.key);
    }
  }

  if (payload.type === 'source:update') {
    updateSource(payload.id, payload.position);
  }

  if (payload.type === 'source:meter') {
    updateSourceLevel(payload.id, payload.meter);
  }

  if (payload.type === 'source:gains') {
    updateSourceGains(payload.id, payload.gains);
  }

  if (payload.type === 'speaker:meter') {
    updateSpeakerLevel(Number(payload.id), payload.meter);
  }

  if (payload.type === 'object:gain') {
    objectGainCache.set(String(payload.id), Number(payload.gain));
    updateObjectControlsUI();
  }

  if (payload.type === 'speaker:gain') {
    speakerGainCache.set(String(payload.id), Number(payload.gain));
    updateSpeakerControlsUI();
  }

  if (payload.type === 'object:mute') {
    const key = String(payload.id);
    if (Number(payload.muted)) {
      objectMuted.add(key);
    } else {
      objectMuted.delete(key);
      objectManualMuted.delete(key);
    }
    updateObjectControlsUI();
  }

  if (payload.type === 'speaker:mute') {
    const key = String(payload.id);
    if (Number(payload.muted)) {
      speakerMuted.add(key);
    } else {
      speakerMuted.delete(key);
      speakerManualMuted.delete(key);
    }
    updateSpeakerControlsUI();
  }

  if (payload.type === 'room_ratio') {
    if (payload.roomRatio) {
      applyRoomRatio(payload.roomRatio);
    }
  }

  if (payload.type === 'spread:min') {
    spreadState.min = Number(payload.value);
    updateSpreadDisplay();
  }

  if (payload.type === 'spread:max') {
    spreadState.max = Number(payload.value);
    updateSpreadDisplay();
  }

  if (payload.type === 'dialog_norm') {
    dialogNormEnabled = Number(payload.enabled) !== 0;
    updateDialogNormDisplay();
  }

  if (payload.type === 'dialog_norm:level') {
    dialogNormLevel = Number(payload.value);
    updateDialogNormDisplay();
  }

  if (payload.type === 'dialog_norm:gain') {
    dialogNormGain = Number(payload.value);
    updateDialogNormDisplay();
  }

  if (payload.type === 'master:gain') {
    masterGain = Number(payload.value);
    updateMasterGainUI();
  }

  if (payload.type === 'latency') {
    latencyMs = Number(payload.value);
    updateLatencyDisplay();
    updateLatencyMeterUI();
  }

  if (payload.type === 'resample_ratio') {
    resampleRatio = Number(payload.value);
    updateResampleRatioDisplay();
  }

  if (payload.type === 'source:remove') {
    removeSource(payload.id);
  }
};

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  sourceOutlines.forEach((outline) => {
    outline.quaternion.copy(camera.quaternion);
  });

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
