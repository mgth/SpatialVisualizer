import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js';

const statusEl = document.getElementById('status');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0b10);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(2.5, 1.8, 3.6);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

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
const sourceMaterial = new THREE.MeshStandardMaterial({ color: 0xff7c4d, emissive: 0x64210c });
const sourceGeometry = new THREE.SphereGeometry(0.07, 24, 24);

function getSourceMesh(id) {
  if (!sourceMeshes.has(id)) {
    const mesh = new THREE.Mesh(sourceGeometry, sourceMaterial.clone());
    mesh.material.color.setHSL(Math.random(), 0.8, 0.6);
    scene.add(mesh);
    sourceMeshes.set(id, mesh);
  }
  return sourceMeshes.get(id);
}

function updateSource(id, position) {
  const mesh = getSourceMesh(id);
  mesh.position.set(position.x, position.y, position.z);
}

function removeSource(id) {
  const mesh = sourceMeshes.get(id);
  if (!mesh) return;
  scene.remove(mesh);
  mesh.geometry.dispose();
  mesh.material.dispose();
  sourceMeshes.delete(id);
}

const wsProtocol = location.protocol === 'https:' ? 'wss' : 'ws';
const ws = new WebSocket(`${wsProtocol}://${location.host}`);

ws.onopen = () => {
  statusEl.textContent = 'connecté';
};

ws.onclose = () => {
  statusEl.textContent = 'déconnecté';
};

ws.onmessage = (event) => {
  const payload = JSON.parse(event.data);

  if (payload.type === 'state:init') {
    Object.entries(payload.sources).forEach(([id, position]) => {
      updateSource(id, position);
    });
  }

  if (payload.type === 'source:update') {
    updateSource(payload.id, payload.position);
  }

  if (payload.type === 'source:remove') {
    removeSource(payload.id);
  }
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
