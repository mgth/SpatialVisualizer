import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js';

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

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const directional = new THREE.DirectionalLight(0xffffff, 1);
directional.position.set(3, 4, 2);
scene.add(directional);

const room = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshBasicMaterial({ color: 0x4d6eff, wireframe: true, transparent: true, opacity: 0.2 })
);
scene.add(room);
scene.add(new THREE.AxesHelper(1.2));

const sourceMeshes = new Map();
const sourceGeometry = new THREE.SphereGeometry(0.07, 24, 24);
const speakerMeshes = [];
const speakerGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.08);
const speakerMaterial = new THREE.MeshStandardMaterial({ color: 0x8bd3ff, emissive: 0x12374c });

function getSourceMesh(id) {
  if (!sourceMeshes.has(id)) {
    const mat = new THREE.MeshStandardMaterial({ color: 0xff7c4d, emissive: 0x64210c });
    mat.color.setHSL(Math.random(), 0.8, 0.6);
    const mesh = new THREE.Mesh(sourceGeometry, mat);
    scene.add(mesh);
    sourceMeshes.set(id, mesh);
  }
  return sourceMeshes.get(id);
}

function updateSource(id, position) {
  getSourceMesh(id).position.set(position.x, position.y, position.z);
}

function removeSource(id) {
  const mesh = sourceMeshes.get(id);
  if (!mesh) return;
  scene.remove(mesh);
  mesh.material.dispose();
  sourceMeshes.delete(id);
}

function clearSpeakers() {
  speakerMeshes.forEach((mesh) => {
    scene.remove(mesh);
    mesh.material.dispose();
  });
  speakerMeshes.length = 0;
}

function renderSpeakers(speakers) {
  clearSpeakers();
  speakers.forEach((speaker) => {
    const mesh = new THREE.Mesh(speakerGeometry, speakerMaterial.clone());
    mesh.position.set(speaker.x, speaker.y, speaker.z);
    scene.add(mesh);
    speakerMeshes.push(mesh);
  });
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function loadLayouts() {
  const { layouts } = await fetchJson('/api/layouts');
  layoutSelectEl.innerHTML = '';
  layouts.forEach((layout) => {
    const opt = document.createElement('option');
    opt.value = layout.key;
    opt.textContent = `${layout.name} (${layout.speakerCount})`;
    layoutSelectEl.appendChild(opt);
  });

  if (layouts.length > 0) {
    await selectLayout(layouts[0].key);
  }
}

async function selectLayout(key) {
  const { layout } = await fetchJson(`/api/layouts/${encodeURIComponent(key)}`);
  renderSpeakers(layout.speakers);
}

layoutSelectEl.addEventListener('change', (e) => {
  selectLayout(e.target.value).catch(console.error);
});

loadLayouts().catch((err) => {
  layoutSelectEl.innerHTML = '<option>aucun layout</option>';
  console.error(err);
});

const wsProtocol = location.protocol === 'https:' ? 'wss' : 'ws';
const ws = new WebSocket(`${wsProtocol}://${location.host}`);
ws.onopen = () => { statusEl.textContent = 'connecté'; };
ws.onclose = () => { statusEl.textContent = 'déconnecté'; };
ws.onmessage = (event) => {
  const payload = JSON.parse(event.data);
  if (payload.type === 'state:init') Object.entries(payload.sources).forEach(([id, p]) => updateSource(id, p));
  if (payload.type === 'source:update') updateSource(payload.id, payload.position);
  if (payload.type === 'source:remove') removeSource(payload.id);
};

function animate() {
  requestAnimationFrame(animate);
  room.rotation.y += 0.0015;
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
