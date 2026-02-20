import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js?module';
import { OrbitControls } from 'https://unpkg.com/three@0.165.0/examples/jsm/controls/OrbitControls.js?module';

const statusEl = document.getElementById('status');
const layoutSelectEl = document.getElementById('layoutSelect');

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
const speakerMeshes = [];
const sourceLevels = new Map();
const speakerLevels = new Map();
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

const layoutsByKey = new Map();

function dbfsToScale(dbfs, minScale, maxScale) {
  const clamped = Math.min(0, Math.max(-100, Number(dbfs ?? -100)));
  const normalized = (clamped + 100) / 100;
  return minScale + normalized * (maxScale - minScale);
}

function applySourceLevel(mesh, meter) {
  const scale = dbfsToScale(meter?.rmsDbfs, 0.5, 2.4);
  mesh.scale.setScalar(scale);
}

function applySpeakerLevel(mesh, meter) {
  const scale = dbfsToScale(meter?.rmsDbfs, 0.65, 2.2);
  mesh.scale.setScalar(scale);
}

function getSourceMesh(id) {
  if (!sourceMeshes.has(id)) {
    const mesh = new THREE.Mesh(sourceGeometry, sourceMaterial.clone());
    mesh.material.color.setHSL(Math.random(), 0.8, 0.6);
    scene.add(mesh);
    sourceMeshes.set(id, mesh);
    applySourceLevel(mesh, sourceLevels.get(id));
  }
  return sourceMeshes.get(id);
}

function updateSource(id, position) {
  const mesh = getSourceMesh(id);
  mesh.position.set(position.x, position.y, position.z);
}

function updateSourceLevel(id, meter) {
  sourceLevels.set(id, meter);
  const mesh = sourceMeshes.get(id);
  if (mesh) {
    applySourceLevel(mesh, meter);
  }
}

function removeSource(id) {
  const mesh = sourceMeshes.get(id);
  if (!mesh) return;
  scene.remove(mesh);
  mesh.geometry.dispose();
  mesh.material.dispose();
  sourceMeshes.delete(id);
  sourceLevels.delete(id);
}

function clearSpeakers() {
  speakerMeshes.forEach((mesh) => {
    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
  });
  speakerMeshes.length = 0;
}

function renderLayout(key) {
  clearSpeakers();
  const layout = layoutsByKey.get(key);
  if (!layout) {
    return;
  }

  layout.speakers.forEach((speaker, index) => {
    const mesh = new THREE.Mesh(speakerGeometry.clone(), speakerMaterial.clone());
    mesh.position.set(speaker.x, speaker.y, speaker.z);
    scene.add(mesh);
    speakerMeshes.push(mesh);
    applySpeakerLevel(mesh, speakerLevels.get(String(index)));
  });
}

function updateSpeakerLevel(index, meter) {
  speakerLevels.set(String(index), meter);
  const mesh = speakerMeshes[index];
  if (mesh) {
    applySpeakerLevel(mesh, meter);
  }
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
  }

  layoutSelectEl.disabled = layouts.length === 0;
}

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

  if (payload.type === 'speaker:meter') {
    updateSpeakerLevel(Number(payload.id), payload.meter);
  }

  if (payload.type === 'source:remove') {
    removeSource(payload.id);
  }
};

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
