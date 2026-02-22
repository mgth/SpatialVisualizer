import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js?module';
import { OrbitControls } from 'https://unpkg.com/three@0.165.0/examples/jsm/controls/OrbitControls.js?module';

const statusEl = document.getElementById('status');
const layoutSelectEl = document.getElementById('layoutSelect');
const speakersListEl = document.getElementById('speakersList');
const objectsListEl = document.getElementById('objectsList');
const speakersSectionEl = document.getElementById('speakersSection');
const objectsSectionEl = document.getElementById('objectsSection');

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
let speakerSoloId = null;
let objectSoloId = null;
const speakerItems = new Map();
const objectItems = new Map();

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
  return `x:${formatNumber(position.x)} y:${formatNumber(position.y)} z:${formatNumber(position.z)}`;
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

function updateMeterUI(entry, meter) {
  if (!entry) return;
  entry.levelText.textContent = `niveau ${formatLevel(meter)}`;
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
  entry.position.textContent = `pos ${formatPosition(position)}`;
}

function updateSpeakerControlsUI() {
  speakerItems.forEach((entry, id) => {
    entry.gainSlider.value = String(getBaseGain(speakerBaseGains, speakerGainCache, id));
    entry.muteBtn.classList.toggle('active', speakerMuted.has(id));
    entry.soloBtn.classList.toggle('active', speakerSoloId === id);
    updateItemClasses(entry, speakerMuted.has(id), speakerSoloId && speakerSoloId !== id);
  });
}

function updateObjectControlsUI() {
  objectItems.forEach((entry, id) => {
    entry.gainSlider.value = String(getBaseGain(objectBaseGains, objectGainCache, id));
    entry.muteBtn.classList.toggle('active', objectMuted.has(id));
    entry.soloBtn.classList.toggle('active', objectSoloId === id);
    updateItemClasses(entry, objectMuted.has(id), objectSoloId && objectSoloId !== id);
  });
}

function createSpeakerItem(id, speaker) {
  const root = document.createElement('div');
  root.className = 'info-item';

  const label = document.createElement('strong');
  root.appendChild(label);

  const position = document.createElement('div');
  root.appendChild(position);

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
  root.appendChild(level);

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
  controls.appendChild(gainSlider);

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

  root.appendChild(controls);

  return { root, label, position, levelText, meterFill, gainSlider, muteBtn, soloBtn };
}

function updateSpeakerItem(entry, id, speaker) {
  entry.label.textContent = String(speaker.id ?? id);
  entry.position.textContent = `pos ${formatPosition(speaker)}`;
  entry.gainSlider.value = String(getBaseGain(speakerBaseGains, speakerGainCache, id));
  entry.muteBtn.classList.toggle('active', speakerMuted.has(id));
  entry.soloBtn.classList.toggle('active', speakerSoloId === id);
  updateItemClasses(entry, speakerMuted.has(id), speakerSoloId && speakerSoloId !== id);
  updateMeterUI(entry, speakerLevels.get(id));
}

function createObjectItem(id) {
  const root = document.createElement('div');
  root.className = 'info-item';

  const label = document.createElement('strong');
  label.textContent = String(id);
  root.appendChild(label);

  const position = document.createElement('div');
  root.appendChild(position);

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
  root.appendChild(level);

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
  controls.appendChild(gainSlider);

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

  root.appendChild(controls);

  return { root, label, position, levelText, meterFill, gainSlider, muteBtn, soloBtn };
}

function updateObjectItem(entry, id, position) {
  entry.position.textContent = `pos ${formatPosition(position)}`;
  entry.gainSlider.value = String(getBaseGain(objectBaseGains, objectGainCache, id));
  entry.muteBtn.classList.toggle('active', objectMuted.has(id));
  entry.soloBtn.classList.toggle('active', objectSoloId === id);
  updateItemClasses(entry, objectMuted.has(id), objectSoloId && objectSoloId !== id);
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

  const ids = [...sourceMeshes.keys()].sort((a, b) => String(a).localeCompare(String(b)));
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
    updateObjectItem(entry, key, mesh.position);
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

function applyGroupGains(group) {
  const isSpeaker = group === 'speaker';
  const ids = isSpeaker ? getSpeakerIds() : getObjectIds();
  const baseMap = isSpeaker ? speakerBaseGains : objectBaseGains;
  const cache = isSpeaker ? speakerGainCache : objectGainCache;
  const mutedSet = isSpeaker ? speakerMuted : objectMuted;
  const soloId = isSpeaker ? speakerSoloId : objectSoloId;

  ids.forEach((id) => {
    const baseGain = getBaseGain(baseMap, cache, id);
    const muted = mutedSet.has(id);
    const soloActive = soloId !== null;
    const soloMatch = soloId === id;
    const effectiveGain = soloActive ? (soloMatch ? baseGain : 0) : muted ? 0 : baseGain;
    if (isSpeaker) {
      sendSpeakerGain(id, effectiveGain);
    } else {
      sendObjectGain(id, effectiveGain);
    }
  });
}

function toggleMute(group, id) {
  const mutedSet = group === 'speaker' ? speakerMuted : objectMuted;
  if (mutedSet.has(id)) {
    mutedSet.delete(id);
  } else {
    mutedSet.add(id);
  }
  applyGroupGains(group);
  if (group === 'speaker') {
    updateSpeakerControlsUI();
  } else {
    updateObjectControlsUI();
  }
}

function toggleSolo(group, id) {
  if (group === 'speaker') {
    speakerSoloId = speakerSoloId === id ? null : id;
  } else {
    objectSoloId = objectSoloId === id ? null : id;
  }
  applyGroupGains(group);
  if (group === 'speaker') {
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.42, 0.16, 1);
  return sprite;
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

    const label = createLabelSprite(String(id));
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
  mesh.position.set(position.x, position.y, position.z);
  updateSourceDecorations(id);
  const key = String(id);
  if (!objectItems.has(key)) {
    renderObjectsList();
  } else {
    updateObjectPositionUI(key, mesh.position);
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

  if (selectedSourceId === id) {
    setSelectedSource(null);
  }
  if (objectSoloId === String(id)) {
    objectSoloId = null;
  }
  objectMuted.delete(String(id));
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
  if (speakerSoloId && !speakerIds.includes(speakerSoloId)) {
    speakerSoloId = null;
  }
  speakerMuted.forEach((id) => {
    if (!speakerIds.includes(id)) {
      speakerMuted.delete(id);
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
