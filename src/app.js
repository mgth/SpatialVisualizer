import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';

const statusEl = document.getElementById('status');
const layoutSelectEl = document.getElementById('layoutSelect');
const speakersListEl = document.getElementById('speakersList');
const objectsListEl = document.getElementById('objectsList');
const speakersSectionEl = document.getElementById('speakersSection');
const speakerEditSectionEl = document.getElementById('speakerEditSection');
const speakerEditEmptyEl = document.getElementById('speakerEditEmpty');
const speakerEditBodyEl = document.getElementById('speakerEditBody');
const speakerEditTitleEl = document.getElementById('speakerEditTitle');
const speakerEditNameInputEl = document.getElementById('speakerEditNameInput');
const speakerEditXInputEl = document.getElementById('speakerEditXInput');
const speakerEditYInputEl = document.getElementById('speakerEditYInput');
const speakerEditZInputEl = document.getElementById('speakerEditZInput');
const speakerEditAzInputEl = document.getElementById('speakerEditAzInput');
const speakerEditElInputEl = document.getElementById('speakerEditElInput');
const speakerEditRInputEl = document.getElementById('speakerEditRInput');
const speakerEditCartesianGizmoBtnEl = document.getElementById('speakerEditCartesianGizmoBtn');
const speakerEditPolarGizmoBtnEl = document.getElementById('speakerEditPolarGizmoBtn');
const speakerEditGainSliderEl = document.getElementById('speakerEditGainSlider');
const speakerEditGainBoxEl = document.getElementById('speakerEditGainBox');
const speakerEditDelayMsInputEl = document.getElementById('speakerEditDelayMsInput');
const speakerEditDelaySamplesInputEl = document.getElementById('speakerEditDelaySamplesInput');
const speakerEditAutoDelayBtnEl = document.getElementById('speakerEditAutoDelayBtn');
const speakerEditDelayToDistanceBtnEl = document.getElementById('speakerEditDelayToDistanceBtn');
const speakerEditSpatializeToggleEl = document.getElementById('speakerEditSpatializeToggle');
const speakerAddBtnEl = document.getElementById('speakerAddBtn');
const speakerMoveUpBtnEl = document.getElementById('speakerMoveUpBtn');
const speakerMoveDownBtnEl = document.getElementById('speakerMoveDownBtn');
const speakerRemoveBtnEl = document.getElementById('speakerRemoveBtn');
const objectsSectionEl = document.getElementById('objectsSection');
const roomGeometrySummaryEl = document.getElementById('roomGeometrySummary');
const roomGeometrySummaryScaleEl = document.getElementById('roomGeometrySummaryScale');
const roomGeometrySummarySizeEl = document.getElementById('roomGeometrySummarySize');
const roomGeometrySummaryRatioEl = document.getElementById('roomGeometrySummaryRatio');
const roomGeometryToggleBtnEl = document.getElementById('roomGeometryToggleBtn');
const roomGeometryFormEl = document.getElementById('roomGeometryForm');
const roomDimWidthInputEl = document.getElementById('roomDimWidthInput');
const roomDimLengthInputEl = document.getElementById('roomDimLengthInput');
const roomDimHeightInputEl = document.getElementById('roomDimHeightInput');
const roomDimRearInputEl = document.getElementById('roomDimRearInput');
const roomRatioWidthInputEl = document.getElementById('roomRatioWidthInput');
const roomRatioLengthInputEl = document.getElementById('roomRatioLengthInput');
const roomRatioHeightInputEl = document.getElementById('roomRatioHeightInput');
const roomRatioRearInputEl = document.getElementById('roomRatioRearInput');
const roomRatioCenterBlendSliderEl = document.getElementById('roomRatioCenterBlendSlider');
const roomRatioCenterBlendValueEl = document.getElementById('roomRatioCenterBlendValue');
const roomMasterAxisInputs = Array.from(document.querySelectorAll('input[name="roomMasterAxis"]'));
const roomDriverWidthEl = document.getElementById('roomDriverWidth');
const roomDriverLengthEl = document.getElementById('roomDriverLength');
const roomDriverHeightEl = document.getElementById('roomDriverHeight');
const roomDriverRearEl = document.getElementById('roomDriverRear');
const roomMasterMpuWidthEl = document.getElementById('roomMasterMpuWidth');
const roomMasterMpuLengthEl = document.getElementById('roomMasterMpuLength');
const roomMasterMpuRearEl = document.getElementById('roomMasterMpuRear');
const roomMasterMpuHeightEl = document.getElementById('roomMasterMpuHeight');
const roomGeometryCancelBtnEl = document.getElementById('roomGeometryCancelBtn');
const roomGeometryApplyBtnEl = document.getElementById('roomGeometryApplyBtn');
const spreadInfoEl = document.getElementById('spreadInfo');
const vbapStatusEl = document.getElementById('vbapStatus');
const vbapCartesianGridToggleBtnEl = document.getElementById('vbapCartesianGridToggleBtn');
const vbapCartXSizeInputEl = document.getElementById('vbapCartXSizeInput');
const vbapCartYSizeInputEl = document.getElementById('vbapCartYSizeInput');
const vbapCartZSizeInputEl = document.getElementById('vbapCartZSizeInput');
const vbapPolarAzimuthResolutionInputEl = document.getElementById('vbapPolarAzimuthResolutionInput');
const vbapPolarElevationResolutionInputEl = document.getElementById('vbapPolarElevationResolutionInput');
const vbapPolarDistanceResInputEl = document.getElementById('vbapPolarDistanceResInput');
const vbapPolarDistanceMaxInputEl = document.getElementById('vbapPolarDistanceMaxInput');
const vbapCartXStepInfoEl = document.getElementById('vbapCartXStepInfo');
const vbapCartYStepInfoEl = document.getElementById('vbapCartYStepInfo');
const vbapCartZStepInfoEl = document.getElementById('vbapCartZStepInfo');
const vbapAzimuthRangeInfoEl = document.getElementById('vbapAzimuthRangeInfo');
const vbapElevationRangeInfoEl = document.getElementById('vbapElevationRangeInfo');
const vbapPolarAzStepInfoEl = document.getElementById('vbapPolarAzStepInfo');
const vbapPolarElStepInfoEl = document.getElementById('vbapPolarElStepInfo');
const vbapPolarDistStepInfoEl = document.getElementById('vbapPolarDistStepInfo');
const loudnessInfoEl = document.getElementById('loudnessInfo');
const latencyInfoEl = document.getElementById('latencyInfo');
const latencyTargetInputEl = document.getElementById('latencyTargetInput');
const latencyTargetApplyBtnEl = document.getElementById('latencyTargetApplyBtn');
const resampleRatioInfoEl = document.getElementById('resampleRatioInfo');
const audioFormatInfoEl = document.getElementById('audioFormatInfo');
const audioSampleRateControlEl = document.getElementById('audioSampleRateControl');
const audioSampleRateInputEl = document.getElementById('audioSampleRateInput');
const audioSampleRateMenuBtnEl = document.getElementById('audioSampleRateMenuBtn');
const audioSampleRateMenuEl = document.getElementById('audioSampleRateMenu');
const audioSampleRateApplyBtnEl = document.getElementById('audioSampleRateApplyBtn');
const loudnessToggleEl = document.getElementById('loudnessToggle');
const adaptiveResamplingToggleEl = document.getElementById('adaptiveResamplingToggle');
const spreadMinSliderEl = document.getElementById('spreadMinSlider');
const spreadMaxSliderEl = document.getElementById('spreadMaxSlider');
const spreadMinValEl = document.getElementById('spreadMinVal');
const spreadMaxValEl = document.getElementById('spreadMaxVal');
const spreadFromDistanceToggleEl = document.getElementById('spreadFromDistanceToggle');
const spreadFromDistanceParamsEl = document.getElementById('spreadFromDistanceParams');
const spreadDistanceRangeSliderEl = document.getElementById('spreadDistanceRangeSlider');
const spreadDistanceRangeValEl = document.getElementById('spreadDistanceRangeVal');
const spreadDistanceCurveSliderEl = document.getElementById('spreadDistanceCurveSlider');
const spreadDistanceCurveValEl = document.getElementById('spreadDistanceCurveVal');
const latencyMeterFillEl = document.getElementById('latencyMeterFill');
const masterGainSliderEl = document.getElementById('masterGainSlider');
const masterGainBoxEl = document.getElementById('masterGainBox');
const masterMeterTextEl = document.getElementById('masterMeterText');
const masterMeterFillEl = document.getElementById('masterMeterFill');
const editModeSelectEl = document.getElementById('editModeSelect');
const distanceDiffuseToggleEl = document.getElementById('distanceDiffuseToggle');
const distanceDiffuseParamsEl = document.getElementById('distanceDiffuseParams');
const distanceDiffuseThresholdSliderEl = document.getElementById('distanceDiffuseThresholdSlider');
const distanceDiffuseThresholdValEl = document.getElementById('distanceDiffuseThresholdVal');
const distanceDiffuseCurveSliderEl = document.getElementById('distanceDiffuseCurveSlider');
const distanceDiffuseCurveValEl = document.getElementById('distanceDiffuseCurveVal');
const spreadFromDistanceInfoBtnEl = document.getElementById('spreadFromDistanceInfoBtn');
const spreadFromDistanceInfoModalEl = document.getElementById('spreadFromDistanceInfoModal');
const spreadFromDistanceInfoCloseBtnEl = document.getElementById('spreadFromDistanceInfoCloseBtn');
const distanceDiffuseInfoBtnEl = document.getElementById('distanceDiffuseInfoBtn');
const distanceDiffuseInfoModalEl = document.getElementById('distanceDiffuseInfoModal');
const distanceDiffuseInfoCloseBtnEl = document.getElementById('distanceDiffuseInfoCloseBtn');
const saveConfigBtnEl = document.getElementById('saveConfigBtn');
const exportLayoutBtnEl = document.getElementById('exportLayoutBtn');
const importLayoutBtnEl = document.getElementById('importLayoutBtn');
const configSavedIndicatorEl = document.getElementById('configSavedIndicator');
const trailToggleEl = document.getElementById('trailToggle');
const trailInfoBtnEl = document.getElementById('trailInfoBtn');
const trailInfoModalEl = document.getElementById('trailInfoModal');
const trailInfoCloseBtnEl = document.getElementById('trailInfoCloseBtn');
const oscStatusDotEl = document.getElementById('oscStatusDot');
const oscConfigToggleBtnEl = document.getElementById('oscConfigToggleBtn');
const oscConfigFormEl = document.getElementById('oscConfigForm');
const oscHostInputEl = document.getElementById('oscHostInput');
const oscRxPortInputEl = document.getElementById('oscRxPortInput');
const oscListenPortInputEl = document.getElementById('oscListenPortInput');
const oscConfigApplyBtnEl = document.getElementById('oscConfigApplyBtn');
const trailLengthSliderEl = document.getElementById('trailLengthSlider');
const trailLengthValEl = document.getElementById('trailLengthVal');
const trailTtlSliderEl = document.getElementById('trailTtlSlider');
const trailTtlValEl = document.getElementById('trailTtlVal');

const LOCALE_STORAGE_KEY = 'spatialviz.locale';
const ROOM_GEOM_PREFS_STORAGE_KEY = 'spatialviz.room_geometry_prefs';
const TRANSLATIONS = {
  en: {
    'app.title': 'Spatial Visualizer',
    'osc.configTitle': 'OSC Configuration',
    'osc.host': 'Host',
    'osc.gsrdPort': 'GSRD Port',
    'osc.listenPort': 'Listen Port',
    'osc.apply': 'Apply',
    'section.objects': 'Objects',
    'layout.label': 'Layout:',
    'layout.loading': 'Loading...',
    'edit.label': 'Edit:',
    'edit.polar': 'Rings + Elevation',
    'edit.direct': 'Direct Drag',
    'edit.cartesian': 'Cartesian',
    'config.save': 'Save',
    'config.import': 'Import layout',
    'config.export': 'Export layout',
    'distance.enable': 'Enable',
    'distance.threshold': 'Threshold',
    'distance.curve': 'Curve',
    'trail.title': 'Trails',
    'trail.show': 'Show',
    'trail.points': 'Points',
    'trail.duration': 'Duration',
    'objects.none': 'No objects.',
    'speakers.none': 'No speakers.',
    'config.saved': 'Saved',
    'config.modified': 'Modified (unsaved)',
    'status.initializing': 'Initializing...',
    'status.connected': 'Connected',
    'status.reconnecting': 'Reconnecting...',
    'status.error': 'Error'
  },
  fr: {
    'app.title': 'Spatial Visualizer',
    'osc.configTitle': 'Configuration OSC',
    'osc.host': 'Hôte',
    'osc.gsrdPort': 'Port GSRD',
    'osc.listenPort': 'Port d\'écoute',
    'osc.apply': 'Appliquer',
    'section.objects': 'Objets',
    'layout.label': 'Layout :',
    'layout.loading': 'Chargement...',
    'edit.label': 'Édition :',
    'edit.polar': 'Anneaux + élévation',
    'edit.direct': 'Glisser direct',
    'edit.cartesian': 'Cartésien',
    'config.save': 'Sauvegarder',
    'config.import': 'Importer layout',
    'config.export': 'Exporter layout',
    'distance.enable': 'Activer',
    'distance.threshold': 'Seuil',
    'distance.curve': 'Courbe',
    'trail.title': 'Trajectoires',
    'trail.show': 'Afficher',
    'trail.points': 'Points',
    'trail.duration': 'Durée',
    'objects.none': 'Aucun objet.',
    'speakers.none': 'Aucun speaker.',
    'config.saved': 'Sauvegardé',
    'config.modified': 'Modifié (non sauvegardé)',
    'status.initializing': 'Initialisation...',
    'status.connected': 'Connecté',
    'status.reconnecting': 'Reconnexion...',
    'status.error': 'Erreur'
  }
};

function normalizeLocale(value) {
  return value === 'fr' ? 'fr' : 'en';
}

function detectLocale() {
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (saved) return normalizeLocale(saved);
  return 'en';
}

let locale = detectLocale();

function t(key) {
  return TRANSLATIONS[locale]?.[key] ?? TRANSLATIONS.en[key] ?? key;
}

function applyStaticTranslations() {
  document.documentElement.lang = locale;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (key) el.setAttribute('title', t(key));
  });
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0b10);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(-3.8, 1.1, 0.0);
camera.lookAt(0, 0.25, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.25, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.update();

const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const directional = new THREE.DirectionalLight(0xffffff, 1);
directional.position.set(3, 4, 2);
scene.add(directional);

const roomGroup = new THREE.Group();
scene.add(roomGroup);
const roomDimensionGroup = new THREE.Group();
scene.add(roomDimensionGroup);

const roomGeometry = new THREE.BoxGeometry(2, 1, 2);
const room = new THREE.Mesh(
  roomGeometry,
  new THREE.MeshBasicMaterial({ color: 0x4d6eff, transparent: true, opacity: 0.08, depthWrite: false })
);
room.position.y = 0.5;
roomGroup.add(room);

const upperRoomEdgePoints = [
  // top ring (y = 1)
  new THREE.Vector3(1, 1, 1), new THREE.Vector3(-1, 1, 1),
  new THREE.Vector3(-1, 1, 1), new THREE.Vector3(-1, 1, -1),
  new THREE.Vector3(-1, 1, -1), new THREE.Vector3(1, 1, -1),
  new THREE.Vector3(1, 1, -1), new THREE.Vector3(1, 1, 1),
  // mid ring (y = 0)
  new THREE.Vector3(1, 0, 1), new THREE.Vector3(-1, 0, 1),
  new THREE.Vector3(-1, 0, 1), new THREE.Vector3(-1, 0, -1),
  new THREE.Vector3(-1, 0, -1), new THREE.Vector3(1, 0, -1),
  new THREE.Vector3(1, 0, -1), new THREE.Vector3(1, 0, 1),
  // verticals from y = 0 to y = 1
  new THREE.Vector3(1, 0, 1), new THREE.Vector3(1, 1, 1),
  new THREE.Vector3(-1, 0, 1), new THREE.Vector3(-1, 1, 1),
  new THREE.Vector3(-1, 0, -1), new THREE.Vector3(-1, 1, -1),
  new THREE.Vector3(1, 0, -1), new THREE.Vector3(1, 1, -1)
];

const roomEdges = new THREE.LineSegments(
  new THREE.BufferGeometry().setFromPoints(upperRoomEdgePoints),
  new THREE.LineBasicMaterial({ color: 0x6f8dff, linewidth: 2, transparent: true, opacity: 0.45, depthTest: false })
);
roomGroup.add(roomEdges);

const roomFaceMaterial = new THREE.MeshBasicMaterial({
  color: 0x233047,
  transparent: true,
  opacity: 0.18,
  side: THREE.DoubleSide,
  depthWrite: false,
  depthTest: false,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1
});

const screenMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.18,
  side: THREE.DoubleSide,
  depthWrite: false,
  depthTest: false
});

const roomFaceSideGeometry = new THREE.PlaneGeometry(2, 1);
const roomFaceCapGeometry = new THREE.PlaneGeometry(2, 2);
const roomFaces = {
  posX: new THREE.Mesh(roomFaceSideGeometry, roomFaceMaterial),
  negX: new THREE.Mesh(roomFaceSideGeometry, roomFaceMaterial),
  posY: new THREE.Mesh(roomFaceCapGeometry, roomFaceMaterial),
  negY: new THREE.Mesh(roomFaceCapGeometry, roomFaceMaterial),
  posZ: new THREE.Mesh(roomFaceSideGeometry, roomFaceMaterial),
  negZ: new THREE.Mesh(roomFaceSideGeometry, roomFaceMaterial)
};

roomFaces.posX.rotation.y = -Math.PI / 2;
roomFaces.posX.position.set(1, 0.5, 0);
roomFaces.posX.renderOrder = 1;
roomGroup.add(roomFaces.posX);

roomFaces.negX.rotation.y = Math.PI / 2;
roomFaces.negX.position.set(-1, 0.5, 0);
roomFaces.negX.renderOrder = 1;
roomGroup.add(roomFaces.negX);

roomFaces.posY.rotation.x = -Math.PI / 2;
roomFaces.posY.position.set(0, 1, 0);
roomFaces.posY.renderOrder = 1;
roomGroup.add(roomFaces.posY);

roomFaces.negY.rotation.x = Math.PI / 2;
roomFaces.negY.position.set(0, 0, 0);
roomFaces.negY.renderOrder = 1;
roomGroup.add(roomFaces.negY);

roomFaces.posZ.position.set(0, 0.5, 1);
roomFaces.posZ.renderOrder = 1;
roomGroup.add(roomFaces.posZ);

roomFaces.negZ.rotation.y = Math.PI;
roomFaces.negZ.position.set(0, 0.5, -1);
roomFaces.negZ.renderOrder = 1;
roomGroup.add(roomFaces.negZ);

const roomFaceDefs = [
  { key: 'posX', mesh: roomFaces.posX, inward: new THREE.Vector3(-1, 0, 0) },
  { key: 'negX', mesh: roomFaces.negX, inward: new THREE.Vector3(1, 0, 0) },
  { key: 'posY', mesh: roomFaces.posY, inward: new THREE.Vector3(0, -1, 0) },
  { key: 'negY', mesh: roomFaces.negY, inward: new THREE.Vector3(0, 1, 0) },
  { key: 'posZ', mesh: roomFaces.posZ, inward: new THREE.Vector3(0, 0, -1) },
  { key: 'negZ', mesh: roomFaces.negZ, inward: new THREE.Vector3(0, 0, 1) }
];

const tempCameraLocal = new THREE.Vector3();
const tempToCamera = new THREE.Vector3();
const tempToCenter = new THREE.Vector3();

const SCREEN_ASPECT = 16 / 9;
const SCREEN_BASE_WIDTH = 2;
const SCREEN_BASE_HEIGHT = 2 * (9 / 16);
const SCREEN_MAX_WIDTH = 2;
const SCREEN_MAX_HEIGHT_UPPER_HALF = 1;

const screenGeometry = new THREE.PlaneGeometry(SCREEN_BASE_WIDTH, SCREEN_BASE_HEIGHT);
const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
screenMesh.rotation.y = -Math.PI / 2;
screenMesh.position.set(0.995, 0.5, 0);
screenMesh.renderOrder = 5;
roomGroup.add(screenMesh);

function fitScreenToUpperHalf() {
  const availableWidth = Math.max(0.01, roomBounds.zMax - roomBounds.zMin);
  const availableHeight = Math.max(0.01, roomBounds.yMax - roomBounds.yMin);
  let height = SCREEN_MAX_HEIGHT_UPPER_HALF;
  let width = height * SCREEN_ASPECT;
  if (height > availableHeight) {
    height = availableHeight;
    width = height * SCREEN_ASPECT;
  }
  if (width > SCREEN_MAX_WIDTH) {
    width = SCREEN_MAX_WIDTH;
    height = width / SCREEN_ASPECT;
  }
  if (width > availableWidth) {
    width = availableWidth;
    height = width / SCREEN_ASPECT;
  }
  screenMesh.scale.set(width / SCREEN_BASE_WIDTH, height / SCREEN_BASE_HEIGHT, 1);
  screenMesh.position.set(
    roomBounds.xMax - 0.005,
    roomBounds.yMin + (availableHeight * 0.5),
    (roomBounds.zMin + roomBounds.zMax) * 0.5
  );
}

const roomRatio = { width: 1, length: 2, height: 1, rear: 1, centerBlend: 0.5 };
const roomBounds = {
  xMin: -1,
  xMax: 1,
  yMin: 0,
  yMax: 1,
  zMin: -1,
  zMax: 1
};
fitScreenToUpperHalf();
roomDimensionGroup.visible = false;
let metersPerUnit = 1.0;
const spreadState = { min: null, max: null, fromDistance: null, distanceRange: null, distanceCurve: null };
const vbapCartesianState = { xSize: null, ySize: null, zSize: null };
const vbapPolarState = { azimuthResolution: null, elevationResolution: null, distanceRes: null, distanceMax: null };
let vbapAllowNegativeZ = null;
const distanceDiffuseState = { enabled: null, threshold: null, curve: null };
let configSaved = null;
let loudnessEnabled = null;
let loudnessSource = null;
let loudnessGain = null;
let adaptiveResamplingEnabled = null;
let vbapRecomputing = null;
let latencyMs = null;
let latencyInstantMs = null;
let latencyInstantTrendMs = null;
let latencyTargetMs = null;
let resampleRatio = null;
let audioSampleRate = null;
let audioSampleFormat = null;
let audioSampleRateEditing = false;
let latencyTargetEditing = false;
let latencyTargetDirty = false;
let masterGain = 1;
let oscStatusState = 'initializing';
let roomMasterAxis = 'width';
const roomAxisDrivers = {
  width: 'size',
  length: 'size',
  height: 'size',
  rear: 'size'
};
const LATENCY_TREND_ALPHA = 0.06;
let roomGeometryExpanded = false;
let roomGeometryBaselineKey = '';
let vbapCartesianFaceGridEnabled = false;

const vbapCartesianFaceGridMaterial = new THREE.LineBasicMaterial({
  color: 0x66d8ff,
  transparent: true,
  opacity: 0.42,
  depthWrite: false,
  depthTest: false
});
const vbapCartesianFaceGrids = {
  posX: new THREE.LineSegments(new THREE.BufferGeometry(), vbapCartesianFaceGridMaterial),
  negX: new THREE.LineSegments(new THREE.BufferGeometry(), vbapCartesianFaceGridMaterial),
  posY: new THREE.LineSegments(new THREE.BufferGeometry(), vbapCartesianFaceGridMaterial),
  negY: new THREE.LineSegments(new THREE.BufferGeometry(), vbapCartesianFaceGridMaterial),
  posZ: new THREE.LineSegments(new THREE.BufferGeometry(), vbapCartesianFaceGridMaterial),
  negZ: new THREE.LineSegments(new THREE.BufferGeometry(), vbapCartesianFaceGridMaterial)
};
Object.values(vbapCartesianFaceGrids).forEach((grid) => {
  grid.visible = false;
  grid.renderOrder = 6;
  roomGroup.add(grid);
});

function axisValues(min, max, count) {
  const n = Number(count);
  if (!Number.isFinite(n) || n < 2) return [];
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const t = i / (n - 1);
    out.push(min + (max - min) * t);
  }
  return out;
}

function mapDepthForRoomBounds(rawDepth) {
  const mapped = depthWarpWithRatios(rawDepth, roomRatio.length, roomRatio.rear, roomRatio.centerBlend);
  const maxDim = Math.max(roomRatio.width, roomRatio.length, roomRatio.height, roomRatio.rear, 1e-6);
  return mapped * (2 / maxDim);
}

function setFaceGridGeometry(faceKey, verts) {
  const grid = vbapCartesianFaceGrids[faceKey];
  if (!grid) return;
  grid.geometry.dispose();
  const geom = new THREE.BufferGeometry();
  if (verts.length > 0) {
    geom.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  }
  grid.geometry = geom;
}

function syncVbapCartesianFaceGridVisibility() {
  Object.entries(vbapCartesianFaceGrids).forEach(([key, grid]) => {
    const hasLines = Boolean(grid.geometry.getAttribute('position'));
    grid.visible = vbapCartesianFaceGridEnabled && hasLines && Boolean(roomFaces[key]?.visible);
  });
}

function updateVbapCartesianFaceGrid() {
  if (!vbapCartesianFaceGridEnabled) {
    Object.values(vbapCartesianFaceGrids).forEach((grid) => { grid.visible = false; });
    return;
  }
  const xN = Number(vbapCartesianState.xSize);
  const yN = Number(vbapCartesianState.ySize);
  const zN = Number(vbapCartesianState.zSize);
  if (!Number.isFinite(xN) || !Number.isFinite(yN) || !Number.isFinite(zN) || xN < 2 || yN < 2 || zN < 2) {
    Object.values(vbapCartesianFaceGrids).forEach((grid) => { grid.visible = false; });
    return;
  }

  const xMin = roomBounds.xMin;
  const xMax = roomBounds.xMax;
  const yMin = roomBounds.yMin;
  const yMax = roomBounds.yMax;
  const zMin = roomBounds.zMin;
  const zMax = roomBounds.zMax;

  // Cart axes mapping in scene:
  // cart_x -> scene x (depth), cart_y -> scene z (width), cart_z -> scene y (height)
  const xsRaw = axisValues(-1, 1, xN + 1);
  const xs = xsRaw.map((v) => mapDepthForRoomBounds(v));
  const ys = axisValues(yMin, yMax, zN + 1);
  const zs = axisValues(zMin, zMax, yN + 1);

  const line = (x0, y0, z0, x1, y1, z1) => {
    return [x0, y0, z0, x1, y1, z1];
  };

  const posX = [];
  const negX = [];
  const posY = [];
  const negY = [];
  const posZ = [];
  const negZ = [];

  for (const y of ys) {
    posX.push(...line(xMax, y, zMin, xMax, y, zMax));
    negX.push(...line(xMin, y, zMin, xMin, y, zMax));
  }
  for (const z of zs) {
    posX.push(...line(xMax, yMin, z, xMax, yMax, z));
    negX.push(...line(xMin, yMin, z, xMin, yMax, z));
  }

  for (const x of xs) {
    posY.push(...line(x, yMax, zMin, x, yMax, zMax));
    negY.push(...line(x, yMin, zMin, x, yMin, zMax));
  }
  for (const z of zs) {
    posY.push(...line(xMin, yMax, z, xMax, yMax, z));
    negY.push(...line(xMin, yMin, z, xMax, yMin, z));
  }

  for (const x of xs) {
    posZ.push(...line(x, yMin, zMax, x, yMax, zMax));
    negZ.push(...line(x, yMin, zMin, x, yMax, zMin));
  }
  for (const y of ys) {
    posZ.push(...line(xMin, y, zMax, xMax, y, zMax));
    negZ.push(...line(xMin, y, zMin, xMax, y, zMin));
  }

  setFaceGridGeometry('posX', posX);
  setFaceGridGeometry('negX', negX);
  setFaceGridGeometry('posY', posY);
  setFaceGridGeometry('negY', negY);
  setFaceGridGeometry('posZ', posZ);
  setFaceGridGeometry('negZ', negZ);
  syncVbapCartesianFaceGridVisibility();
}

function renderVbapCartesianGridToggle() {
  if (!vbapCartesianGridToggleBtnEl) return;
  vbapCartesianGridToggleBtnEl.classList.toggle('active', vbapCartesianFaceGridEnabled);
}

function createRoomDimensionGuide(color = 0x9dd3ff) {
  const line = new THREE.LineSegments(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85, depthTest: false })
  );
  line.renderOrder = 30;
  const label = createSmallLabelSprite('');
  label.renderOrder = 31;
  const group = new THREE.Group();
  group.add(line);
  group.add(label);
  roomDimensionGroup.add(group);
  return { group, line, label };
}

const roomDimensionGuides = {
  width: createRoomDimensionGuide(0x88c7ff),
  front: createRoomDimensionGuide(0xa0ffd1),
  rear: createRoomDimensionGuide(0xffd08a),
  total: createRoomDimensionGuide(0xb8b8ff),
  height: createRoomDimensionGuide(0xff9ed8)
};

function updateRoomDimensionGuide(guide, start, end, tickDir, labelText) {
  const tick = tickDir.clone().normalize().multiplyScalar(0.04);
  const points = [
    start, end,
    start.clone().sub(tick), start.clone().add(tick),
    end.clone().sub(tick), end.clone().add(tick)
  ];
  guide.line.geometry.dispose();
  guide.line.geometry = new THREE.BufferGeometry().setFromPoints(points);
  const mid = start.clone().add(end).multiplyScalar(0.5).add(tick.clone().multiplyScalar(2.2));
  guide.label.position.copy(mid);
  setLabelSpriteText(guide.label, labelText);
}

function updateRoomDimensionGuides(preview = null) {
  const ratioWidth = Number(preview?.ratio?.width ?? roomRatio.width) || 1;
  const ratioLength = Number(preview?.ratio?.length ?? roomRatio.length) || 1;
  const ratioHeight = Number(preview?.ratio?.height ?? roomRatio.height) || 1;
  const ratioRear = Number(preview?.ratio?.rear ?? roomRatio.rear) || 1;
  const mpuValue = Number(preview?.mpu ?? metersPerUnit) || 1;
  const xMin = roomBounds.xMin;
  const xMax = roomBounds.xMax;
  const yMin = roomBounds.yMin;
  const yMax = roomBounds.yMax;
  const zMin = roomBounds.zMin;
  const zMax = roomBounds.zMax;
  const yTop = yMax + 0.06;
  const off = 0.08;

  updateRoomDimensionGuide(
    roomDimensionGuides.width,
    new THREE.Vector3(xMax + off, yTop, zMin),
    new THREE.Vector3(xMax + off, yTop, zMax),
    new THREE.Vector3(1, 0, 0),
    `${formatNumber(ratioWidth * mpuValue * 2, 2)}m`
  );
  updateRoomDimensionGuide(
    roomDimensionGuides.front,
    new THREE.Vector3(0, yTop, zMax + off),
    new THREE.Vector3(xMax, yTop, zMax + off),
    new THREE.Vector3(0, 0, 1),
    `${formatNumber(ratioLength * mpuValue, 2)}m`
  );
  updateRoomDimensionGuide(
    roomDimensionGuides.rear,
    new THREE.Vector3(xMin, yTop + 0.08, zMax + off),
    new THREE.Vector3(0, yTop + 0.08, zMax + off),
    new THREE.Vector3(0, 0, 1),
    `${formatNumber(ratioRear * mpuValue, 2)}m`
  );
  updateRoomDimensionGuide(
    roomDimensionGuides.total,
    new THREE.Vector3(xMin, yTop, zMin - off),
    new THREE.Vector3(xMax, yTop, zMin - off),
    new THREE.Vector3(0, 0, 1),
    `${formatNumber((ratioLength + ratioRear) * mpuValue, 2)}m`
  );
  updateRoomDimensionGuide(
    roomDimensionGuides.height,
    new THREE.Vector3(xMax + off, yMin, zMax + off),
    new THREE.Vector3(xMax + off, yMax, zMax + off),
    new THREE.Vector3(1, 0, 0),
    `${formatNumber(ratioHeight * mpuValue, 2)}m`
  );

  roomDimensionGroup.visible = roomGeometryExpanded;
}

function setRoomGeometryExpanded(expanded) {
  roomGeometryExpanded = Boolean(expanded);
  if (roomGeometryFormEl) {
    roomGeometryFormEl.classList.toggle('open', roomGeometryExpanded);
  }
  if (roomGeometrySummaryEl) {
    roomGeometrySummaryEl.style.display = roomGeometryExpanded ? 'none' : '';
  }
  if (roomGeometryToggleBtnEl) {
    roomGeometryToggleBtnEl.textContent = roomGeometryExpanded ? '▾' : '▸';
  }
  roomDimensionGroup.visible = roomGeometryExpanded;
}

function setLatencyInstantMs(value) {
  const next = Number(value);
  if (!Number.isFinite(next)) {
    return;
  }
  latencyInstantMs = next;
  if (latencyInstantTrendMs === null) {
    latencyInstantTrendMs = next;
    return;
  }
  latencyInstantTrendMs =
    LATENCY_TREND_ALPHA * next + (1 - LATENCY_TREND_ALPHA) * latencyInstantTrendMs;
}

function renderOscStatus() {
  if (statusEl) statusEl.textContent = t(`status.${oscStatusState}`);
  if (oscStatusDotEl) {
    const colors = {
      initializing: '#89a3ff',
      connected: '#52e2a2',
      reconnecting: '#ffb347',
      error: '#ff5d5d'
    };
    oscStatusDotEl.style.background = colors[oscStatusState] || '#7f8a99';
  }
}

function setOscStatus(next) {
  oscStatusState = next;
  renderOscStatus();
}

function setLocale(nextLocale) {
  locale = normalizeLocale(nextLocale);
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  applyStaticTranslations();
  renderOscStatus();
  renderSpeakersList();
  renderObjectsList();
  renderConfigSavedUI();
}

window.spatialVizI18n = {
  getLocale: () => locale,
  setLocale
};

const axes = new THREE.AxesHelper(1.2);
scene.add(axes);

const ringPoints = Array.from({ length: 64 }, (_, i) => {
  const a = (i / 64) * Math.PI * 2;
  return new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
});
const arcPoints = Array.from({ length: 48 }, (_, i) => {
  const t = (i / 47) * Math.PI - Math.PI / 2;
  return new THREE.Vector3(Math.cos(t), Math.sin(t), 0);
});

const ringTickPoints = [];
for (let i = 0; i < 72; i += 1) {
  const a = (i / 72) * Math.PI * 2;
  const inner = 1.0;
  const outer = 1.08;
  ringTickPoints.push(new THREE.Vector3(Math.cos(a) * inner, 0, Math.sin(a) * inner));
  ringTickPoints.push(new THREE.Vector3(Math.cos(a) * outer, 0, Math.sin(a) * outer));
}

const ringMinorTickPoints = [];
for (let i = 0; i < 360; i += 1) {
  const a = (i / 360) * Math.PI * 2;
  const inner = 1.01;
  const outer = 1.05;
  ringMinorTickPoints.push(new THREE.Vector3(Math.cos(a) * inner, 0, Math.sin(a) * inner));
  ringMinorTickPoints.push(new THREE.Vector3(Math.cos(a) * outer, 0, Math.sin(a) * outer));
}

const arcTickPoints = [];
for (let angle = -90; angle <= 90; angle += 5) {
  const t = (angle * Math.PI) / 180;
  const inner = 1.0;
  const outer = 1.08;
  arcTickPoints.push(new THREE.Vector3(Math.cos(t) * inner, Math.sin(t) * inner, 0));
  arcTickPoints.push(new THREE.Vector3(Math.cos(t) * outer, Math.sin(t) * outer, 0));
}

const arcMinorTickPoints = [];
for (let i = 0; i <= 180; i += 1) {
  const t = (i / 180) * Math.PI - Math.PI / 2;
  const inner = 1.01;
  const outer = 1.05;
  arcMinorTickPoints.push(new THREE.Vector3(Math.cos(t) * inner, Math.sin(t) * inner, 0));
  arcMinorTickPoints.push(new THREE.Vector3(Math.cos(t) * outer, Math.sin(t) * outer, 0));
}

const speakerGizmo = {
  ring: new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(ringPoints),
    new THREE.LineBasicMaterial({ color: 0x9ef7ff, transparent: true, opacity: 0.6 })
  ),
  ringTicks: new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(ringTickPoints),
    new THREE.LineBasicMaterial({ color: 0x9ef7ff, transparent: true, opacity: 0.5 })
  ),
  ringMinorTicks: new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(ringMinorTickPoints),
    new THREE.LineBasicMaterial({ color: 0x9ef7ff, transparent: true, opacity: 0.35 })
  ),
  arc: new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(arcPoints),
    new THREE.LineBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.75 })
  ),
  arcTicks: new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(arcTickPoints),
    new THREE.LineBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.55 })
  ),
  arcMinorTicks: new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(arcMinorTickPoints),
    new THREE.LineBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.38 })
  ),
  ringLabels: new THREE.Group(),
  arcLabels: new THREE.Group(),
  ringCurrent: new THREE.Group(),
  arcCurrent: new THREE.Group()
};
speakerGizmo.ring.visible = false;
speakerGizmo.ringTicks.visible = false;
speakerGizmo.ringMinorTicks.visible = false;
speakerGizmo.arc.visible = false;
speakerGizmo.arcTicks.visible = false;
speakerGizmo.arcMinorTicks.visible = false;
scene.add(speakerGizmo.ring);
scene.add(speakerGizmo.ringTicks);
scene.add(speakerGizmo.ringMinorTicks);
scene.add(speakerGizmo.arc);
scene.add(speakerGizmo.arcTicks);
scene.add(speakerGizmo.arcMinorTicks);
scene.add(speakerGizmo.ringLabels);
scene.add(speakerGizmo.arcLabels);
scene.add(speakerGizmo.ringCurrent);
scene.add(speakerGizmo.arcCurrent);

speakerGizmo.ringCurrentLabel = createSmallLabelSprite('0', '#9ef7ff');
speakerGizmo.arcCurrentLabel = createSmallLabelSprite('0', '#ffd27a');
speakerGizmo.ringCurrentLabel.renderOrder = 5;
speakerGizmo.arcCurrentLabel.renderOrder = 5;
speakerGizmo.ringCurrent.add(speakerGizmo.ringCurrentLabel);
speakerGizmo.arcCurrent.add(speakerGizmo.arcCurrentLabel);

const distanceGizmo = {
  group: new THREE.Group(),
  line: new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
    new THREE.LineBasicMaterial({ color: 0xa8ffbf, transparent: true, opacity: 0.7 })
  ),
  arrowA: new THREE.Mesh(
    new THREE.ConeGeometry(0.02, 0.06, 8),
    new THREE.MeshBasicMaterial({ color: 0xa8ffbf, transparent: true, opacity: 0.7 })
  ),
  arrowB: new THREE.Mesh(
    new THREE.ConeGeometry(0.02, 0.06, 8),
    new THREE.MeshBasicMaterial({ color: 0xa8ffbf, transparent: true, opacity: 0.7 })
  ),
  label: createSmallLabelSprite('0.00', '#7bff6a')
};
distanceGizmo.arrowA.renderOrder = 5;
distanceGizmo.arrowB.renderOrder = 5;
distanceGizmo.label.renderOrder = 5;
distanceGizmo.group.add(distanceGizmo.line);
distanceGizmo.group.add(distanceGizmo.arrowA);
distanceGizmo.group.add(distanceGizmo.arrowB);
distanceGizmo.group.add(distanceGizmo.label);
distanceGizmo.group.visible = false;
scene.add(distanceGizmo.group);

function createSpeakerFaceShadow(color = 0x000000, opacity = 0.18) {
  return new THREE.Mesh(
    new THREE.CircleGeometry(1, 24),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false
    })
  );
}

const selectedSpeakerShadows = {
  posX: createSpeakerFaceShadow(),
  negX: createSpeakerFaceShadow(),
  posY: createSpeakerFaceShadow(),
  negY: createSpeakerFaceShadow(),
  posZ: createSpeakerFaceShadow(),
  negZ: createSpeakerFaceShadow()
};

selectedSpeakerShadows.posX.rotation.y = Math.PI / 2;
selectedSpeakerShadows.negX.rotation.y = -Math.PI / 2;
selectedSpeakerShadows.posY.rotation.x = -Math.PI / 2;
selectedSpeakerShadows.negY.rotation.x = Math.PI / 2;
selectedSpeakerShadows.posZ.rotation.y = Math.PI;
selectedSpeakerShadows.negZ.rotation.y = 0;

Object.values(selectedSpeakerShadows).forEach((shadow) => {
  shadow.visible = false;
  shadow.renderOrder = 3;
  scene.add(shadow);
});

const selectedObjectShadows = {
  posX: createSpeakerFaceShadow(0xffa14d, 0.16),
  negX: createSpeakerFaceShadow(0xffa14d, 0.16),
  posY: createSpeakerFaceShadow(0xffa14d, 0.16),
  negY: createSpeakerFaceShadow(0xffa14d, 0.16),
  posZ: createSpeakerFaceShadow(0xffa14d, 0.16),
  negZ: createSpeakerFaceShadow(0xffa14d, 0.16)
};

selectedObjectShadows.posX.rotation.y = Math.PI / 2;
selectedObjectShadows.negX.rotation.y = -Math.PI / 2;
selectedObjectShadows.posY.rotation.x = -Math.PI / 2;
selectedObjectShadows.negY.rotation.x = Math.PI / 2;
selectedObjectShadows.posZ.rotation.y = Math.PI;
selectedObjectShadows.negZ.rotation.y = 0;

Object.values(selectedObjectShadows).forEach((shadow) => {
  shadow.visible = false;
  shadow.renderOrder = 3;
  scene.add(shadow);
});

const cartesianGizmo = {
  group: new THREE.Group(),
  xLine: new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0.45, 0, 0)]),
    new THREE.LineBasicMaterial({ color: 0xff6b6b, transparent: true, opacity: 0.85 })
  ),
  yLine: new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0.45, 0)]),
    new THREE.LineBasicMaterial({ color: 0x7fff7f, transparent: true, opacity: 0.85 })
  ),
  zLine: new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, 0.45)]),
    new THREE.LineBasicMaterial({ color: 0x6bb8ff, transparent: true, opacity: 0.85 })
  ),
  xHandle: new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff6b6b, transparent: true, opacity: 0.95 })
  ),
  yHandle: new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x7fff7f, transparent: true, opacity: 0.95 })
  ),
  zHandle: new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x6bb8ff, transparent: true, opacity: 0.95 })
  )
};
cartesianGizmo.xHandle.position.set(0.45, 0, 0);
cartesianGizmo.yHandle.position.set(0, 0.45, 0);
cartesianGizmo.zHandle.position.set(0, 0, 0.45);
cartesianGizmo.xHandle.userData.axis = 'x';
cartesianGizmo.yHandle.userData.axis = 'y';
cartesianGizmo.zHandle.userData.axis = 'z';
cartesianGizmo.group.add(cartesianGizmo.xLine);
cartesianGizmo.group.add(cartesianGizmo.yLine);
cartesianGizmo.group.add(cartesianGizmo.zLine);
cartesianGizmo.group.add(cartesianGizmo.xHandle);
cartesianGizmo.group.add(cartesianGizmo.yHandle);
cartesianGizmo.group.add(cartesianGizmo.zHandle);
cartesianGizmo.group.visible = false;
scene.add(cartesianGizmo.group);

  const ringLabelAngles = Array.from({ length: 24 }, (_, i) => -180 + i * 15);
  const arcLabelAngles = Array.from({ length: 13 }, (_, i) => -90 + i * 15);

ringLabelAngles.forEach((angle) => {
  const sprite = createSmallLabelSprite(`${angle}`);
  speakerGizmo.ringLabels.add(sprite);
});

arcLabelAngles.forEach((angle) => {
  const sprite = createSmallLabelSprite(`${angle}`);
  speakerGizmo.arcLabels.add(sprite);
});

const sourceMeshes = new Map();
const sourceLabels = new Map();
const sourceOutlines = new Map();
const speakerMeshes = [];
const speakerLabels = [];
const sourceLevels = new Map();
const speakerLevels = new Map();
const sourceLevelLastSeen = new Map();
const speakerLevelLastSeen = new Map();
const sourceGains = new Map();
const speakerGainCache = new Map();
const objectGainCache = new Map();
const speakerBaseGains = new Map();
const objectBaseGains = new Map();
const speakerDelays = new Map();
const speakerMuted = new Set();
const objectMuted = new Set();
const speakerItems = new Map();
const objectItems = new Map();
const speakerManualMuted = new Set();
const objectManualMuted = new Set();
const sourceNames = new Map();
const sourcePositionsRaw = new Map();
const sourceTrails = new Map();
let trailMaxPoints = 80;
let trailsEnabled = true;
let trailPointTtlMs = 7000;
let lastTrailDecayAt = 0;
const METER_DECAY_START_MS = 250;
const METER_DECAY_DB_PER_SEC = 45;
const DEFAULT_SAMPLE_RATE_HZ = 48000;
let lastMeterDecayAt = 0;

let uiFlushScheduled = false;
const dirtyObjectMeters = new Set();
const dirtySpeakerMeters = new Set();
const dirtyObjectPositions = new Set();
const dirtyObjectLabels = new Set();
let dirtyMasterMeter = false;
let dirtyRoomRatio = false;
let dirtySpread = false;
let dirtyVbapCartesian = false;
let dirtyVbapPolar = false;
let dirtyLoudness = false;
let dirtyAdaptiveResampling = false;
let dirtyDistanceDiffuse = false;
let dirtyConfigSaved = false;
let dirtyLatency = false;
let dirtyResample = false;
let dirtyAudioFormat = false;
let dirtyMasterGain = false;

const AUDIO_SAMPLE_RATE_PRESETS = [0, 32000, 44100, 48000, 88200, 96000, 176400, 192000];

let selectedSourceId = null;
let selectedSpeakerIndex = null;
let draggedSpeakerIndex = null;
let draggedSpeakerInitialIndex = null;
let draggedSpeakerDidDrop = false;
let draggedSpeakerRoot = null;
const speakerReorderAnimations = new WeakMap();
let polarEditArmed = false;
let cartesianEditArmed = false;
let activeEditMode = 'polar';
let isDraggingSpeaker = false;
let dragMode = null;
let dragAxis = null;
const dragAxisOrigin = new THREE.Vector3();
const dragAxisDirection = new THREE.Vector3(1, 0, 0);
const dragSpeakerStartPosition = new THREE.Vector3();
let dragAxisStartT = 0;
let dragAzimuthDeg = 0;
let dragElevationDeg = 0;
let dragDistance = 1;
let dragAzimuthDelta = 1;
let dragElevationDelta = 1;

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
const speakerSelectedColor = new THREE.Color(0x4dff88);
const sourceDefaultEmissive = new THREE.Color(0x64210c);
const sourceSelectedEmissive = new THREE.Color(0x9b7f22);
const sourceOutlineColor = new THREE.Color(0xd9ecff);
const sourceOutlineSelectedColor = new THREE.Color(0xffde8a);

const layoutsByKey = new Map();
const raycaster = new THREE.Raycaster();
raycaster.params.Line.threshold = 0.08;
const pointer = new THREE.Vector2();
let pointerDownPosition = null;
let draggingPointerId = null;
let currentLayoutKey = null;
let currentLayoutSpeakers = [];

function formatNumber(value, digits = 2) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }
  return value.toFixed(digits);
}

function sceneToGsrdCartesian(position) {
  return {
    x: Number(position?.z) || 0,
    y: Number(position?.x) || 0,
    z: Number(position?.y) || 0
  };
}

function gsrdToSceneCartesian(position) {
  return {
    x: Number(position?.y) || 0,
    y: Number(position?.z) || 0,
    z: Number(position?.x) || 0
  };
}

function formatPosition(position) {
  if (!position) {
    return 'x:— y:— z:—';
  }
  const gsrdPos = sceneToGsrdCartesian(position);
  const x = Number(gsrdPos.x);
  const y = Number(gsrdPos.y);
  const z = Number(gsrdPos.z);
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
    return 'x:— y:— z:—';
  }

  // Speaker config objects carry raw az/el/dist (physical metres).
  // Use them directly to avoid distortion from the scene Cartesian coordinates,
  // which may be scaled for display purposes.
  if (typeof position.azimuthDeg === 'number') {
    const az = position.azimuthDeg;
    const el = position.elevationDeg;
    const r = position.distanceM;
    return `x:${formatNumber(x, 1)} y:${formatNumber(y, 1)} z:${formatNumber(z, 1)} | az:${formatNumber(az, 1)} el:${formatNumber(el, 1)} r:${formatNumber(r, 2)}`;
  }

  const az = (Math.atan2(x, y) * 180) / Math.PI;
  const planar = Math.sqrt((x * x) + (y * y));
  const el = (Math.atan2(z, planar) * 180) / Math.PI;
  const dist = Math.sqrt(x * x + y * y + z * z);

  return `x:${formatNumber(x, 1)} y:${formatNumber(y, 1)} z:${formatNumber(z, 1)} | az:${formatNumber(az, 1)} el:${formatNumber(el, 1)} r:${formatNumber(dist, 2)}`;
}

function getSpeakerSpatializeValue(speaker) {
  return Number(speaker?.spatialize) === 0 ? 0 : 1;
}

function getSpeakerBaseOpacity(speaker) {
  return getSpeakerSpatializeValue(speaker) === 0 ? 0.3 : 0.65;
}

function defaultLayoutExportNameFromSpeakers(speakers) {
  let a = 0;
  let b = 0;
  let c = 0;
  for (const speaker of speakers || []) {
    const spatialized = getSpeakerSpatializeValue(speaker) !== 0;
    if (!spatialized) {
      b += 1;
      continue;
    }
    const y = Number(speaker?.y);
    if (Number.isFinite(y) && y > 0.5) {
      c += 1;
    } else {
      a += 1;
    }
  }
  return `${a}.${b}.${c}`;
}

function delayMsToSamples(ms, sampleRateHz = DEFAULT_SAMPLE_RATE_HZ) {
  const msValue = Number(ms);
  if (!Number.isFinite(msValue) || msValue < 0) {
    return 0;
  }
  return Math.round((msValue / 1000) * sampleRateHz);
}

function samplesToDelayMs(samples, sampleRateHz = DEFAULT_SAMPLE_RATE_HZ) {
  const sampleValue = Number(samples);
  if (!Number.isFinite(sampleValue) || sampleValue < 0) {
    return 0;
  }
  return (sampleValue * 1000) / sampleRateHz;
}

function distanceMetersFromSpeaker(speaker) {
  if (!speaker) return 0;
  const x = Number(speaker.x);
  const y = Number(speaker.y);
  const z = Number(speaker.z);
  if (![x, y, z].every(Number.isFinite)) return 0;
  return Math.sqrt(x * x + y * y + z * z);
}

function computeAndApplySpeakerDelays() {
  if (!currentLayoutSpeakers.length) return;
  const SPEED_OF_SOUND_M_S = 343.0;
  const scale = Math.max(0.01, Number(metersPerUnit) || 1.0);
  const distances = currentLayoutSpeakers.map((speaker) => distanceMetersFromSpeaker(speaker) * scale);
  const maxDistance = distances.reduce((acc, d) => Math.max(acc, d), 0);

  distances.forEach((distance, index) => {
    const delayMs = Math.max(0, ((maxDistance - distance) / SPEED_OF_SOUND_M_S) * 1000);
    const rounded = Math.round(delayMs * 1000) / 1000;
    const id = String(index);
    speakerDelays.set(id, rounded);
    invoke('control_speaker_delay', { id: index, delayMs: rounded });
  });

  renderSpeakerEditor();
}

function adjustSpeakerDistancesFromDelays() {
  if (!currentLayoutSpeakers.length) return;
  const SPEED_OF_SOUND_M_S = 343.0;
  const scale = Math.max(0.01, Number(metersPerUnit) || 1.0);
  const currentDistancesM = currentLayoutSpeakers.map((speaker) => distanceMetersFromSpeaker(speaker) * scale);
  const referenceMaxM = currentDistancesM.reduce((acc, d) => Math.max(acc, d), 0.01);

  currentLayoutSpeakers.forEach((speaker, index) => {
    const id = String(index);
    const delayMs = Math.max(0, Number(speakerDelays.get(id) ?? speaker.delay_ms ?? 0));
    const deltaM = (delayMs / 1000) * SPEED_OF_SOUND_M_S;
    const targetDistanceUnits = Math.max(0.01, (referenceMaxM - deltaM) / scale);

    const x = Number(speaker.x) || 0;
    const y = Number(speaker.y) || 0;
    const z = Number(speaker.z) || 0;
    const norm = Math.sqrt(x * x + y * y + z * z);
    const dirX = norm > 1e-6 ? x / norm : 1;
    const dirY = norm > 1e-6 ? y / norm : 0;
    const dirZ = norm > 1e-6 ? z / norm : 0;

    applySpeakerCartesianEdit(
      index,
      dirX * targetDistanceUnits,
      dirY * targetDistanceUnits,
      dirZ * targetDistanceUnits,
      false
    );
  });

  currentLayoutSpeakers.forEach((speaker, index) => {
    invoke('control_speaker_az', { id: index, value: Number(speaker.azimuthDeg) || 0 });
    invoke('control_speaker_el', { id: index, value: Number(speaker.elevationDeg) || 0 });
    invoke('control_speaker_distance', { id: index, value: Number(speaker.distanceM) || 1 });
  });
  invoke('control_speakers_apply');
  renderSpeakerEditor();
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

function scheduleUIFlush() {
  if (uiFlushScheduled) {
    return;
  }
  uiFlushScheduled = true;
  requestAnimationFrame(flushUI);
}

function flushUI() {
  uiFlushScheduled = false;

  dirtyObjectMeters.forEach((id) => {
    const entry = objectItems.get(id);
    if (!entry) return;
    updateMeterUI(entry, sourceLevels.get(id));
  });
  dirtyObjectMeters.clear();

  dirtySpeakerMeters.forEach((id) => {
    const entry = speakerItems.get(id);
    if (!entry) return;
    updateMeterUI(entry, speakerLevels.get(id));
  });
  dirtySpeakerMeters.clear();

  dirtyObjectPositions.forEach((id) => {
    const entry = objectItems.get(id);
    if (!entry) return;
    const pos = sourcePositionsRaw.get(id);
    entry.position.textContent = formatPosition(pos);
  });
  dirtyObjectPositions.clear();

  dirtyObjectLabels.forEach((id) => {
    const entry = objectItems.get(id);
    if (!entry) return;
    entry.label.textContent = getObjectDisplayName(id);
  });
  dirtyObjectLabels.clear();

  if (dirtyMasterMeter) {
    updateMasterMeterUI();
    dirtyMasterMeter = false;
  }

  if (dirtyRoomRatio) {
    renderRoomRatioDisplay();
    dirtyRoomRatio = false;
  }

  if (dirtySpread) {
    renderSpreadDisplay();
    dirtySpread = false;
  }

  if (dirtyVbapCartesian) {
    renderVbapCartesian();
    dirtyVbapCartesian = false;
  }

  if (dirtyVbapPolar) {
    renderVbapPolar();
    dirtyVbapPolar = false;
  }

  if (dirtyLoudness) {
    renderLoudnessDisplay();
    dirtyLoudness = false;
  }

  if (dirtyAdaptiveResampling) {
    renderAdaptiveResamplingUI();
    dirtyAdaptiveResampling = false;
  }

  if (dirtyDistanceDiffuse) {
    renderDistanceDiffuseUI();
    dirtyDistanceDiffuse = false;
  }

  if (dirtyConfigSaved) {
    renderConfigSavedUI();
    dirtyConfigSaved = false;
  }

  if (dirtyLatency) {
    renderLatencyDisplay();
    renderLatencyMeterUI();
    dirtyLatency = false;
  }

  if (dirtyResample) {
    renderResampleRatioDisplay();
    dirtyResample = false;
  }

  if (dirtyAudioFormat) {
    renderAudioFormatDisplay();
    dirtyAudioFormat = false;
  }

  if (dirtyMasterGain) {
    renderMasterGainUI();
    dirtyMasterGain = false;
  }
}

function updateItemClasses(entry, isMuted, isDimmed) {
  entry.root.classList.toggle('is-muted', isMuted);
  entry.root.classList.toggle('is-dimmed', isDimmed);
}

function updateSpeakerMeterUI(id) {
  const key = String(id);
  dirtySpeakerMeters.add(key);
  scheduleUIFlush();
}

function updateObjectMeterUI(id) {
  const key = String(id);
  dirtyObjectMeters.add(key);
  scheduleUIFlush();
}

function updateObjectPositionUI(id, position) {
  const key = String(id);
  if (position) {
    sourcePositionsRaw.set(key, position);
  }
  dirtyObjectPositions.add(key);
  scheduleUIFlush();
}

function updateObjectLabelUI(id) {
  const key = String(id);
  dirtyObjectLabels.add(key);
  scheduleUIFlush();
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
    entry.muteBtn.classList.toggle('active', speakerMuted.has(id));
    entry.soloBtn.classList.toggle('active', soloTarget === id);
    updateItemClasses(entry, speakerMuted.has(id), soloTarget && soloTarget !== id);
    entry.root.classList.toggle('is-selected', selectedSpeakerIndex !== null && Number(id) === selectedSpeakerIndex);
  });
  renderSpeakerEditor();
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
  root.addEventListener('click', () => {
    setSelectedSource(null);
    setSelectedSpeaker(Number(id));
  });
  root.addEventListener('dragover', (event) => {
    if (draggedSpeakerIndex === null || !draggedSpeakerRoot || !speakersListEl) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    const targetIndex = Number(id);
    if (!Number.isInteger(targetIndex) || targetIndex === draggedSpeakerIndex) return;
    const rect = root.getBoundingClientRect();
    const insertAfter = event.clientY >= (rect.top + rect.height * 0.5);
    if (insertAfter) {
      const afterNode = root.nextSibling;
      if (afterNode !== draggedSpeakerRoot) {
        animateSpeakerListReorder(() => {
          speakersListEl.insertBefore(draggedSpeakerRoot, afterNode);
        });
      }
    } else if (root !== draggedSpeakerRoot) {
      animateSpeakerListReorder(() => {
        speakersListEl.insertBefore(draggedSpeakerRoot, root);
      });
    }
    draggedSpeakerIndex = Array.from(speakersListEl.querySelectorAll('.speaker-item')).indexOf(draggedSpeakerRoot);
    markDraggedSpeakerItem();
  });
  root.addEventListener('drop', (event) => {
    event.preventDefault();
    draggedSpeakerDidDrop = true;
  });

  const idStrip = document.createElement('div');
  idStrip.className = 'id-strip flip';
  idStrip.title = 'Drag to reorder';
  idStrip.draggable = true;
  idStrip.addEventListener('dragstart', (event) => {
    const idx = Number(id);
    if (!Number.isInteger(idx)) return;
    draggedSpeakerIndex = idx;
    draggedSpeakerInitialIndex = idx;
    draggedSpeakerDidDrop = false;
    draggedSpeakerRoot = root;
    markDraggedSpeakerItem();
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(idx));
    }
  });
  idStrip.addEventListener('dragend', () => {
    if (draggedSpeakerInitialIndex !== null && draggedSpeakerIndex !== null) {
      if (draggedSpeakerDidDrop) {
        if (draggedSpeakerInitialIndex !== draggedSpeakerIndex) {
          invoke('control_speakers_move', { from: draggedSpeakerInitialIndex, to: draggedSpeakerIndex });
          requestMoveSpeakerTo(draggedSpeakerInitialIndex, draggedSpeakerIndex, false);
        }
      } else {
        // Drag cancelled: restore current logical order.
        renderSpeakersList();
      }
    }
    draggedSpeakerIndex = null;
    draggedSpeakerInitialIndex = null;
    draggedSpeakerDidDrop = false;
    draggedSpeakerRoot = null;
    speakerItems.forEach((item) => item.root.classList.remove('is-dragging'));
  });

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
  root.appendChild(idStrip);
  root.appendChild(content);

  return { root, label: idText, position, levelText, meterFill, muteBtn, soloBtn };
}

function updateSpeakerItem(entry, id, speaker) {
  const soloTarget = getSoloTarget('speaker');
  entry.label.textContent = String(speaker.id ?? id);
  entry.position.textContent = formatPosition(speaker);
  entry.muteBtn.classList.toggle('active', speakerMuted.has(id));
  entry.soloBtn.classList.toggle('active', soloTarget === id);
  updateItemClasses(entry, speakerMuted.has(id), soloTarget && soloTarget !== id);
  entry.root.classList.toggle('is-selected', selectedSpeakerIndex !== null && Number(id) === selectedSpeakerIndex);
  updateMeterUI(entry, speakerLevels.get(id));
}

function setSpeakerSpatializeLocal(index, spatialize) {
  const speaker = currentLayoutSpeakers[index];
  if (!speaker) {
    return;
  }
  speaker.spatialize = spatialize === 0 ? 0 : 1;
  const mesh = speakerMeshes[index];
  if (mesh) {
    const baseOpacity = getSpeakerBaseOpacity(speaker);
    mesh.userData.baseOpacity = baseOpacity;
    mesh.material.opacity = baseOpacity;
  }
  updateSpeakerColorsFromSelection();
  renderSpeakerEditor();
}

function updateSpeakerVisualsFromState(index) {
  const speaker = currentLayoutSpeakers[index];
  if (!speaker) return;

  const mesh = speakerMeshes[index];
  if (mesh) {
    mesh.position.set(Number(speaker.x) || 0, Number(speaker.y) || 0, Number(speaker.z) || 0);
  }

  const label = speakerLabels[index];
  if (label) {
    label.position.set((Number(speaker.x) || 0), (Number(speaker.y) || 0) + 0.12, Number(speaker.z) || 0);
    setLabelSpriteText(label, String(speaker.id ?? index));
  }

  const entry = speakerItems.get(String(index));
  if (entry) {
    entry.label.textContent = String(speaker.id ?? index);
    entry.position.textContent = formatPosition(speaker);
  }

  if (selectedSpeakerIndex === index) {
    updateSpeakerGizmo();
  }
}

function applySpeakerCartesianEdit(index, x, y, z, sendOsc = true) {
  const speaker = currentLayoutSpeakers[index];
  if (!speaker) return;
  if (![x, y, z].every((v) => Number.isFinite(v))) return;

  speaker.x = x;
  speaker.y = y;
  speaker.z = z;
  const sph = cartesianToSpherical({ x, y, z });
  speaker.azimuthDeg = sph.az;
  speaker.elevationDeg = sph.el;
  speaker.distanceM = Math.max(0.01, sph.dist);
  updateSpeakerVisualsFromState(index);

  if (sendOsc) {
    invoke('control_speaker_az', { id: index, value: speaker.azimuthDeg });
    invoke('control_speaker_el', { id: index, value: speaker.elevationDeg });
    invoke('control_speaker_distance', { id: index, value: speaker.distanceM });
    invoke('control_speakers_apply');
  }

  renderSpeakerEditor();
}

function applySpeakerPolarEdit(index, az, el, r, sendOsc = true) {
  if (![az, el, r].every((v) => Number.isFinite(v))) return;
  const radius = Math.max(0.01, r);
  const cart = sphericalToCartesianDeg(az, el, radius);
  applySpeakerCartesianEdit(index, cart.x, cart.y, cart.z, sendOsc);
}

function renderSpeakerEditor() {
  if (!speakerEditSectionEl || !speakerEditEmptyEl || !speakerEditBodyEl) {
    return;
  }

  if (selectedSpeakerIndex === null || !currentLayoutSpeakers[selectedSpeakerIndex]) {
    if (speakerMoveUpBtnEl) speakerMoveUpBtnEl.disabled = true;
    if (speakerMoveDownBtnEl) speakerMoveDownBtnEl.disabled = true;
    if (speakerRemoveBtnEl) speakerRemoveBtnEl.disabled = true;
    speakerEditEmptyEl.style.display = '';
    speakerEditBodyEl.style.display = 'none';
    return;
  }

  const idx = selectedSpeakerIndex;
  const id = String(idx);
  const speaker = currentLayoutSpeakers[idx];
  if (speakerMoveUpBtnEl) speakerMoveUpBtnEl.disabled = idx <= 0;
  if (speakerMoveDownBtnEl) speakerMoveDownBtnEl.disabled = idx >= currentLayoutSpeakers.length - 1;
  if (speakerRemoveBtnEl) speakerRemoveBtnEl.disabled = currentLayoutSpeakers.length === 0;
  const gain = getBaseGain(speakerBaseGains, speakerGainCache, id);
  const delayMs = Number(speakerDelays.get(id) ?? speaker.delay_ms ?? 0);
  const spherical = cartesianToSpherical(speaker);
  const az = Number.isFinite(Number(speaker.azimuthDeg)) ? Number(speaker.azimuthDeg) : spherical.az;
  const el = Number.isFinite(Number(speaker.elevationDeg)) ? Number(speaker.elevationDeg) : spherical.el;
  const r = Number.isFinite(Number(speaker.distanceM)) ? Number(speaker.distanceM) : spherical.dist;

  speakerEditEmptyEl.style.display = 'none';
  speakerEditBodyEl.style.display = '';

  if (speakerEditTitleEl) speakerEditTitleEl.textContent = `Speaker ${idx}`;
  if (speakerEditNameInputEl) speakerEditNameInputEl.value = String(speaker.id ?? idx);
  const gsrdSpeakerPos = sceneToGsrdCartesian(speaker);
  if (speakerEditXInputEl) speakerEditXInputEl.value = formatNumber(Number(gsrdSpeakerPos.x), 3);
  if (speakerEditYInputEl) speakerEditYInputEl.value = formatNumber(Number(gsrdSpeakerPos.y), 3);
  if (speakerEditZInputEl) speakerEditZInputEl.value = formatNumber(Number(gsrdSpeakerPos.z), 3);
  if (speakerEditAzInputEl) speakerEditAzInputEl.value = formatNumber(az, 1);
  if (speakerEditElInputEl) speakerEditElInputEl.value = formatNumber(el, 1);
  if (speakerEditRInputEl) speakerEditRInputEl.value = formatNumber(r, 3);
  if (speakerEditGainSliderEl) speakerEditGainSliderEl.value = String(gain);
  if (speakerEditGainBoxEl) speakerEditGainBoxEl.textContent = linearToDb(gain);
  if (speakerEditDelayMsInputEl) speakerEditDelayMsInputEl.value = String(Math.max(0, delayMs));
  if (speakerEditDelaySamplesInputEl) speakerEditDelaySamplesInputEl.value = String(delayMsToSamples(delayMs));
  if (speakerEditSpatializeToggleEl) speakerEditSpatializeToggleEl.checked = getSpeakerSpatializeValue(speaker) !== 0;
  if (speakerEditCartesianGizmoBtnEl) {
    speakerEditCartesianGizmoBtnEl.classList.toggle('active', cartesianEditArmed && activeEditMode === 'cartesian');
  }
  if (speakerEditPolarGizmoBtnEl) {
    speakerEditPolarGizmoBtnEl.classList.toggle('active', polarEditArmed && activeEditMode === 'polar');
  }
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
    speakersListEl.textContent = t('speakers.none');
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
    objectsListEl.textContent = t('objects.none');
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
  invoke('control_object_gain', { id: Number(id), gain: Number(gain) });
}

function sendSpeakerGain(id, gain) {
  invoke('control_speaker_gain', { id: Number(id), gain: Number(gain) });
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
  invoke('control_object_mute', { id: Number(id), muted: muted ? 1 : 0 });
}

function sendSpeakerMute(id, muted) {
  invoke('control_speaker_mute', { id: Number(id), muted: muted ? 1 : 0 });
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

function roomAxisFactor(axis) {
  return axis === 'width' ? 2 : 1;
}

function persistRoomGeometryPrefs() {
  try {
    const payload = {
      master: roomMasterAxis,
      drivers: {
        width: roomAxisDrivers.width === 'ratio' ? 'ratio' : 'size',
        length: roomAxisDrivers.length === 'ratio' ? 'ratio' : 'size',
        height: roomAxisDrivers.height === 'ratio' ? 'ratio' : 'size',
        rear: roomAxisDrivers.rear === 'ratio' ? 'ratio' : 'size'
      }
    };
    localStorage.setItem(ROOM_GEOM_PREFS_STORAGE_KEY, JSON.stringify(payload));
  } catch (_e) {
    // Ignore storage errors (private mode, quota, etc.).
  }
}

function loadRoomGeometryPrefs() {
  try {
    const raw = localStorage.getItem(ROOM_GEOM_PREFS_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const axes = ['width', 'length', 'height', 'rear'];
    if (axes.includes(parsed?.master)) {
      roomMasterAxis = parsed.master;
    }
    const drivers = parsed?.drivers || {};
    axes.forEach((axis) => {
      roomAxisDrivers[axis] = drivers[axis] === 'ratio' ? 'ratio' : 'size';
    });
  } catch (_e) {
    // Ignore malformed payloads.
  }
}

function getRoomDriverEl(axis) {
  if (axis === 'width') return roomDriverWidthEl;
  if (axis === 'length') return roomDriverLengthEl;
  if (axis === 'height') return roomDriverHeightEl;
  if (axis === 'rear') return roomDriverRearEl;
  return null;
}

function getRoomDriverValue(axis) {
  const el = getRoomDriverEl(axis);
  return el?.checked ? 'ratio' : 'size';
}

function setRoomDriverValue(axis, value) {
  const el = getRoomDriverEl(axis);
  if (!el) return;
  el.checked = value === 'ratio';
}

function getRoomSizeInputEl(axis) {
  if (axis === 'width') return roomDimWidthInputEl;
  if (axis === 'length') return roomDimLengthInputEl;
  if (axis === 'height') return roomDimHeightInputEl;
  if (axis === 'rear') return roomDimRearInputEl;
  return null;
}

function getRoomRatioInputEl(axis) {
  if (axis === 'width') return roomRatioWidthInputEl;
  if (axis === 'length') return roomRatioLengthInputEl;
  if (axis === 'height') return roomRatioHeightInputEl;
  if (axis === 'rear') return roomRatioRearInputEl;
  return null;
}

function roundRoomGeom(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 1e6) / 1e6;
}

function getRoomCenterBlendFromInput(fallback = roomRatio.centerBlend) {
  const n = Number(roomRatioCenterBlendSliderEl?.value);
  const fallbackNum = Number(fallback);
  if (!Number.isFinite(n)) return Number.isFinite(fallbackNum) ? fallbackNum : 0.5;
  return Math.max(0, Math.min(1, n / 100));
}

function renderRoomCenterBlendControl(value = roomRatio.centerBlend) {
  const parsed = Number(value);
  const blend = Math.max(0, Math.min(1, Number.isFinite(parsed) ? parsed : 0.5));
  if (roomRatioCenterBlendSliderEl) {
    roomRatioCenterBlendSliderEl.value = String(Math.round(blend * 100));
  }
  if (roomRatioCenterBlendValueEl) {
    roomRatioCenterBlendValueEl.textContent = `${Math.round(blend * 100)}/${Math.round((1 - blend) * 100)}`;
  }
}

function roomGeometryStateFromInputs() {
  const axes = ['width', 'length', 'height', 'rear'];
  const preview = computeRoomGeometryFromInputs();
  const state = {
    mpu: roundRoomGeom(preview.mpu),
    master: roomMasterAxis,
    centerBlend: roundRoomGeom(getRoomCenterBlendFromInput()),
    drivers: {},
    size: {},
    ratio: {}
  };
  axes.forEach((axis) => {
    state.drivers[axis] = roomAxisDrivers[axis] === 'ratio' ? 'ratio' : 'size';
    state.size[axis] = roundRoomGeom(getRoomSizeInputEl(axis)?.value);
    state.ratio[axis] = roundRoomGeom(getRoomRatioInputEl(axis)?.value);
  });
  return state;
}

function normalizeRoomGeometryInputDisplays() {
  [
    roomDimWidthInputEl,
    roomDimLengthInputEl,
    roomDimHeightInputEl,
    roomDimRearInputEl,
    roomRatioWidthInputEl,
    roomRatioLengthInputEl,
    roomRatioHeightInputEl,
    roomRatioRearInputEl
  ].forEach((el) => {
    if (!el) return;
    const n = Number(el.value);
    if (!Number.isFinite(n)) return;
    el.value = formatNumber(n, 2);
  });
}

function roomGeometryStateKey(state) {
  const s = state || roomGeometryStateFromInputs();
  return JSON.stringify({
    mpu: s.mpu,
    master: s.master,
    centerBlend: s.centerBlend,
    drivers: s.drivers,
    size: s.size,
    ratio: s.ratio
  });
}

function updateRoomGeometryButtonsState() {
  const currentKey = roomGeometryStateKey();
  const unchanged = roomGeometryBaselineKey !== '' && currentKey === roomGeometryBaselineKey;
  if (roomGeometryApplyBtnEl) {
    roomGeometryApplyBtnEl.disabled = unchanged;
    roomGeometryApplyBtnEl.style.opacity = unchanged ? '0.55' : '1';
    roomGeometryApplyBtnEl.style.cursor = unchanged ? 'default' : 'pointer';
  }
  if (roomGeometryCancelBtnEl) {
    roomGeometryCancelBtnEl.disabled = unchanged;
    roomGeometryCancelBtnEl.style.opacity = unchanged ? '0.55' : '1';
    roomGeometryCancelBtnEl.style.cursor = unchanged ? 'default' : 'pointer';
  }
}

function setRoomGeometryBaselineFromInputs() {
  roomGeometryBaselineKey = roomGeometryStateKey();
  updateRoomGeometryButtonsState();
}

function renderRoomGeometrySummary(preview = null) {
  if (!roomGeometrySummaryEl) return;
  const ratioWidth = Number(preview?.ratio?.width ?? roomRatio.width) || 1;
  const ratioLength = Number(preview?.ratio?.length ?? roomRatio.length) || 1;
  const ratioRear = Number(preview?.ratio?.rear ?? roomRatio.rear) || 1;
  const ratioHeight = Number(preview?.ratio?.height ?? roomRatio.height) || 1;
  const mpuValue = Number(preview?.mpu ?? metersPerUnit) || 1;
  const sizeWidth = ratioWidth * mpuValue * 2;
  const sizeFront = ratioLength * mpuValue;
  const sizeRear = ratioRear * mpuValue;
  const sizeHeight = ratioHeight * mpuValue;

  if (roomGeometrySummaryScaleEl) {
    roomGeometrySummaryScaleEl.textContent = `m/u: ${formatNumber(mpuValue, 2)}`;
  }
  if (roomGeometrySummarySizeEl) {
    roomGeometrySummarySizeEl.textContent =
      `X: ${formatNumber(sizeWidth, 2)}m | Y+: ${formatNumber(sizeFront, 2)}m | Y-: ${formatNumber(sizeRear, 2)}m | Z+: ${formatNumber(sizeHeight, 2)}m`;
  }
  if (roomGeometrySummaryRatioEl) {
    roomGeometrySummaryRatioEl.textContent =
      `X: ${formatNumber(ratioWidth, 2)} | Y+: ${formatNumber(ratioLength, 2)} | Y-: ${formatNumber(ratioRear, 2)} | Z+: ${formatNumber(ratioHeight, 2)}`;
  }
}

function applyRoomGeometryStateToInputs(state) {
  if (!state) return;
  const axes = ['width', 'length', 'height', 'rear'];
  roomMasterAxis = axes.includes(state.master) ? state.master : roomMasterAxis;
  axes.forEach((axis) => {
    roomAxisDrivers[axis] = state.drivers?.[axis] === 'ratio' ? 'ratio' : 'size';
    const sizeEl = getRoomSizeInputEl(axis);
    const ratioEl = getRoomRatioInputEl(axis);
    if (sizeEl && Number.isFinite(state.size?.[axis])) sizeEl.value = String(state.size[axis]);
    if (ratioEl && Number.isFinite(state.ratio?.[axis])) ratioEl.value = String(state.ratio[axis]);
  });
  const centerBlend = Number.isFinite(state.centerBlend) ? state.centerBlend : roomRatio.centerBlend;
  renderRoomCenterBlendControl(centerBlend);
  normalizeRoomGeometryInputDisplays();
  refreshRoomGeometryInputState();
  updateRoomGeometryButtonsState();
}

function computeRoomGeometryFromInputs() {
  const axes = ['width', 'length', 'height', 'rear'];
  const safeNumber = (value, fallback, min = 0.01) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, n);
  };

  const inputData = {};
  axes.forEach((axis) => {
    const ratioNow = axis === 'width' ? roomRatio.width
      : axis === 'length' ? roomRatio.length
        : axis === 'height' ? roomRatio.height
          : roomRatio.rear;
    const defaultSize = ratioNow * metersPerUnit * roomAxisFactor(axis);
    const sizeEl = getRoomSizeInputEl(axis);
    const ratioEl = getRoomRatioInputEl(axis);
    inputData[axis] = {
      size: safeNumber(sizeEl?.value, Math.max(0.01, defaultSize)),
      ratio: safeNumber(ratioEl?.value, Math.max(0.01, ratioNow))
    };
  });

  let master = roomMasterAxis;
  if (!axes.includes(master)) master = 'width';

  const masterRatio = inputData[master].ratio;
  const masterSize = inputData[master].size;
  const masterFactor = roomAxisFactor(master);
  const mpu = safeNumber(masterSize / Math.max(0.01, masterRatio * masterFactor), Number(metersPerUnit) || 1);

  const ratios = {};
  axes.forEach((axis) => {
    if (axis === master) {
      ratios[axis] = masterRatio;
      return;
    }
    const driver = roomAxisDrivers[axis] === 'ratio' ? 'ratio' : 'size';
    if (driver === 'ratio') {
      ratios[axis] = inputData[axis].ratio;
    } else {
      ratios[axis] = safeNumber(inputData[axis].size / Math.max(0.01, mpu * roomAxisFactor(axis)), 1);
    }
  });

  return {
    master,
    mpu,
    ratio: {
      width: ratios.width,
      length: ratios.length,
      height: ratios.height,
      rear: ratios.rear
    },
    size: {
      width: ratios.width * mpu * roomAxisFactor('width'),
      length: ratios.length * mpu * roomAxisFactor('length'),
      height: ratios.height * mpu * roomAxisFactor('height'),
      rear: ratios.rear * mpu * roomAxisFactor('rear')
    }
  };
}

function updateRoomGeometryLivePreview() {
  const preview = computeRoomGeometryFromInputs();
  const axes = ['width', 'length', 'height', 'rear'];
  axes.forEach((axis) => {
    const isMaster = axis === roomMasterAxis;
    const driver = roomAxisDrivers[axis] === 'ratio' ? 'ratio' : 'size';
    const sizeEditable = isMaster || driver === 'size';
    const ratioEditable = isMaster || driver === 'ratio';
    const sizeEl = getRoomSizeInputEl(axis);
    const ratioEl = getRoomRatioInputEl(axis);
    if (!sizeEditable && sizeEl) sizeEl.value = formatNumber(preview.size[axis], 2);
    if (!ratioEditable && ratioEl) ratioEl.value = formatNumber(preview.ratio[axis], 2);
  });
  renderRoomGeometryMasterMpu(preview);
  renderRoomGeometrySummary(preview);
  updateRoomDimensionGuides(preview);
}

function renderRoomGeometryMasterMpu(preview = null) {
  const mpuValue = Number(preview?.mpu ?? metersPerUnit) || 1;
  const text = `m/u ${formatNumber(mpuValue, 2)}`;
  const values = {
    width: roomMasterAxis === 'width' ? text : '',
    length: roomMasterAxis === 'length' ? text : '',
    rear: roomMasterAxis === 'rear' ? text : '',
    height: roomMasterAxis === 'height' ? text : ''
  };
  if (roomMasterMpuWidthEl) roomMasterMpuWidthEl.textContent = values.width;
  if (roomMasterMpuLengthEl) roomMasterMpuLengthEl.textContent = values.length;
  if (roomMasterMpuRearEl) roomMasterMpuRearEl.textContent = values.rear;
  if (roomMasterMpuHeightEl) roomMasterMpuHeightEl.textContent = values.height;
}

function setRoomFieldEditable(inputEl, editable) {
  if (!inputEl) return;
  inputEl.readOnly = !editable;
  inputEl.tabIndex = editable ? 0 : -1;
  inputEl.style.pointerEvents = editable ? 'auto' : 'none';
  inputEl.classList.toggle('derived-field', !editable);
  inputEl.style.background = editable ? 'rgba(255,255,255,0.08)' : 'transparent';
  inputEl.style.border = editable ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent';
  inputEl.style.color = editable ? '#dfe8f3' : 'rgba(223,232,243,0.88)';
  inputEl.style.boxShadow = 'none';
}

function syncRoomMasterAxisUI() {
  roomMasterAxisInputs.forEach((input) => {
    input.checked = input.value === roomMasterAxis;
  });
}

function refreshRoomGeometryInputState() {
  const axes = ['width', 'length', 'height', 'rear'];
  syncRoomMasterAxisUI();

  axes.forEach((axis) => {
    const isMaster = axis === roomMasterAxis;
    const sizeEl = getRoomSizeInputEl(axis);
    const ratioEl = getRoomRatioInputEl(axis);
    const driverEl = getRoomDriverEl(axis);
    const driver = roomAxisDrivers[axis] === 'ratio' ? 'ratio' : 'size';

    if (driverEl) {
      setRoomDriverValue(axis, driver);
      driverEl.disabled = isMaster;
    }
    const sizeEditable = isMaster || driver === 'size';
    const ratioEditable = isMaster || driver === 'ratio';
    setRoomFieldEditable(sizeEl, sizeEditable);
    setRoomFieldEditable(ratioEl, ratioEditable);
  });
  updateRoomGeometryLivePreview();
  updateRoomGeometryButtonsState();
}

function renderRoomRatioDisplay() {
  const dimW = roomRatio.width * metersPerUnit * 2;
  const dimL = roomRatio.length * metersPerUnit;
  const dimH = roomRatio.height * metersPerUnit;
  const dimRear = roomRatio.rear * metersPerUnit;
  if (roomDimWidthInputEl) roomDimWidthInputEl.value = formatNumber(dimW, 2);
  if (roomDimLengthInputEl) roomDimLengthInputEl.value = formatNumber(dimL, 2);
  if (roomDimHeightInputEl) roomDimHeightInputEl.value = formatNumber(dimH, 2);
  if (roomDimRearInputEl) roomDimRearInputEl.value = formatNumber(dimRear, 2);
  if (roomRatioWidthInputEl) roomRatioWidthInputEl.value = formatNumber(roomRatio.width, 2);
  if (roomRatioLengthInputEl) roomRatioLengthInputEl.value = formatNumber(roomRatio.length, 2);
  if (roomRatioHeightInputEl) roomRatioHeightInputEl.value = formatNumber(roomRatio.height, 2);
  if (roomRatioRearInputEl) roomRatioRearInputEl.value = formatNumber(roomRatio.rear, 2);
  renderRoomCenterBlendControl(roomRatio.centerBlend);
  renderRoomGeometryMasterMpu();
  renderRoomGeometrySummary();
  normalizeRoomGeometryInputDisplays();
  refreshRoomGeometryInputState();
  setRoomGeometryBaselineFromInputs();
}

function updateRoomRatioDisplay() {
  dirtyRoomRatio = true;
  scheduleUIFlush();
}

function renderSpreadDisplay() {
  if (!spreadInfoEl) return;
  const minDeg = spreadState.min === null ? null : spreadState.min * 180.0;
  const maxDeg = spreadState.max === null ? null : spreadState.max * 180.0;
  const minText = minDeg === null ? '—' : formatNumber(minDeg, 0);
  const maxText = maxDeg === null ? '—' : formatNumber(maxDeg, 0);
  const modeText = spreadState.fromDistance === null ? '—' : spreadState.fromDistance ? 'distance' : 'object_size';
  spreadInfoEl.textContent = `spread: ${minText}° / ${maxText}° | mode: ${modeText}`;
  if (spreadMinSliderEl) {
    const value = minDeg === null ? 0 : minDeg;
    spreadMinSliderEl.value = String(value);
  }
  if (spreadMaxSliderEl) {
    const value = maxDeg === null ? 180 : maxDeg;
    spreadMaxSliderEl.value = String(value);
  }
  if (spreadMinValEl) {
    spreadMinValEl.textContent = minDeg === null ? '—' : `${formatNumber(minDeg, 0)}°`;
  }
  if (spreadMaxValEl) {
    spreadMaxValEl.textContent = maxDeg === null ? '—' : `${formatNumber(maxDeg, 0)}°`;
  }
  if (spreadFromDistanceToggleEl) {
    spreadFromDistanceToggleEl.checked = spreadState.fromDistance === true;
  }
  if (spreadFromDistanceParamsEl) {
    spreadFromDistanceParamsEl.classList.toggle('open', spreadState.fromDistance === true);
  }
  if (spreadDistanceRangeSliderEl && spreadState.distanceRange !== null) {
    spreadDistanceRangeSliderEl.value = String(spreadState.distanceRange);
  }
  if (spreadDistanceRangeValEl) {
    const v = spreadState.distanceRange === null ? '—' : formatNumber(spreadState.distanceRange, 2);
    spreadDistanceRangeValEl.textContent = v;
  }
  if (spreadDistanceCurveSliderEl && spreadState.distanceCurve !== null) {
    spreadDistanceCurveSliderEl.value = String(spreadState.distanceCurve);
  }
  if (spreadDistanceCurveValEl) {
    const v = spreadState.distanceCurve === null ? '—' : formatNumber(spreadState.distanceCurve, 2);
    spreadDistanceCurveValEl.textContent = v;
  }
}

function updateSpreadDisplay() {
  dirtySpread = true;
  scheduleUIFlush();
}

function renderVbapStatus() {
  if (!vbapStatusEl) return;
  vbapStatusEl.classList.remove('computing', 'ready');
  if (vbapRecomputing === true) {
    vbapStatusEl.textContent = 'VBAP: computing...';
    vbapStatusEl.classList.add('computing');
  } else if (vbapRecomputing === false) {
    vbapStatusEl.textContent = 'VBAP: up to date';
    vbapStatusEl.classList.add('ready');
  } else {
    vbapStatusEl.textContent = 'VBAP status: —';
  }
}

function renderVbapCartesian() {
  if (vbapCartXSizeInputEl) {
    vbapCartXSizeInputEl.value = vbapCartesianState.xSize === null ? '' : String(vbapCartesianState.xSize);
  }
  if (vbapCartYSizeInputEl) {
    vbapCartYSizeInputEl.value = vbapCartesianState.ySize === null ? '' : String(vbapCartesianState.ySize);
  }
  if (vbapCartZSizeInputEl) {
    vbapCartZSizeInputEl.value = vbapCartesianState.zSize === null ? '' : String(vbapCartesianState.zSize);
  }
  const xStep = vbapCartesianState.xSize && vbapCartesianState.xSize > 0
    ? 2.0 / vbapCartesianState.xSize
    : null;
  const yStep = vbapCartesianState.ySize && vbapCartesianState.ySize > 0
    ? 2.0 / vbapCartesianState.ySize
    : null;
  const zRange = vbapAllowNegativeZ === false ? 1.0 : 2.0;
  const zStep = vbapCartesianState.zSize && vbapCartesianState.zSize > 0
    ? zRange / vbapCartesianState.zSize
    : null;
  const xStepMm = xStep === null ? null : xStep * metersPerUnit * 1000.0;
  const yStepMm = yStep === null ? null : yStep * metersPerUnit * 1000.0;
  const zStepMm = zStep === null ? null : zStep * metersPerUnit * 1000.0;
  if (vbapCartXStepInfoEl) vbapCartXStepInfoEl.textContent = xStepMm === null ? '—' : `${formatNumber(xStepMm, 1)}mm`;
  if (vbapCartYStepInfoEl) vbapCartYStepInfoEl.textContent = yStepMm === null ? '—' : `${formatNumber(yStepMm, 1)}mm`;
  if (vbapCartZStepInfoEl) vbapCartZStepInfoEl.textContent = zStepMm === null ? '—' : `${formatNumber(zStepMm, 1)}mm`;
  updateVbapCartesianFaceGrid();
  renderVbapCartesianGridToggle();
}

function updateVbapCartesian() {
  dirtyVbapCartesian = true;
  scheduleUIFlush();
}

function renderVbapPolar() {
  if (vbapPolarAzimuthResolutionInputEl) {
    vbapPolarAzimuthResolutionInputEl.value =
      vbapPolarState.azimuthResolution === null ? '' : String(vbapPolarState.azimuthResolution);
  }
  if (vbapPolarElevationResolutionInputEl) {
    vbapPolarElevationResolutionInputEl.value =
      vbapPolarState.elevationResolution === null ? '' : String(vbapPolarState.elevationResolution);
  }
  if (vbapPolarDistanceResInputEl) {
    vbapPolarDistanceResInputEl.value =
      vbapPolarState.distanceRes === null ? '' : String(vbapPolarState.distanceRes);
  }
  if (vbapPolarDistanceMaxInputEl) {
    vbapPolarDistanceMaxInputEl.value =
      vbapPolarState.distanceMax === null ? '' : String(vbapPolarState.distanceMax);
  }
  if (vbapElevationRangeInfoEl) {
    const txt = vbapAllowNegativeZ === null
      ? '—'
      : vbapAllowNegativeZ
        ? '-90..90'
        : '0..90';
    vbapElevationRangeInfoEl.textContent = txt;
  }
  if (vbapAzimuthRangeInfoEl) {
    vbapAzimuthRangeInfoEl.textContent = '-180..180';
  }
  const azStep = vbapPolarState.azimuthResolution && vbapPolarState.azimuthResolution > 0
    ? 360.0 / vbapPolarState.azimuthResolution
    : null;
  const elRange = vbapAllowNegativeZ === false ? 90.0 : 180.0;
  const elStep = vbapPolarState.elevationResolution && vbapPolarState.elevationResolution > 0
    ? elRange / vbapPolarState.elevationResolution
    : null;
  const dStep = (vbapPolarState.distanceRes && vbapPolarState.distanceRes > 0 && vbapPolarState.distanceMax && vbapPolarState.distanceMax > 0)
    ? vbapPolarState.distanceMax / vbapPolarState.distanceRes
    : null;
  if (vbapPolarAzStepInfoEl) vbapPolarAzStepInfoEl.textContent = azStep === null ? '—' : `${formatNumber(azStep, 2)}°`;
  if (vbapPolarElStepInfoEl) vbapPolarElStepInfoEl.textContent = elStep === null ? '—' : `${formatNumber(elStep, 2)}°`;
  if (vbapPolarDistStepInfoEl) vbapPolarDistStepInfoEl.textContent = dStep === null ? '—' : `${formatNumber(dStep, 3)}`;
}

function updateVbapPolar() {
  dirtyVbapPolar = true;
  scheduleUIFlush();
}

function renderLoudnessDisplay() {
  if (!loudnessInfoEl) return;
  const enabledText = loudnessEnabled === null ? '—' : loudnessEnabled ? 'on' : 'off';
  const sourceText = loudnessSource === null ? '—' : `${formatNumber(loudnessSource, 0)} dBFS`;
  const correctionDbValue =
    loudnessGain === null || Number(loudnessGain) <= 0
      ? null
      : 20 * Math.log10(Number(loudnessGain));
  const targetValue =
    loudnessSource !== null && correctionDbValue !== null
      ? loudnessSource + correctionDbValue
      : null;
  const targetText = targetValue === null ? '—' : `${formatNumber(targetValue, 0)} dBFS`;
  const gainText =
    loudnessGain === null
      ? '—'
      : `${formatNumber(loudnessGain, 2)} (${linearToDb(loudnessGain)})`;
  loudnessInfoEl.textContent = `source loudness: ${sourceText} | target loudness: ${targetText} | correction: ${gainText} | ${enabledText}`;
  if (loudnessToggleEl) {
    loudnessToggleEl.checked = loudnessEnabled === true;
  }
}

function updateLoudnessDisplay() {
  dirtyLoudness = true;
  scheduleUIFlush();
}

function renderAdaptiveResamplingUI() {
  if (!adaptiveResamplingToggleEl) return;
  adaptiveResamplingToggleEl.checked = adaptiveResamplingEnabled === true;
}

function updateAdaptiveResamplingUI() {
  dirtyAdaptiveResampling = true;
  dirtyResample = true;
  scheduleUIFlush();
}

function renderDistanceDiffuseUI() {
  if (distanceDiffuseToggleEl) {
    distanceDiffuseToggleEl.checked = distanceDiffuseState.enabled === true;
  }
  if (distanceDiffuseParamsEl) {
    distanceDiffuseParamsEl.classList.toggle('open', distanceDiffuseState.enabled === true);
  }
  if (distanceDiffuseThresholdSliderEl && distanceDiffuseState.threshold !== null) {
    distanceDiffuseThresholdSliderEl.value = String(distanceDiffuseState.threshold);
  }
  if (distanceDiffuseThresholdValEl) {
    const v = distanceDiffuseState.threshold === null ? '—' : formatNumber(distanceDiffuseState.threshold, 2);
    distanceDiffuseThresholdValEl.textContent = v;
  }
  if (distanceDiffuseCurveSliderEl && distanceDiffuseState.curve !== null) {
    distanceDiffuseCurveSliderEl.value = String(distanceDiffuseState.curve);
  }
  if (distanceDiffuseCurveValEl) {
    const v = distanceDiffuseState.curve === null ? '—' : formatNumber(distanceDiffuseState.curve, 2);
    distanceDiffuseCurveValEl.textContent = v;
  }
}

function updateDistanceDiffuseUI() {
  dirtyDistanceDiffuse = true;
  scheduleUIFlush();
}

function setDistanceDiffuseInfoModalOpen(open) {
  if (!distanceDiffuseInfoModalEl) return;
  distanceDiffuseInfoModalEl.classList.toggle('open', Boolean(open));
}

function setSpreadFromDistanceInfoModalOpen(open) {
  if (!spreadFromDistanceInfoModalEl) return;
  spreadFromDistanceInfoModalEl.classList.toggle('open', Boolean(open));
}

function setTrailInfoModalOpen(open) {
  if (!trailInfoModalEl) return;
  trailInfoModalEl.classList.toggle('open', Boolean(open));
}

function renderConfigSavedUI() {
  if (!configSavedIndicatorEl) return;
  configSavedIndicatorEl.textContent = '';
  if (saveConfigBtnEl) {
    const alreadySaved = configSaved === true;
    saveConfigBtnEl.disabled = alreadySaved;
    saveConfigBtnEl.style.opacity = alreadySaved ? '0.5' : '1';
    saveConfigBtnEl.style.cursor = alreadySaved ? 'default' : 'pointer';
  }
}

function updateConfigSavedUI() {
  dirtyConfigSaved = true;
  scheduleUIFlush();
}

function renderLatencyDisplay() {
  if (!latencyInfoEl) return;
  const instantShown = latencyInstantTrendMs ?? latencyInstantMs;
  const instantText = instantShown === null ? '—' : `${formatNumber(instantShown, 0)} ms`;
  latencyInfoEl.textContent = `latency:   ${instantText}`;
  if (latencyTargetInputEl && !latencyTargetEditing && !latencyTargetDirty) {
    const targetValue = latencyTargetMs ?? latencyMs;
    latencyTargetInputEl.value = targetValue === null ? '' : String(Math.max(1, Math.round(targetValue)));
  }
}

function updateLatencyDisplay() {
  dirtyLatency = true;
  scheduleUIFlush();
}

function renderResampleRatioDisplay() {
  if (!resampleRatioInfoEl) return;
  if (adaptiveResamplingEnabled !== true) {
    resampleRatioInfoEl.style.display = 'none';
    return;
  }
  resampleRatioInfoEl.style.display = '';
  if (resampleRatio === null) {
    resampleRatioInfoEl.textContent = 'resample: —';
    return;
  }
  // Express as ppm deviation from nominal (1.0)
  const ppm = Math.round((resampleRatio - 1.0) * 1e6);
  const sign = ppm >= 0 ? '+' : '';
  resampleRatioInfoEl.textContent = `resample: ${sign}${ppm} ppm`;
}

function updateResampleRatioDisplay() {
  dirtyResample = true;
  scheduleUIFlush();
}

function renderAudioFormatDisplay() {
  if (audioFormatInfoEl) {
    const rateText = audioSampleRate ? `${audioSampleRate} Hz` : '—';
    const fmtText = audioSampleFormat || '—';
    audioFormatInfoEl.textContent = `audio: ${rateText} / ${fmtText}`;
  }
  if (audioSampleRateInputEl && !audioSampleRateEditing) {
    audioSampleRateInputEl.value = String(audioSampleRate || 0);
  }
}

function closeAudioSampleRateMenu() {
  if (!audioSampleRateMenuEl) return;
  audioSampleRateMenuEl.style.display = 'none';
}

function openAudioSampleRateMenu() {
  if (!audioSampleRateMenuEl) return;
  audioSampleRateEditing = true;
  audioSampleRateMenuEl.innerHTML = '';
  AUDIO_SAMPLE_RATE_PRESETS.forEach((rate) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.style.cssText = 'display:block;width:100%;text-align:left;background:none;border:none;color:#d9ecff;padding:0.25rem 0.35rem;border-radius:6px;cursor:pointer;font-size:12px';
    item.textContent = rate === 0 ? 'Native (0)' : `${rate} Hz`;
    item.addEventListener('click', () => {
      if (audioSampleRateInputEl) {
        audioSampleRateInputEl.value = String(rate);
      }
      closeAudioSampleRateMenu();
    });
    item.addEventListener('mouseenter', () => {
      item.style.background = 'rgba(255,255,255,0.12)';
    });
    item.addEventListener('mouseleave', () => {
      item.style.background = 'transparent';
    });
    audioSampleRateMenuEl.appendChild(item);
  });
  audioSampleRateMenuEl.style.display = 'block';
}

function updateAudioFormatDisplay() {
  dirtyAudioFormat = true;
  scheduleUIFlush();
}

function renderLatencyMeterUI() {
  if (!latencyMeterFillEl) return;
  const displayed = latencyInstantTrendMs ?? latencyInstantMs ?? latencyTargetMs ?? latencyMs;
  if (displayed === null) {
    latencyMeterFillEl.style.setProperty('--level', '0%');
    return;
  }
  const value = Math.max(0, Number(displayed));
  const maxMs = 2000;
  const percent = Math.min(100, (value / maxMs) * 100);
  latencyMeterFillEl.style.setProperty('--level', `${percent.toFixed(1)}%`);
}

function updateLatencyMeterUI() {
  dirtyLatency = true;
  scheduleUIFlush();
}

function renderMasterGainUI() {
  if (masterGainSliderEl) {
    masterGainSliderEl.value = String(masterGain);
  }
  if (masterGainBoxEl) {
    masterGainBoxEl.textContent = linearToDb(masterGain);
  }
}

function updateMasterGainUI() {
  dirtyMasterGain = true;
  scheduleUIFlush();
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
  const maxDim = Math.max(roomRatio.width, roomRatio.length, roomRatio.height, roomRatio.rear, 1e-6);
  const xMax = (roomRatio.length / maxDim) * 2;
  const xMin = -(roomRatio.rear / maxDim) * 2;
  const yMax = (roomRatio.height / maxDim) * 2;
  const halfZ = (roomRatio.width / maxDim) * 2;
  const depthHalfX = Math.max(0.001, (xMax - xMin) * 0.5);
  const xCenter = (xMin + xMax) * 0.5;

  roomBounds.xMin = xMin;
  roomBounds.xMax = xMax;
  roomBounds.yMin = 0;
  roomBounds.yMax = yMax;
  roomBounds.zMin = -halfZ;
  roomBounds.zMax = halfZ;

  roomGroup.scale.set(1, 1, 1);

  room.scale.set(depthHalfX, yMax, halfZ);
  room.position.set(xCenter, yMax * 0.5, 0);
  roomEdges.scale.set(depthHalfX, yMax, halfZ);
  roomEdges.position.set(xCenter, 0, 0);

  roomFaces.posX.position.set(xMax, yMax * 0.5, 0);
  roomFaces.posX.scale.set(halfZ, yMax, 1);
  roomFaces.negX.position.set(xMin, yMax * 0.5, 0);
  roomFaces.negX.scale.set(halfZ, yMax, 1);
  roomFaces.posY.position.set(xCenter, yMax, 0);
  roomFaces.posY.scale.set(depthHalfX, halfZ, 1);
  roomFaces.negY.position.set(xCenter, 0, 0);
  roomFaces.negY.scale.set(depthHalfX, halfZ, 1);
  roomFaces.posZ.position.set(xCenter, yMax * 0.5, halfZ);
  roomFaces.posZ.scale.set(depthHalfX, yMax, 1);
  roomFaces.negZ.position.set(xCenter, yMax * 0.5, -halfZ);
  roomFaces.negZ.scale.set(depthHalfX, yMax, 1);

  fitScreenToUpperHalf();
  updateRoomDimensionGuides();
  updateVbapCartesianFaceGrid();
}

function depthWarpWithRatios(rawDepth, frontRatio, rearRatio, centerBlend = 0.5) {
  const d = Math.max(-1, Math.min(1, Number(rawDepth) || 0));
  const f = Number(frontRatio) || 1;
  const r = Number(rearRatio) || 1;
  const blend = Math.max(0, Math.min(1, Number(centerBlend)));
  const center = r + (f - r) * blend;
  if (d >= 0) {
    const t = d;
    const a = center - f;
    const b = 2 * (f - center);
    return a * t * t * t + b * t * t + center * t;
  }
  const t = -d;
  const a = center - r;
  const b = 2 * (r - center);
  return -(a * t * t * t + b * t * t + center * t);
}

function mapRoomDepth(rawX) {
  return depthWarpWithRatios(rawX, roomRatio.length, roomRatio.rear, roomRatio.centerBlend);
}

function cartesianToSpherical(position) {
  const x = Number(position.x) || 0;
  const y = Number(position.y) || 0;
  const z = Number(position.z) || 0;
  const dist = Math.sqrt(x * x + y * y + z * z);
  const az = (Math.atan2(z, x) * 180) / Math.PI;
  const el = dist > 0 ? (Math.atan2(y, Math.sqrt(x * x + z * z)) * 180) / Math.PI : 0;
  return { az, el, dist };
}

function sphericalToCartesianDeg(az, el, dist) {
  const azRad = (az * Math.PI) / 180;
  const elRad = (el * Math.PI) / 180;
  const x = dist * Math.cos(elRad) * Math.cos(azRad);
  const y = dist * Math.sin(elRad);
  const z = dist * Math.cos(elRad) * Math.sin(azRad);
  return { x, y, z };
}

function normalizeAngleDeg(angle) {
  let a = angle;
  while (a > 180) a -= 360;
  while (a < -180) a += 360;
  return a;
}

function snapAngleDeg(angle, step, threshold) {
  const snapped = Math.round(angle / step) * step;
  return Math.abs(angle - snapped) <= threshold ? snapped : angle;
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setupNumericWheelEditing() {
  const decimalsFromStep = (stepAttr) => {
    if (!stepAttr || stepAttr === 'any') return null;
    const step = Number(stepAttr);
    if (!Number.isFinite(step) || step <= 0) return null;
    const raw = String(stepAttr).toLowerCase();
    if (raw.includes('e')) {
      const [mantissa, expRaw] = raw.split('e');
      const exp = Number(expRaw);
      if (!Number.isFinite(exp)) return null;
      const fracLen = (mantissa.split('.')[1] || '').length;
      return Math.max(0, fracLen - exp);
    }
    return (raw.split('.')[1] || '').length;
  };

  const numberInputs = Array.from(document.querySelectorAll('input[type="number"]'));
  numberInputs.forEach((inputEl) => {
    inputEl.addEventListener('wheel', (event) => {
      if (inputEl.disabled || inputEl.readOnly) return;
      const delta = Math.sign(event.deltaY);
      if (delta === 0) return;

      event.preventDefault();
      event.stopPropagation();
      if (document.activeElement !== inputEl) {
        inputEl.focus({ preventScroll: true });
      }

      const before = inputEl.value;
      const repeats = event.shiftKey ? 10 : 1;
      try {
        for (let i = 0; i < repeats; i += 1) {
          if (delta < 0) inputEl.stepUp();
          else inputEl.stepDown();
        }
      } catch (_e) {
        return;
      }
      if (inputEl.value === before) return;
      const decimals = decimalsFromStep(inputEl.getAttribute('step'));
      if (decimals !== null) {
        const v = Number(inputEl.value);
        if (Number.isFinite(v)) {
          inputEl.value = v.toFixed(decimals);
        }
      }
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    }, { passive: false });
  });
}

function projectRayOntoAxis(rayOrigin, rayDirection, axisOrigin, axisDirection) {
  const w0 = new THREE.Vector3().subVectors(axisOrigin, rayOrigin);
  const b = axisDirection.dot(rayDirection);
  const d = axisDirection.dot(w0);
  const e = rayDirection.dot(w0);
  const den = 1 - (b * b);
  if (Math.abs(den) < 1e-6) {
    return 0;
  }
  return ((b * e) - d) / den;
}

function updateSpeakerGizmo() {
  const polarActive = activeEditMode === 'polar' && selectedSpeakerIndex !== null && polarEditArmed;
  const cartesianActive = activeEditMode === 'cartesian' && selectedSpeakerIndex !== null && cartesianEditArmed;

  cartesianGizmo.group.visible = false;

  if (!polarActive) {
    speakerGizmo.ring.visible = false;
    speakerGizmo.ringTicks.visible = false;
    speakerGizmo.ringMinorTicks.visible = false;
    speakerGizmo.arc.visible = false;
    speakerGizmo.arcTicks.visible = false;
    speakerGizmo.arcMinorTicks.visible = false;
    speakerGizmo.ringLabels.visible = false;
    speakerGizmo.arcLabels.visible = false;
    speakerGizmo.ringCurrent.visible = false;
    speakerGizmo.arcCurrent.visible = false;
    distanceGizmo.group.visible = false;
  } else {
    const mesh = speakerMeshes[selectedSpeakerIndex];
    if (!mesh) {
      speakerGizmo.ring.visible = false;
      speakerGizmo.ringTicks.visible = false;
      speakerGizmo.ringMinorTicks.visible = false;
      speakerGizmo.arc.visible = false;
      speakerGizmo.arcTicks.visible = false;
      speakerGizmo.arcMinorTicks.visible = false;
      speakerGizmo.ringLabels.visible = false;
      speakerGizmo.arcLabels.visible = false;
      speakerGizmo.ringCurrent.visible = false;
      speakerGizmo.arcCurrent.visible = false;
      distanceGizmo.group.visible = false;
    } else {
      const { az, el, dist } = cartesianToSpherical(mesh.position);
      dragAzimuthDeg = az;
      dragElevationDeg = el;
      dragDistance = Math.max(0.01, dist);

      speakerGizmo.ring.visible = true;
      speakerGizmo.ringTicks.visible = !isDraggingSpeaker || dragAzimuthDelta > 0.1;
      speakerGizmo.ringMinorTicks.visible = isDraggingSpeaker && dragAzimuthDelta >= 0 && dragAzimuthDelta <= 0.1;
      speakerGizmo.arc.visible = true;
      speakerGizmo.arcTicks.visible = !isDraggingSpeaker || dragElevationDelta > 0.1;
      speakerGizmo.arcMinorTicks.visible = isDraggingSpeaker && dragElevationDelta >= 0 && dragElevationDelta <= 0.1;
      speakerGizmo.ringLabels.visible = true;
      speakerGizmo.arcLabels.visible = true;
      speakerGizmo.ringCurrent.visible = true;
      speakerGizmo.arcCurrent.visible = true;
      distanceGizmo.group.visible = true;

      speakerGizmo.ring.position.set(0, 0, 0);
      speakerGizmo.ring.scale.set(dragDistance, 1, dragDistance);
      speakerGizmo.ringTicks.position.set(0, 0, 0);
      speakerGizmo.ringTicks.scale.set(dragDistance, 1, dragDistance);
      speakerGizmo.ringMinorTicks.position.set(0, 0, 0);
      speakerGizmo.ringMinorTicks.scale.set(dragDistance, 1, dragDistance);
      speakerGizmo.ringLabels.position.set(0, 0, 0);
      speakerGizmo.ringLabels.scale.set(dragDistance, 1, dragDistance);
      speakerGizmo.ringCurrent.position.set(0, 0, 0);
      speakerGizmo.ringCurrent.scale.set(dragDistance, 1, dragDistance);

      const azRad = (az * Math.PI) / 180;
      speakerGizmo.arc.position.set(0, 0, 0);
      speakerGizmo.arc.scale.set(dragDistance, dragDistance, dragDistance);
      speakerGizmo.arc.rotation.set(0, -azRad, 0);
      speakerGizmo.arcTicks.position.set(0, 0, 0);
      speakerGizmo.arcTicks.scale.set(dragDistance, dragDistance, dragDistance);
      speakerGizmo.arcTicks.rotation.set(0, -azRad, 0);
      speakerGizmo.arcMinorTicks.position.set(0, 0, 0);
      speakerGizmo.arcMinorTicks.scale.set(dragDistance, dragDistance, dragDistance);
      speakerGizmo.arcMinorTicks.rotation.set(0, -azRad, 0);
      speakerGizmo.arcLabels.position.set(0, 0, 0);
      speakerGizmo.arcLabels.scale.set(dragDistance, dragDistance, dragDistance);
      speakerGizmo.arcLabels.rotation.set(0, -azRad, 0);
      speakerGizmo.arcCurrent.position.set(0, 0, 0);
      speakerGizmo.arcCurrent.scale.set(dragDistance, dragDistance, dragDistance);
      speakerGizmo.arcCurrent.rotation.set(0, -azRad, 0);

      ringLabelAngles.forEach((angle, idx) => {
        const sprite = speakerGizmo.ringLabels.children[idx];
        const rad = (angle * Math.PI) / 180;
        const r = 1.1;
        sprite.position.set(Math.cos(rad) * r, 0.02, Math.sin(rad) * r);
      });

      arcLabelAngles.forEach((angle, idx) => {
        const sprite = speakerGizmo.arcLabels.children[idx];
        const rad = (angle * Math.PI) / 180;
        const r = 1.1;
        sprite.position.set(Math.cos(rad) * r, Math.sin(rad) * r, 0);
      });

      const ringAngle = normalizeAngleDeg(dragAzimuthDeg);
      const ringRad = (ringAngle * Math.PI) / 180;
      speakerGizmo.ringCurrentLabel.position.set(Math.cos(ringRad) * 1.24, 0.04, Math.sin(ringRad) * 1.24);
      setLabelSpriteText(speakerGizmo.ringCurrentLabel, `${ringAngle.toFixed(1)}`);

      const arcAngle = dragElevationDeg;
      const arcRad = (arcAngle * Math.PI) / 180;
      speakerGizmo.arcCurrentLabel.position.set(Math.cos(arcRad) * 1.24, Math.sin(arcRad) * 1.24, 0);
      setLabelSpriteText(speakerGizmo.arcCurrentLabel, `${arcAngle.toFixed(1)}`);

      const speakerPos = mesh.position.clone();
      const dir = speakerPos.length() > 1e-6 ? speakerPos.clone().normalize() : new THREE.Vector3(1, 0, 0);
      const lineGeom = distanceGizmo.line.geometry;
      lineGeom.setFromPoints([new THREE.Vector3(0, 0, 0), speakerPos.clone()]);
      lineGeom.attributes.position.needsUpdate = true;

      const arrowOffset = 0.1;
      distanceGizmo.arrowA.position.copy(dir.clone().multiplyScalar(arrowOffset));
      distanceGizmo.arrowB.position.copy(speakerPos.clone().add(dir.clone().multiplyScalar(-arrowOffset)));

      const up = new THREE.Vector3(0, 1, 0);
      const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
      distanceGizmo.arrowA.quaternion.copy(quat);
      const quatB = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().negate());
      distanceGizmo.arrowB.quaternion.copy(quatB);

      const mid = speakerPos.clone().multiplyScalar(0.5);
      distanceGizmo.label.position.set(mid.x, mid.y + 0.08, mid.z);
      setLabelSpriteText(distanceGizmo.label, `${speakerPos.length().toFixed(2)}`);
    }
  }

  if (cartesianActive) {
    const mesh = speakerMeshes[selectedSpeakerIndex];
    if (!mesh) {
      cartesianGizmo.group.visible = false;
    } else {
      cartesianGizmo.group.visible = true;
      cartesianGizmo.group.position.copy(mesh.position);
      const scale = Math.max(0.2, camera.position.distanceTo(mesh.position) * 0.08);
      cartesianGizmo.group.scale.setScalar(scale);
    }
  }
}

function setSelectedSpeaker(index) {
  if (index === null) {
    polarEditArmed = false;
    cartesianEditArmed = false;
  }
  selectedSpeakerIndex = index;
  updateSpeakerColorsFromSelection();
  updateSpeakerGizmo();
  updateSpeakerControlsUI();
  updateControlsForEditMode();
}

function updateControlsForEditMode() {
  controls.enableZoom = true;
}

function updateRoomFaceVisibility() {
  tempCameraLocal.copy(camera.position);
  roomGroup.worldToLocal(tempCameraLocal);
  roomFaceDefs.forEach((entry) => {
    const facePos = entry.mesh.position;
    tempToCamera.set(
      tempCameraLocal.x - facePos.x,
      tempCameraLocal.y - facePos.y,
      tempCameraLocal.z - facePos.z
    );
    tempToCenter.set(-facePos.x, -facePos.y, -facePos.z);
    const camSide = entry.inward.dot(tempToCamera);
    entry.mesh.visible = camSide > 0;
  });
  syncVbapCartesianFaceGridVisibility();

  const screenFace = roomFaceDefs.find((entry) => entry.key === 'posX');
  if (screenFace) {
    const facePos = screenFace.mesh.position;
    tempToCamera.set(
      tempCameraLocal.x - facePos.x,
      tempCameraLocal.y - facePos.y,
      tempCameraLocal.z - facePos.z
    );
    const camSide = screenFace.inward.dot(tempToCamera);
    const isInside = camSide > 0;
    screenMaterial.opacity = isInside ? 0.18 : 0.18;
  }
}

function updateSelectedSpeakerFaceShadows() {
  const index = selectedSpeakerIndex;
  const mesh = index !== null ? speakerMeshes[index] : null;
  if (!mesh) {
    Object.values(selectedSpeakerShadows).forEach((shadow) => {
      shadow.visible = false;
    });
    return;
  }

  const xMin = roomBounds.xMin;
  const xMax = roomBounds.xMax;
  const yMin = roomBounds.yMin;
  const yMax = roomBounds.yMax;
  const zMin = roomBounds.zMin;
  const zMax = roomBounds.zMax;
  const spanX = Math.max(1e-6, xMax - xMin);
  const spanY = Math.max(1e-6, yMax - yMin);
  const spanZ = Math.max(1e-6, zMax - zMin);
  const p = mesh.position;
  const eps = 0.01;
  const baseRadius = 0.08;

  const clampedX = clampNumber(p.x, xMin, xMax);
  const clampedY = clampNumber(p.y, yMin, yMax);
  const clampedZ = clampNumber(p.z, zMin, zMax);

  const setShadow = (shadow, x, y, z, dist, maxDist) => {
    const t = maxDist > 1e-6 ? clampNumber(1 - (dist / maxDist), 0.08, 1) : 1;
    shadow.visible = true;
    shadow.position.set(x, y, z);
    shadow.scale.setScalar(baseRadius * (0.7 + 0.6 * t));
    shadow.material.opacity = 0.06 + 0.18 * t;
  };

  setShadow(selectedSpeakerShadows.posX, xMax - eps, clampedY, clampedZ, Math.abs(xMax - p.x), spanX);
  setShadow(selectedSpeakerShadows.negX, xMin + eps, clampedY, clampedZ, Math.abs(xMin - p.x), spanX);
  setShadow(selectedSpeakerShadows.posY, clampedX, yMax - eps, clampedZ, Math.abs(yMax - p.y), spanY);
  setShadow(selectedSpeakerShadows.negY, clampedX, yMin + eps, clampedZ, Math.abs(yMin - p.y), spanY);
  setShadow(selectedSpeakerShadows.posZ, clampedX, clampedY, zMax - eps, Math.abs(zMax - p.z), spanZ);
  setShadow(selectedSpeakerShadows.negZ, clampedX, clampedY, zMin + eps, Math.abs(zMin - p.z), spanZ);
}

function updateSelectedObjectFaceShadows() {
  const mesh = selectedSourceId ? sourceMeshes.get(selectedSourceId) : null;
  if (!mesh) {
    Object.values(selectedObjectShadows).forEach((shadow) => {
      shadow.visible = false;
    });
    return;
  }

  const xMin = roomBounds.xMin;
  const xMax = roomBounds.xMax;
  const yMin = roomBounds.yMin;
  const yMax = roomBounds.yMax;
  const zMin = roomBounds.zMin;
  const zMax = roomBounds.zMax;
  const spanX = Math.max(1e-6, xMax - xMin);
  const spanY = Math.max(1e-6, yMax - yMin);
  const spanZ = Math.max(1e-6, zMax - zMin);
  const p = mesh.position;
  const eps = 0.01;
  const baseRadius = 0.09;

  const clampedX = clampNumber(p.x, xMin, xMax);
  const clampedY = clampNumber(p.y, yMin, yMax);
  const clampedZ = clampNumber(p.z, zMin, zMax);

  const setShadow = (shadow, x, y, z, dist, maxDist) => {
    const t = maxDist > 1e-6 ? clampNumber(1 - (dist / maxDist), 0.08, 1) : 1;
    shadow.visible = true;
    shadow.position.set(x, y, z);
    shadow.scale.setScalar(baseRadius * (0.7 + 0.7 * t));
    shadow.material.opacity = 0.05 + 0.16 * t;
  };

  setShadow(selectedObjectShadows.posX, xMax - eps, clampedY, clampedZ, Math.abs(xMax - p.x), spanX);
  setShadow(selectedObjectShadows.negX, xMin + eps, clampedY, clampedZ, Math.abs(xMin - p.x), spanX);
  setShadow(selectedObjectShadows.posY, clampedX, yMax - eps, clampedZ, Math.abs(yMax - p.y), spanY);
  setShadow(selectedObjectShadows.negY, clampedX, yMin + eps, clampedZ, Math.abs(yMin - p.y), spanY);
  setShadow(selectedObjectShadows.posZ, clampedX, clampedY, zMax - eps, Math.abs(zMax - p.z), spanZ);
  setShadow(selectedObjectShadows.negZ, clampedX, clampedY, zMin + eps, Math.abs(zMin - p.z), spanZ);
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
  sprite.userData.labelColor = '#ffffff';
  setLabelSpriteText(sprite, text);
  return sprite;
}

function createSmallLabelSprite(text, color = '#d9ecff') {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.25, 0.12, 1);
  sprite.userData.labelCanvas = canvas;
  sprite.userData.labelCtx = ctx;
  sprite.userData.labelTexture = texture;
  sprite.userData.labelText = '';
  sprite.userData.labelColor = color;
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
  ctx.font = canvas.width >= 200 ? 'bold 36px sans-serif' : 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = sprite.userData.labelColor || '#ffffff';
  ctx.fillText(nextText, canvas.width / 2, canvas.height / 2);
  sprite.userData.labelText = nextText;
  if (sprite.userData.labelTexture) {
    sprite.userData.labelTexture.needsUpdate = true;
  }
}

function createTrailLine() {
  const posArr = new Float32Array(300 * 3); // pre-allocated for max slider value
  const colArr = new Float32Array(300 * 3);
  const geometry = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(posArr, 3);
  const colAttr = new THREE.BufferAttribute(colArr, 3);
  posAttr.setUsage(THREE.DynamicDrawUsage);
  colAttr.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('position', posAttr);
  geometry.setAttribute('color', colAttr);
  geometry.setDrawRange(0, 0);
  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    depthTest: false,
    depthWrite: false
  });
  const line = new THREE.Line(geometry, material);
  line.renderOrder = 15;
  line.frustumCulled = false;
  return line;
}

function rebuildTrailGeometry(id) {
  const trail = sourceTrails.get(id);
  if (!trail) return;
  const count = trail.positions.length;
  if (count < 2) {
    trail.line.geometry.setDrawRange(0, 0);
    return;
  }
  const mesh = sourceMeshes.get(id);
  const r = mesh ? mesh.material.color.r : 0.8;
  const g = mesh ? mesh.material.color.g : 0.4;
  const b = mesh ? mesh.material.color.b : 0.2;
  const posAttr = trail.line.geometry.getAttribute('position');
  const colAttr = trail.line.geometry.getAttribute('color');
  for (let i = 0; i < count; i++) {
    const raw = trail.positions[i];
    posAttr.array[i * 3] = mapRoomDepth(raw.x);
    posAttr.array[i * 3 + 1] = raw.y * roomRatio.height;
    posAttr.array[i * 3 + 2] = raw.z * roomRatio.width;
    const t = count > 1 ? i / (count - 1) : 1; // 0=oldest (dark), 1=newest (full colour)
    colAttr.array[i * 3] = r * t;
    colAttr.array[i * 3 + 1] = g * t;
    colAttr.array[i * 3 + 2] = b * t;
  }
  posAttr.needsUpdate = true;
  colAttr.needsUpdate = true;
  trail.line.geometry.setDrawRange(0, count);
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
    if (selectedSpeakerIndex !== null && index === selectedSpeakerIndex) {
      mesh.material.color.copy(speakerSelectedColor);
    }

    const baseOpacity = Number(mesh.userData.baseOpacity ?? 0.65);
    if (!selectedSourceId) {
      mesh.material.opacity = baseOpacity;
      return;
    }

    mesh.material.opacity = mix <= 1e-6 ? Math.min(baseOpacity, 0.08) : baseOpacity;
  });
}

function setSelectedSource(id) {
  const nextId = id === null || id === undefined ? null : String(id);
  const currentSolo = getSoloTarget('object');
  if (nextId !== null && currentSolo && currentSolo !== nextId) {
    const ids = getObjectIds();
    ids.forEach((objId) => {
      const shouldMute = objId !== nextId;
      if (shouldMute) {
        objectMuted.add(objId);
      } else {
        objectMuted.delete(objId);
        objectManualMuted.delete(objId);
      }
      sendObjectMute(objId, shouldMute);
    });
    applyGroupGains('object');
  }
  selectedSourceId = nextId;
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
    const trailLine = createTrailLine();
    trailLine.visible = trailsEnabled;
    scene.add(mesh);
    scene.add(outline);
    scene.add(trailLine);

    const label = createLabelSprite(formatObjectLabel(id));
    label.userData.sourceId = id;
    scene.add(label);

    sourceMeshes.set(id, mesh);
    sourceLabels.set(id, label);
    sourceOutlines.set(id, outline);
    sourceTrails.set(id, { positions: [], line: trailLine });
    applySourceLevel(id, mesh, sourceLevels.get(id));
    updateSourceSelectionStyles();
  }
  return sourceMeshes.get(id);
}

function updateSource(id, position) {
  const mesh = getSourceMesh(id);
  const skipTrail = Boolean(position && position._noTrail);
  const now = performance.now();
  const raw = {
    x: Number(position.x) || 0,
    y: Number(position.y) || 0,
    z: Number(position.z) || 0,
    t: now
  };
  sourcePositionsRaw.set(String(id), raw);
  const scaled = {
    x: mapRoomDepth(raw.x),
    y: raw.y * roomRatio.height,
    z: raw.z * roomRatio.width
  };
  mesh.position.set(scaled.x, scaled.y, scaled.z);

  const trail = sourceTrails.get(id);
  if (trail && !skipTrail) {
    trail.positions.push(raw);
    if (trail.positions.length > trailMaxPoints) {
      trail.positions.shift();
    }
    if (trailsEnabled) {
      rebuildTrailGeometry(id);
    }
  }

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

function decayTrails(nowMs) {
  // Decay trails a few times per second; no need to run every frame.
  if (nowMs - lastTrailDecayAt < 120) return;
  lastTrailDecayAt = nowMs;

  const cutoff = nowMs - trailPointTtlMs;
  sourceTrails.forEach((trail, id) => {
    const before = trail.positions.length;
    if (before === 0) return;

    // Keep points with recent timestamps. Legacy points without timestamp are
    // treated as stale and dropped on first decay pass.
    trail.positions = trail.positions.filter((p) => typeof p.t === 'number' && p.t >= cutoff);
    if (trail.positions.length !== before) {
      rebuildTrailGeometry(id);
    }
  });
}

function updateSourceLevel(id, meter) {
  const key = String(id);
  sourceLevels.set(key, {
    peakDbfs: Number(meter?.peakDbfs ?? -100),
    rmsDbfs: Number(meter?.rmsDbfs ?? -100)
  });
  sourceLevelLastSeen.set(key, performance.now());
  const mesh = sourceMeshes.get(id);
  if (mesh) {
    applySourceLevel(id, mesh, sourceLevels.get(key));
  }
  updateObjectMeterUI(key);
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
  const trail = sourceTrails.get(id);
  if (trail) {
    scene.remove(trail.line);
    trail.line.geometry.dispose();
    trail.line.material.dispose();
    sourceTrails.delete(id);
  }
  mesh.geometry.dispose();
  mesh.material.dispose();
  sourceMeshes.delete(id);
  sourceLabels.delete(id);
  sourceLevels.delete(id);
  sourceLevelLastSeen.delete(String(id));
  sourceGains.delete(id);
  sourceOutlines.delete(id);
  sourceNames.delete(String(id));
  dirtyObjectMeters.delete(String(id));
  dirtyObjectPositions.delete(String(id));
  dirtyObjectLabels.delete(String(id));

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

function currentLayoutRef() {
  return currentLayoutKey ? layoutsByKey.get(currentLayoutKey) : null;
}

function requestAddSpeaker() {
  const layout = currentLayoutRef();
  if (!layout) return;
  const base = selectedSpeakerIndex !== null ? layout.speakers[selectedSpeakerIndex] : null;
  const nextIndex = layout.speakers.length;
  const speaker = {
    id: `spk-${nextIndex}`,
    x: Number(base?.x) || 0,
    y: Number(base?.y) || 0,
    z: Number(base?.z) || 0,
    azimuthDeg: Number(base?.azimuthDeg) || 0,
    elevationDeg: Number(base?.elevationDeg) || 0,
    distanceM: Math.max(0.01, Number(base?.distanceM) || 1),
    spatialize: Number(base?.spatialize ?? 1) ? 1 : 0,
    delay_ms: Math.max(0, Number(base?.delay_ms) || 0)
  };
  layout.speakers.push(speaker);
  renderLayout(currentLayoutKey);
  setSelectedSpeaker(layout.speakers.length - 1);
  invoke('control_speakers_add', {
    name: speaker.id,
    azimuth: Number(speaker.azimuthDeg) || 0,
    elevation: Number(speaker.elevationDeg) || 0,
    distance: Math.max(0.01, Number(speaker.distanceM) || 1),
    spatialize: Number(speaker.spatialize) ? 1 : 0,
    delayMs: Math.max(0, Number(speaker.delay_ms) || 0)
  });
}

function requestRemoveSpeaker() {
  const layout = currentLayoutRef();
  if (!layout || selectedSpeakerIndex === null) return;
  const idx = selectedSpeakerIndex;
  if (idx < 0 || idx >= layout.speakers.length) return;
  layout.speakers.splice(idx, 1);
  renderLayout(currentLayoutKey);
  const next = layout.speakers.length ? Math.max(0, idx - 1) : null;
  setSelectedSpeaker(next);
  invoke('control_speakers_remove', { index: idx });
}

function requestMoveSpeaker(delta) {
  const layout = currentLayoutRef();
  if (!layout || selectedSpeakerIndex === null) return;
  const from = selectedSpeakerIndex;
  const to = Math.max(0, Math.min(layout.speakers.length - 1, from + delta));
  requestMoveSpeakerTo(from, to, true);
}

function markDraggedSpeakerItem() {
  speakerItems.forEach((item) => {
    item.root.classList.toggle('is-dragging', draggedSpeakerRoot !== null && item.root === draggedSpeakerRoot);
  });
}

function animateSpeakerListReorder(mutate) {
  if (!speakersListEl) {
    mutate();
    return;
  }
  const items = Array.from(speakersListEl.querySelectorAll('.speaker-item'));
  const beforeTop = new Map();
  items.forEach((el) => {
    beforeTop.set(el, el.getBoundingClientRect().top);
  });

  mutate();

  const afterItems = Array.from(speakersListEl.querySelectorAll('.speaker-item'));
  afterItems.forEach((el) => {
    if (draggedSpeakerRoot && el === draggedSpeakerRoot) return;
    const prev = beforeTop.get(el);
    if (prev === undefined) return;
    const next = el.getBoundingClientRect().top;
    const dy = prev - next;
    if (Math.abs(dy) < 0.5) return;
    const prevAnim = speakerReorderAnimations.get(el);
    if (prevAnim) {
      prevAnim.cancel();
    }
    const anim = el.animate(
      [
        { transform: `translateY(${dy}px)` },
        { transform: 'translateY(0px)' }
      ],
      {
        duration: 120,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        fill: 'none'
      }
    );
    speakerReorderAnimations.set(el, anim);
    anim.onfinish = () => {
      if (speakerReorderAnimations.get(el) === anim) {
        speakerReorderAnimations.delete(el);
      }
    };
  });
}

function requestMoveSpeakerTo(from, to, sendOsc = true) {
  const layout = currentLayoutRef();
  if (!layout) return;
  if (!Number.isInteger(from) || !Number.isInteger(to)) return;
  if (from < 0 || to < 0 || from >= layout.speakers.length || to >= layout.speakers.length) return;
  if (from === to) return;

  const moved = layout.speakers.splice(from, 1)[0];
  layout.speakers.splice(to, 0, moved);

  let nextSelected = selectedSpeakerIndex;
  if (nextSelected === from) {
    nextSelected = to;
  } else if (nextSelected !== null) {
    if (from < to && nextSelected > from && nextSelected <= to) {
      nextSelected -= 1;
    } else if (to < from && nextSelected >= to && nextSelected < from) {
      nextSelected += 1;
    }
  }

  renderLayout(currentLayoutKey);
  setSelectedSpeaker(nextSelected);
  if (sendOsc) {
    invoke('control_speakers_move', { from, to });
  }
  markDraggedSpeakerItem();
}

if (speakersListEl) {
  speakersListEl.addEventListener('dragenter', (event) => {
    if (draggedSpeakerRoot === null) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  });

  speakersListEl.addEventListener('dragover', (event) => {
    if (draggedSpeakerIndex === null || !draggedSpeakerRoot) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    // Let per-item handlers manage direct item hover. This path handles gaps.
    const target = event.target;
    if (target instanceof Element && target.closest('.speaker-item')) return;
    const items = Array.from(speakersListEl.querySelectorAll('.speaker-item'));
    let insertBefore = null;
    for (const item of items) {
      if (item === draggedSpeakerRoot) continue;
      const rect = item.getBoundingClientRect();
      if (event.clientY < rect.top + rect.height * 0.5) {
        insertBefore = item;
        break;
      }
    }
    animateSpeakerListReorder(() => {
      speakersListEl.insertBefore(draggedSpeakerRoot, insertBefore);
    });
    draggedSpeakerIndex = Array.from(speakersListEl.querySelectorAll('.speaker-item')).indexOf(draggedSpeakerRoot);
    markDraggedSpeakerItem();
  });

  speakersListEl.addEventListener('drop', (event) => {
    if (draggedSpeakerIndex === null) return;
    event.preventDefault();
    draggedSpeakerDidDrop = true;
  });
}

// Ensure the browser keeps "drop allowed" cursor over any child node inside the speakers list.
document.addEventListener('dragover', (event) => {
  if (!draggedSpeakerRoot || !speakersListEl) return;
  const target = event.target;
  if (!(target instanceof Node) || !speakersListEl.contains(target)) return;
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
});

function renderLayout(key) {
  clearSpeakers();
  const layout = layoutsByKey.get(key);
  if (!layout) {
    currentLayoutKey = null;
    currentLayoutSpeakers = [];
    renderSpeakersList();
    selectedSpeakerIndex = null;
    polarEditArmed = false;
    cartesianEditArmed = false;
    updateSpeakerGizmo();
    updateControlsForEditMode();
    renderSpeakerEditor();
    return;
  }

  currentLayoutKey = key;
  currentLayoutSpeakers = Array.isArray(layout.speakers) ? layout.speakers : [];
  metersPerUnit = Math.max(0.01, Number(layout.radius_m) || 1.0);
  speakerDelays.clear();
  currentLayoutSpeakers.forEach((speaker, index) => {
    speakerDelays.set(String(index), speaker.delay_ms ?? 0);
  });
  selectedSpeakerIndex = null;
  polarEditArmed = false;
  cartesianEditArmed = false;
  updateSpeakerGizmo();
  updateControlsForEditMode();
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
    const baseOpacity = getSpeakerBaseOpacity(speaker);
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
  renderSpeakerEditor();
}

function updateSpeakerLevel(index, meter) {
  const key = String(index);
  speakerLevels.set(key, {
    peakDbfs: Number(meter?.peakDbfs ?? -100),
    rmsDbfs: Number(meter?.rmsDbfs ?? -100)
  });
  speakerLevelLastSeen.set(key, performance.now());
  const mesh = speakerMeshes[index];
  if (mesh) {
    applySpeakerLevel(mesh, speakerLevels.get(key));
  }
  updateSpeakerMeterUI(key);
  dirtyMasterMeter = true;
  scheduleUIFlush();
}

function decayMeters(nowMs) {
  if (lastMeterDecayAt === 0) {
    lastMeterDecayAt = nowMs;
    return;
  }
  const dtSec = Math.max(0, (nowMs - lastMeterDecayAt) / 1000);
  lastMeterDecayAt = nowMs;
  if (dtSec <= 0) return;

  const decayDb = METER_DECAY_DB_PER_SEC * dtSec;
  let anySpeakerChanged = false;

  sourceLevels.forEach((meter, id) => {
    const lastSeen = sourceLevelLastSeen.get(id) ?? nowMs;
    if (nowMs - lastSeen < METER_DECAY_START_MS) return;
    const prevPeak = Number(meter?.peakDbfs ?? -100);
    const prevRms = Number(meter?.rmsDbfs ?? -100);
    const nextPeak = Math.max(-100, prevPeak - decayDb);
    const nextRms = Math.max(-100, prevRms - decayDb);
    if (nextPeak === prevPeak && nextRms === prevRms) return;
    meter.peakDbfs = nextPeak;
    meter.rmsDbfs = nextRms;
    const mesh = sourceMeshes.get(id);
    if (mesh) {
      applySourceLevel(id, mesh, meter);
    }
    updateObjectMeterUI(id);
  });

  speakerLevels.forEach((meter, id) => {
    const lastSeen = speakerLevelLastSeen.get(id) ?? nowMs;
    if (nowMs - lastSeen < METER_DECAY_START_MS) return;
    const prevPeak = Number(meter?.peakDbfs ?? -100);
    const prevRms = Number(meter?.rmsDbfs ?? -100);
    const nextPeak = Math.max(-100, prevPeak - decayDb);
    const nextRms = Math.max(-100, prevRms - decayDb);
    if (nextPeak === prevPeak && nextRms === prevRms) return;
    meter.peakDbfs = nextPeak;
    meter.rmsDbfs = nextRms;
    const idx = Number(id);
    if (Number.isInteger(idx) && speakerMeshes[idx]) {
      applySpeakerLevel(speakerMeshes[idx], meter);
    }
    updateSpeakerMeterUI(id);
    anySpeakerChanged = true;
  });

  if (anySpeakerChanged) {
    dirtyMasterMeter = true;
    scheduleUIFlush();
  }
}

function applyRoomRatio(nextRatio) {
  roomRatio.width = Number(nextRatio.width) || 1;
  roomRatio.length = Number(nextRatio.length) || 1;
  roomRatio.height = Number(nextRatio.height) || 1;
  const rearValue = Number(nextRatio.rear);
  roomRatio.rear = Number.isFinite(rearValue) && rearValue > 0 ? rearValue : roomRatio.rear;
  const centerBlendValue = Number(nextRatio.centerBlend);
  roomRatio.centerBlend = Number.isFinite(centerBlendValue)
    ? Math.max(0, Math.min(1, centerBlendValue))
    : roomRatio.centerBlend;
  updateRoomRatioDisplay();
  applyRoomRatioToScene();

  sourceMeshes.forEach((mesh, id) => {
    const raw = sourcePositionsRaw.get(String(id));
    if (!raw) return;
    mesh.position.set(mapRoomDepth(raw.x), raw.y * roomRatio.height, raw.z * roomRatio.width);
    updateSourceDecorations(id);
    rebuildTrailGeometry(id);
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
  if (layoutSelectEl) {
    layoutSelectEl.innerHTML = '';
  }

  layouts.forEach((layout) => {
    layoutsByKey.set(layout.key, layout);
    if (layoutSelectEl) {
      const option = document.createElement('option');
      option.value = layout.key;
      option.textContent = layout.name;
      layoutSelectEl.appendChild(option);
    }
  });

  if (selectedLayoutKey && layoutsByKey.has(selectedLayoutKey)) {
    if (layoutSelectEl) layoutSelectEl.value = selectedLayoutKey;
    renderLayout(selectedLayoutKey);
  } else if (layouts.length > 0) {
    const firstKey = layouts[0].key;
    if (layoutSelectEl) layoutSelectEl.value = firstKey;
    renderLayout(firstKey);
  } else {
    currentLayoutKey = null;
    currentLayoutSpeakers = [];
    renderSpeakersList();
    renderSpeakerEditor();
  }

  if (layoutSelectEl) {
    layoutSelectEl.disabled = layouts.length === 0;
  }
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
    return true;
  }

  return false;
}

function selectSpeakerFromPointer(event) {
  pointerEventToNdc(event);
  raycaster.setFromCamera(pointer, camera);
  const hitTargets = [...speakerMeshes, ...speakerLabels];
  const intersects = raycaster.intersectObjects(hitTargets, false);
  if (intersects.length > 0) {
    const idx = speakerMeshes.indexOf(intersects[0].object);
    if (idx >= 0) {
      setSelectedSource(null);
      setSelectedSpeaker(idx);
      return true;
    }
    const labelIdx = speakerLabels.indexOf(intersects[0].object);
    if (labelIdx >= 0) {
      setSelectedSource(null);
      setSelectedSpeaker(labelIdx);
      return true;
    }
  }
  return false;
}

function beginSpeakerDrag(event) {
  if (selectedSpeakerIndex === null) {
    return false;
  }
  pointerEventToNdc(event);
  raycaster.setFromCamera(pointer, camera);

  if (activeEditMode === 'polar' && polarEditArmed) {
    const gizmoHits = raycaster.intersectObjects([speakerGizmo.ring, speakerGizmo.arc], false);
    if (gizmoHits.length === 0) {
      return false;
    }
    const hit = gizmoHits[0].object;
    dragMode = hit === speakerGizmo.ring ? 'azimuth' : 'elevation';
    isDraggingSpeaker = true;
    draggingPointerId = event.pointerId;
    dragAzimuthDelta = 1;
    dragElevationDelta = 1;
    controls.enabled = false;
    return true;
  }

  if (activeEditMode === 'cartesian' && cartesianEditArmed) {
    const handleHits = raycaster.intersectObjects(
      [cartesianGizmo.xHandle, cartesianGizmo.yHandle, cartesianGizmo.zHandle],
      false
    );
    if (handleHits.length === 0) {
      return false;
    }
    const axis = handleHits[0].object?.userData?.axis;
    if (!axis) {
      return false;
    }
    dragMode = 'cartesian';
    dragAxis = axis;
    dragAxisDirection.set(
      axis === 'x' ? 1 : 0,
      axis === 'y' ? 1 : 0,
      axis === 'z' ? 1 : 0
    );
    const mesh = speakerMeshes[selectedSpeakerIndex];
    if (mesh) {
      dragAxisOrigin.copy(mesh.position);
      dragSpeakerStartPosition.copy(mesh.position);
      dragAxisStartT = projectRayOntoAxis(
        raycaster.ray.origin,
        raycaster.ray.direction,
        dragAxisOrigin,
        dragAxisDirection
      );
    }
    isDraggingSpeaker = true;
    draggingPointerId = event.pointerId;
    controls.enabled = false;
    return true;
  }

  return false;
}

function updateSpeakerDrag(event) {
  if (!isDraggingSpeaker || selectedSpeakerIndex === null) {
    return;
  }
  pointerEventToNdc(event);
  raycaster.setFromCamera(pointer, camera);

  if (dragMode === 'azimuth') {
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hitPoint = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(plane, hitPoint)) {
      dragAzimuthDeg = (Math.atan2(hitPoint.z, hitPoint.x) * 180) / Math.PI;
      dragAzimuthDeg = normalizeAngleDeg(dragAzimuthDeg);
      const radial = Math.sqrt(hitPoint.x * hitPoint.x + hitPoint.z * hitPoint.z);
      const delta = (radial - dragDistance) / dragDistance;
      dragAzimuthDelta = delta;
      if (delta >= 0 && delta <= 0.1) {
        dragAzimuthDeg = snapAngleDeg(dragAzimuthDeg, 1, 0.5);
      } else if (delta > 0.1) {
        dragAzimuthDeg = snapAngleDeg(dragAzimuthDeg, 5, 2.5);
      }
    }
  } else if (dragMode === 'elevation') {
    const azRad = (dragAzimuthDeg * Math.PI) / 180;
    const dir = new THREE.Vector3(Math.cos(azRad), 0, Math.sin(azRad));
    const normal = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, new THREE.Vector3(0, 0, 0));
    const hitPoint = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(plane, hitPoint)) {
      const planar = Math.sqrt(hitPoint.x * hitPoint.x + hitPoint.z * hitPoint.z);
      dragElevationDeg = (Math.atan2(hitPoint.y, planar) * 180) / Math.PI;
      dragElevationDeg = Math.max(-90, Math.min(90, dragElevationDeg));
      const radius = Math.sqrt(hitPoint.x * hitPoint.x + hitPoint.y * hitPoint.y + hitPoint.z * hitPoint.z);
      const delta = (radius - dragDistance) / dragDistance;
      dragElevationDelta = delta;
      if (delta >= 0 && delta <= 0.1) {
        dragElevationDeg = snapAngleDeg(dragElevationDeg, 1, 0.5);
      } else if (delta > 0.1) {
        dragElevationDeg = snapAngleDeg(dragElevationDeg, 5, 2.5);
      }
    }
  } else if (dragMode === 'cartesian') {
    const tNow = projectRayOntoAxis(
      raycaster.ray.origin,
      raycaster.ray.direction,
      dragAxisOrigin,
      dragAxisDirection
    );
    const delta = tNow - dragAxisStartT;
    const pos = dragSpeakerStartPosition.clone().add(dragAxisDirection.clone().multiplyScalar(delta));
    applySpeakerCartesianEdit(selectedSpeakerIndex, pos.x, pos.y, pos.z, false);
    return;
  }

  const pos = sphericalToCartesianDeg(dragAzimuthDeg, dragElevationDeg, dragDistance);
  const mesh = speakerMeshes[selectedSpeakerIndex];
  if (mesh) {
    mesh.position.set(pos.x, pos.y, pos.z);
  }
  const label = speakerLabels[selectedSpeakerIndex];
  if (label) {
    label.position.set(pos.x, pos.y + 0.12, pos.z);
  }
  const speaker = currentLayoutSpeakers[selectedSpeakerIndex];
  if (speaker) {
    speaker.x = pos.x;
    speaker.y = pos.y;
    speaker.z = pos.z;
    const entry = speakerItems.get(String(selectedSpeakerIndex));
    if (entry) {
      entry.position.textContent = formatPosition(speaker);
    }
  }
  renderSpeakerEditor();
  updateSpeakerGizmo();
}

function endSpeakerDrag() {
  if (!isDraggingSpeaker || selectedSpeakerIndex === null) {
    return;
  }
  isDraggingSpeaker = false;
  dragMode = null;
  dragAxis = null;
  draggingPointerId = null;
  controls.enabled = true;

  if (selectedSpeakerIndex !== null) {
    const idx = selectedSpeakerIndex;
    const speaker = currentLayoutSpeakers[idx];
    if (speaker) {
      const x = Number(speaker.x) || 0;
      const y = Number(speaker.y) || 0;
      const z = Number(speaker.z) || 0;
      applySpeakerCartesianEdit(idx, x, y, z, true);
    }
  }
}

renderer.domElement.addEventListener('pointerdown', (event) => {
  pointerDownPosition = { x: event.clientX, y: event.clientY };
  if (beginSpeakerDrag(event)) {
    pointerDownPosition = null;
    return;
  }
});

renderer.domElement.addEventListener('pointerup', (event) => {
  if (isDraggingSpeaker && event.pointerId === draggingPointerId) {
    endSpeakerDrag();
  }
  if (!pointerDownPosition) {
    return;
  }

  const dx = event.clientX - pointerDownPosition.x;
  const dy = event.clientY - pointerDownPosition.y;
  pointerDownPosition = null;

  if (Math.hypot(dx, dy) <= 6) {
    const hitSpeaker = selectSpeakerFromPointer(event);
    if (hitSpeaker) {
      return;
    }
    const hitSource = selectSourceFromPointer(event);
    if (hitSource) {
      setSelectedSpeaker(null);
      updateControlsForEditMode();
      return;
    }
    setSelectedSource(null);
    setSelectedSpeaker(null);
    updateControlsForEditMode();
  }
});

renderer.domElement.addEventListener('pointermove', (event) => {
  if (isDraggingSpeaker && event.pointerId === draggingPointerId) {
    updateSpeakerDrag(event);
  }
});

renderer.domElement.addEventListener('pointercancel', () => {
  endSpeakerDrag();
});

renderer.domElement.addEventListener('pointerleave', () => {
  endSpeakerDrag();
});

renderer.domElement.addEventListener('wheel', (event) => {
  if (activeEditMode !== 'polar' || selectedSpeakerIndex === null || !polarEditArmed) {
    return;
  }
  if (!event.ctrlKey && !event.shiftKey) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  const prevZoom = controls.enableZoom;
  controls.enableZoom = false;

  const delta = -Math.sign(event.deltaY);
  const step = event.shiftKey ? 0.01 : 0.05;
  const next = Math.min(2.0, Math.max(0.2, dragDistance + delta * step));
  if (next === dragDistance) {
    return;
  }
  dragDistance = next;
  const pos = sphericalToCartesianDeg(dragAzimuthDeg, dragElevationDeg, dragDistance);
  const mesh = speakerMeshes[selectedSpeakerIndex];
  if (mesh) {
    mesh.position.set(pos.x, pos.y, pos.z);
  }
  const label = speakerLabels[selectedSpeakerIndex];
  if (label) {
    label.position.set(pos.x, pos.y + 0.12, pos.z);
  }
  const speaker = currentLayoutSpeakers[selectedSpeakerIndex];
  if (speaker) {
    speaker.x = pos.x;
    speaker.y = pos.y;
    speaker.z = pos.z;
    speaker.distanceM = dragDistance;
    const entry = speakerItems.get(String(selectedSpeakerIndex));
    if (entry) {
      entry.position.textContent = formatPosition(speaker);
    }
  }
  renderSpeakerEditor();
  updateSpeakerGizmo();
  controls.enableZoom = prevZoom;
}, { passive: false, capture: true });

if (masterGainSliderEl) {
  masterGainSliderEl.addEventListener('input', () => {
    const value = Number(masterGainSliderEl.value);
    if (!Number.isFinite(value)) {
      return;
    }
    masterGain = value;
    updateMasterGainUI();
    invoke('control_master_gain', { gain: masterGain });
  });

  masterGainSliderEl.addEventListener('dblclick', () => {
    masterGain = 1;
    updateMasterGainUI();
    invoke('control_master_gain', { gain: masterGain });
  });
}

if (loudnessToggleEl) {
  loudnessToggleEl.addEventListener('change', () => {
    const enabled = loudnessToggleEl.checked ? 1 : 0;
    loudnessEnabled = enabled === 1;
    updateLoudnessDisplay();
    invoke('control_loudness', { enable: enabled });
  });
}

if (adaptiveResamplingToggleEl) {
  adaptiveResamplingToggleEl.addEventListener('change', () => {
    const enabled = adaptiveResamplingToggleEl.checked ? 1 : 0;
    adaptiveResamplingEnabled = enabled === 1;
    updateAdaptiveResamplingUI();
    invoke('control_adaptive_resampling', { enable: enabled });
  });
}

if (spreadMinSliderEl) {
  spreadMinSliderEl.addEventListener('input', () => {
    const valueDeg = Number(spreadMinSliderEl.value);
    if (!Number.isFinite(valueDeg)) {
      return;
    }
    const valueNorm = Math.max(0, Math.min(180, valueDeg)) / 180.0;
    const maxValue = spreadState.max === null ? 1 : spreadState.max;
    spreadState.min = Math.min(valueNorm, maxValue);
    spreadMinSliderEl.value = String((spreadState.min ?? 0) * 180.0);
    vbapRecomputing = true;
    renderVbapStatus();
    updateSpreadDisplay();
    invoke('control_spread_min', { value: spreadState.min });
  });
}

if (spreadMaxSliderEl) {
  spreadMaxSliderEl.addEventListener('input', () => {
    const valueDeg = Number(spreadMaxSliderEl.value);
    if (!Number.isFinite(valueDeg)) {
      return;
    }
    const valueNorm = Math.max(0, Math.min(180, valueDeg)) / 180.0;
    const minValue = spreadState.min === null ? 0 : spreadState.min;
    spreadState.max = Math.max(valueNorm, minValue);
    spreadMaxSliderEl.value = String((spreadState.max ?? 1) * 180.0);
    vbapRecomputing = true;
    renderVbapStatus();
    updateSpreadDisplay();
    invoke('control_spread_max', { value: spreadState.max });
  });
}

if (spreadFromDistanceToggleEl) {
  spreadFromDistanceToggleEl.addEventListener('change', () => {
    const enabled = spreadFromDistanceToggleEl.checked;
    spreadState.fromDistance = enabled;
    vbapRecomputing = true;
    renderVbapStatus();
    updateSpreadDisplay();
    invoke('control_spread_from_distance', { enable: enabled ? 1 : 0 });
  });
}

if (spreadDistanceRangeSliderEl) {
  spreadDistanceRangeSliderEl.addEventListener('input', () => {
    const value = Number(spreadDistanceRangeSliderEl.value);
    if (!Number.isFinite(value)) return;
    spreadState.distanceRange = Math.max(0.01, value);
    vbapRecomputing = true;
    renderVbapStatus();
    updateSpreadDisplay();
    invoke('control_spread_distance_range', { value: spreadState.distanceRange });
  });
}

if (spreadDistanceCurveSliderEl) {
  spreadDistanceCurveSliderEl.addEventListener('input', () => {
    const value = Number(spreadDistanceCurveSliderEl.value);
    if (!Number.isFinite(value)) return;
    spreadState.distanceCurve = Math.max(0, value);
    vbapRecomputing = true;
    renderVbapStatus();
    updateSpreadDisplay();
    invoke('control_spread_distance_curve', { value: spreadState.distanceCurve });
  });
}

if (vbapCartXSizeInputEl) {
  vbapCartXSizeInputEl.addEventListener('change', () => {
    const value = Math.max(1, Math.round(Number(vbapCartXSizeInputEl.value) || 1));
    vbapCartesianState.xSize = value;
    vbapRecomputing = true;
    renderVbapStatus();
    updateVbapCartesian();
    invoke('control_vbap_cart_x_size', { value });
  });
}

if (vbapCartYSizeInputEl) {
  vbapCartYSizeInputEl.addEventListener('change', () => {
    const value = Math.max(1, Math.round(Number(vbapCartYSizeInputEl.value) || 1));
    vbapCartesianState.ySize = value;
    vbapRecomputing = true;
    renderVbapStatus();
    updateVbapCartesian();
    invoke('control_vbap_cart_y_size', { value });
  });
}

if (vbapCartZSizeInputEl) {
  vbapCartZSizeInputEl.addEventListener('change', () => {
    const value = Math.max(1, Math.round(Number(vbapCartZSizeInputEl.value) || 1));
    vbapCartesianState.zSize = value;
    vbapRecomputing = true;
    renderVbapStatus();
    updateVbapCartesian();
    invoke('control_vbap_cart_z_size', { value });
  });
}

if (vbapCartesianGridToggleBtnEl) {
  vbapCartesianGridToggleBtnEl.addEventListener('click', () => {
    vbapCartesianFaceGridEnabled = !vbapCartesianFaceGridEnabled;
    renderVbapCartesianGridToggle();
    updateVbapCartesianFaceGrid();
  });
}

if (vbapPolarAzimuthResolutionInputEl) {
  vbapPolarAzimuthResolutionInputEl.addEventListener('change', () => {
    const value = Math.max(1, Math.round(Number(vbapPolarAzimuthResolutionInputEl.value) || 1));
    vbapPolarState.azimuthResolution = value;
    vbapRecomputing = true;
    renderVbapStatus();
    updateVbapPolar();
    invoke('control_vbap_polar_azimuth_resolution', { value });
  });
}

if (vbapPolarElevationResolutionInputEl) {
  vbapPolarElevationResolutionInputEl.addEventListener('change', () => {
    const value = Math.max(1, Math.round(Number(vbapPolarElevationResolutionInputEl.value) || 1));
    vbapPolarState.elevationResolution = value;
    vbapRecomputing = true;
    renderVbapStatus();
    updateVbapPolar();
    invoke('control_vbap_polar_elevation_resolution', { value });
  });
}

if (vbapPolarDistanceResInputEl) {
  vbapPolarDistanceResInputEl.addEventListener('change', () => {
    const value = Math.max(1, Math.round(Number(vbapPolarDistanceResInputEl.value) || 1));
    vbapPolarState.distanceRes = value;
    vbapRecomputing = true;
    renderVbapStatus();
    updateVbapPolar();
    invoke('control_vbap_polar_distance_res', { value });
  });
}

if (vbapPolarDistanceMaxInputEl) {
  vbapPolarDistanceMaxInputEl.addEventListener('change', () => {
    const value = Math.max(0.01, Number(vbapPolarDistanceMaxInputEl.value) || 2);
    vbapPolarState.distanceMax = value;
    vbapRecomputing = true;
    renderVbapStatus();
    updateVbapPolar();
    invoke('control_vbap_polar_distance_max', { value });
  });
}

if (distanceDiffuseToggleEl) {
  distanceDiffuseToggleEl.addEventListener('change', () => {
    const enabled = distanceDiffuseToggleEl.checked;
    distanceDiffuseState.enabled = enabled;
    updateDistanceDiffuseUI();
    invoke('control_distance_diffuse_enabled', { enable: enabled ? 1 : 0 });
  });
}

if (distanceDiffuseThresholdSliderEl) {
  distanceDiffuseThresholdSliderEl.addEventListener('input', () => {
    const value = Number(distanceDiffuseThresholdSliderEl.value);
    if (!Number.isFinite(value)) return;
    distanceDiffuseState.threshold = value;
    if (distanceDiffuseThresholdValEl) distanceDiffuseThresholdValEl.textContent = formatNumber(value, 2);
    invoke('control_distance_diffuse_threshold', { value });
  });
}

if (distanceDiffuseCurveSliderEl) {
  distanceDiffuseCurveSliderEl.addEventListener('input', () => {
    const value = Number(distanceDiffuseCurveSliderEl.value);
    if (!Number.isFinite(value)) return;
    distanceDiffuseState.curve = value;
    if (distanceDiffuseCurveValEl) distanceDiffuseCurveValEl.textContent = formatNumber(value, 2);
    invoke('control_distance_diffuse_curve', { value });
  });
}

if (spreadFromDistanceInfoBtnEl) {
  spreadFromDistanceInfoBtnEl.addEventListener('click', () => {
    setSpreadFromDistanceInfoModalOpen(true);
  });
}

if (spreadFromDistanceInfoCloseBtnEl) {
  spreadFromDistanceInfoCloseBtnEl.addEventListener('click', () => {
    setSpreadFromDistanceInfoModalOpen(false);
  });
}

if (spreadFromDistanceInfoModalEl) {
  spreadFromDistanceInfoModalEl.addEventListener('click', (event) => {
    if (event.target === spreadFromDistanceInfoModalEl) {
      setSpreadFromDistanceInfoModalOpen(false);
    }
  });
}

if (distanceDiffuseInfoBtnEl) {
  distanceDiffuseInfoBtnEl.addEventListener('click', () => {
    setDistanceDiffuseInfoModalOpen(true);
  });
}

if (distanceDiffuseInfoCloseBtnEl) {
  distanceDiffuseInfoCloseBtnEl.addEventListener('click', () => {
    setDistanceDiffuseInfoModalOpen(false);
  });
}

if (distanceDiffuseInfoModalEl) {
  distanceDiffuseInfoModalEl.addEventListener('click', (event) => {
    if (event.target === distanceDiffuseInfoModalEl) {
      setDistanceDiffuseInfoModalOpen(false);
    }
  });
}

if (trailInfoBtnEl) {
  trailInfoBtnEl.addEventListener('click', () => {
    setTrailInfoModalOpen(true);
  });
}

if (trailInfoCloseBtnEl) {
  trailInfoCloseBtnEl.addEventListener('click', () => {
    setTrailInfoModalOpen(false);
  });
}

if (trailInfoModalEl) {
  trailInfoModalEl.addEventListener('click', (event) => {
    if (event.target === trailInfoModalEl) {
      setTrailInfoModalOpen(false);
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setDistanceDiffuseInfoModalOpen(false);
    setTrailInfoModalOpen(false);
  }
});

if (roomGeometryApplyBtnEl) {
  roomGeometryApplyBtnEl.addEventListener('click', () => {
    if (roomGeometryApplyBtnEl.disabled) return;
    const preview = computeRoomGeometryFromInputs();
    roomMasterAxis = preview.master;
    const width = preview.ratio.width;
    const length = preview.ratio.length;
    const height = preview.ratio.height;
    const rear = preview.ratio.rear;
    const centerBlend = getRoomCenterBlendFromInput();
    const mpu = preview.mpu;

    metersPerUnit = mpu;
    const layout = currentLayoutKey ? layoutsByKey.get(currentLayoutKey) : null;
    if (layout) {
      layout.radius_m = mpu;
    }

    applyRoomRatio({ width, length, height, rear, centerBlend });
    invoke('control_layout_radius_m', { value: mpu });
    invoke('control_room_ratio_center_blend', { value: centerBlend });
    invoke('control_room_ratio', { width, length, height });
    invoke('control_room_ratio_rear', { value: rear });
    renderSpeakerEditor();
    normalizeRoomGeometryInputDisplays();
    setRoomGeometryBaselineFromInputs();
  });
}

if (roomGeometryCancelBtnEl) {
  roomGeometryCancelBtnEl.addEventListener('click', () => {
    if (roomGeometryCancelBtnEl.disabled || !roomGeometryBaselineKey) return;
    try {
      const baseline = JSON.parse(roomGeometryBaselineKey);
      applyRoomGeometryStateToInputs(baseline);
    } catch (_e) {
      // Ignore invalid baseline payload.
    }
  });
}

roomMasterAxisInputs.forEach((input) => {
  input.addEventListener('change', () => {
    if (!input.checked) return;
    roomMasterAxis = input.value;
    refreshRoomGeometryInputState();
    persistRoomGeometryPrefs();
  });
});

[
  ['width', roomDriverWidthEl],
  ['length', roomDriverLengthEl],
  ['height', roomDriverHeightEl],
  ['rear', roomDriverRearEl]
].forEach(([axis, el]) => {
  if (!el) return;
  el.addEventListener('change', () => {
    roomAxisDrivers[axis] = getRoomDriverValue(axis);
    refreshRoomGeometryInputState();
    persistRoomGeometryPrefs();
  });
});

[
  roomDimWidthInputEl,
  roomDimLengthInputEl,
  roomDimHeightInputEl,
  roomDimRearInputEl,
  roomRatioWidthInputEl,
  roomRatioLengthInputEl,
  roomRatioHeightInputEl,
  roomRatioRearInputEl
].forEach((el) => {
  if (!el) return;
  el.addEventListener('input', () => {
    updateRoomGeometryLivePreview();
    updateRoomGeometryButtonsState();
  });
  el.addEventListener('change', () => {
    normalizeRoomGeometryInputDisplays();
    updateRoomGeometryLivePreview();
    updateRoomGeometryButtonsState();
  });
});

if (roomRatioCenterBlendSliderEl) {
  roomRatioCenterBlendSliderEl.addEventListener('input', () => {
    renderRoomCenterBlendControl(getRoomCenterBlendFromInput());
    updateRoomGeometryLivePreview();
    updateRoomGeometryButtonsState();
  });
  roomRatioCenterBlendSliderEl.addEventListener('change', () => {
    renderRoomCenterBlendControl(getRoomCenterBlendFromInput());
    updateRoomGeometryLivePreview();
    updateRoomGeometryButtonsState();
  });
  roomRatioCenterBlendSliderEl.addEventListener('dblclick', () => {
    renderRoomCenterBlendControl(0.5);
    updateRoomGeometryLivePreview();
    updateRoomGeometryButtonsState();
  });
}

if (roomRatioCenterBlendValueEl) {
  roomRatioCenterBlendValueEl.addEventListener('dblclick', () => {
    renderRoomCenterBlendControl(0.5);
    updateRoomGeometryLivePreview();
    updateRoomGeometryButtonsState();
  });
}

if (saveConfigBtnEl) {
  saveConfigBtnEl.addEventListener('click', () => {
    invoke('control_save_config');
  });
}

if (audioSampleRateApplyBtnEl) {
  audioSampleRateApplyBtnEl.addEventListener('mousedown', (event) => {
    event.preventDefault();
  });
  audioSampleRateApplyBtnEl.addEventListener('click', () => {
    const requested = Math.max(0, Math.round(Number(audioSampleRateInputEl?.value) || 0));
    invoke('control_audio_sample_rate', { sampleRate: requested });
    audioSampleRateEditing = false;
    closeAudioSampleRateMenu();
  });
}

if (latencyTargetApplyBtnEl) {
  latencyTargetApplyBtnEl.addEventListener('mousedown', (event) => {
    event.preventDefault();
  });
  latencyTargetApplyBtnEl.addEventListener('click', () => {
    const requested = Math.max(1, Math.round(Number(latencyTargetInputEl?.value) || 0));
    latencyTargetMs = requested;
    latencyMs = requested;
    updateLatencyDisplay();
    updateLatencyMeterUI();
    invoke('control_latency_target', { value: requested });
    latencyTargetDirty = false;
    latencyTargetEditing = false;
  });
}

if (latencyTargetInputEl) {
  latencyTargetInputEl.addEventListener('focus', () => {
    latencyTargetEditing = true;
    latencyTargetInputEl.select();
  });
  latencyTargetInputEl.addEventListener('input', () => {
    latencyTargetEditing = true;
    latencyTargetDirty = true;
  });
}

if (audioSampleRateMenuBtnEl) {
  audioSampleRateMenuBtnEl.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!audioSampleRateMenuEl) return;
    if (audioSampleRateMenuEl.style.display === 'block') {
      closeAudioSampleRateMenu();
    } else {
      openAudioSampleRateMenu();
    }
  });
}

if (audioSampleRateInputEl) {
  audioSampleRateInputEl.addEventListener('focus', () => {
    audioSampleRateEditing = true;
    audioSampleRateInputEl.select();
  });
}

document.addEventListener('pointerdown', (event) => {
  if (!audioSampleRateMenuEl || audioSampleRateMenuEl.style.display !== 'block') return;
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (audioSampleRateMenuEl.contains(target) || audioSampleRateMenuBtnEl?.contains(target)) return;
  closeAudioSampleRateMenu();
});

document.addEventListener('pointerdown', (event) => {
  if (!audioSampleRateControlEl) return;
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (!audioSampleRateControlEl.contains(target) && target !== audioSampleRateApplyBtnEl) {
    audioSampleRateEditing = false;
  }
});

document.addEventListener('pointerdown', (event) => {
  if (!latencyTargetInputEl) return;
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (target !== latencyTargetInputEl && target !== latencyTargetApplyBtnEl) {
    latencyTargetEditing = false;
  }
});


if (exportLayoutBtnEl) {
  exportLayoutBtnEl.addEventListener('click', () => {
    const fallbackName = defaultLayoutExportNameFromSpeakers(currentLayoutSpeakers);
    const promptLabel = locale === 'fr' ? 'Nom du layout' : 'Layout name';
    const requested = window.prompt(`${promptLabel}:`, fallbackName);
    if (requested === null) {
      return;
    }
    const name = requested.trim() || fallbackName;
    invoke('control_export_layout', { name });
  });
}

if (importLayoutBtnEl) {
  importLayoutBtnEl.addEventListener('click', () => {
    const promptLabel = locale === 'fr'
      ? 'Chemin du layout à importer'
      : 'Layout path to import';
    const path = window.prompt(`${promptLabel}:`, '');
    if (path === null) return;
    const trimmed = path.trim();
    if (!trimmed) return;
    invoke('import_layout_from_path', { path: trimmed })
      .then((payload) => {
        hydrateLayoutSelect(payload.layouts || [], payload.selectedLayoutKey);
        refreshOverlayLists();
        renderSpeakerEditor();
      })
      .catch((e) => console.error('[layout import]', e));
  });
}

if (editModeSelectEl) {
  editModeSelectEl.addEventListener('change', () => {
    activeEditMode = editModeSelectEl.value;
    updateSpeakerGizmo();
    updateControlsForEditMode();
  });
}

if (speakerEditCartesianGizmoBtnEl) {
  speakerEditCartesianGizmoBtnEl.addEventListener('click', () => {
    if (selectedSpeakerIndex === null) return;
    activeEditMode = 'cartesian';
    if (editModeSelectEl) editModeSelectEl.value = 'cartesian';
    cartesianEditArmed = !cartesianEditArmed;
    if (cartesianEditArmed) {
      polarEditArmed = false;
    }
    renderSpeakerEditor();
    updateSpeakerGizmo();
  });
}

if (speakerAddBtnEl) {
  speakerAddBtnEl.addEventListener('click', () => {
    requestAddSpeaker();
  });
}

if (speakerMoveUpBtnEl) {
  speakerMoveUpBtnEl.addEventListener('click', () => {
    requestMoveSpeaker(-1);
  });
}

if (speakerMoveDownBtnEl) {
  speakerMoveDownBtnEl.addEventListener('click', () => {
    requestMoveSpeaker(1);
  });
}

if (speakerRemoveBtnEl) {
  speakerRemoveBtnEl.addEventListener('click', () => {
    requestRemoveSpeaker();
  });
}

if (speakerEditPolarGizmoBtnEl) {
  speakerEditPolarGizmoBtnEl.addEventListener('click', () => {
    if (selectedSpeakerIndex === null) return;
    activeEditMode = 'polar';
    if (editModeSelectEl) editModeSelectEl.value = 'polar';
    polarEditArmed = !polarEditArmed;
    if (polarEditArmed) {
      cartesianEditArmed = false;
    }
    renderSpeakerEditor();
    updateSpeakerGizmo();
  });
}

if (speakerEditGainSliderEl) {
  speakerEditGainSliderEl.addEventListener('input', () => {
    if (selectedSpeakerIndex === null) return;
    const id = String(selectedSpeakerIndex);
    const value = Number(speakerEditGainSliderEl.value);
    if (!Number.isFinite(value)) return;
    speakerBaseGains.set(id, value);
    applyGroupGains('speaker');
    renderSpeakerEditor();
  });
  speakerEditGainSliderEl.addEventListener('dblclick', () => {
    if (selectedSpeakerIndex === null) return;
    speakerEditGainSliderEl.value = '1';
    const id = String(selectedSpeakerIndex);
    speakerBaseGains.set(id, 1);
    applyGroupGains('speaker');
    renderSpeakerEditor();
  });
}

if (speakerEditDelayMsInputEl) {
  speakerEditDelayMsInputEl.addEventListener('change', () => {
    if (selectedSpeakerIndex === null) return;
    const id = String(selectedSpeakerIndex);
    const value = Math.max(0, Number(speakerEditDelayMsInputEl.value) || 0);
    speakerDelays.set(id, value);
    speakerEditDelayMsInputEl.value = String(value);
    invoke('control_speaker_delay', { id: Number(id), delayMs: value });
    renderSpeakerEditor();
  });
}

if (speakerEditDelaySamplesInputEl) {
  speakerEditDelaySamplesInputEl.addEventListener('change', () => {
    if (selectedSpeakerIndex === null) return;
    const id = String(selectedSpeakerIndex);
    const samples = Math.max(0, Math.round(Number(speakerEditDelaySamplesInputEl.value) || 0));
    const delayMs = samplesToDelayMs(samples);
    speakerDelays.set(id, delayMs);
    invoke('control_speaker_delay', { id: Number(id), delayMs });
    renderSpeakerEditor();
  });
}

if (speakerEditAutoDelayBtnEl) {
  speakerEditAutoDelayBtnEl.addEventListener('click', () => {
    computeAndApplySpeakerDelays();
  });
}

if (speakerEditDelayToDistanceBtnEl) {
  speakerEditDelayToDistanceBtnEl.addEventListener('click', () => {
    adjustSpeakerDistancesFromDelays();
  });
}

if (speakerEditNameInputEl) {
  speakerEditNameInputEl.addEventListener('change', () => {
    if (selectedSpeakerIndex === null) return;
    const speaker = currentLayoutSpeakers[selectedSpeakerIndex];
    if (!speaker) return;
    const nextName = speakerEditNameInputEl.value.trim() || `spk-${selectedSpeakerIndex}`;
    speaker.id = nextName;
    invoke('control_speaker_name', { id: selectedSpeakerIndex, name: nextName });
    invoke('control_speakers_apply');
    updateSpeakerVisualsFromState(selectedSpeakerIndex);
    renderSpeakerEditor();
  });
}

function bindSpeakerCoordChange(inputEl, getter) {
  if (!inputEl) return;
  inputEl.addEventListener('change', () => {
    if (selectedSpeakerIndex === null) return;
    getter(selectedSpeakerIndex);
  });
}

bindSpeakerCoordChange(speakerEditXInputEl, (idx) => {
  const gx = Number(speakerEditXInputEl?.value);
  const gy = Number(speakerEditYInputEl?.value);
  const gz = Number(speakerEditZInputEl?.value);
  const scene = gsrdToSceneCartesian({ x: gx, y: gy, z: gz });
  applySpeakerCartesianEdit(idx, scene.x, scene.y, scene.z, true);
});

bindSpeakerCoordChange(speakerEditYInputEl, (idx) => {
  const gx = Number(speakerEditXInputEl?.value);
  const gy = Number(speakerEditYInputEl?.value);
  const gz = Number(speakerEditZInputEl?.value);
  const scene = gsrdToSceneCartesian({ x: gx, y: gy, z: gz });
  applySpeakerCartesianEdit(idx, scene.x, scene.y, scene.z, true);
});

bindSpeakerCoordChange(speakerEditZInputEl, (idx) => {
  const gx = Number(speakerEditXInputEl?.value);
  const gy = Number(speakerEditYInputEl?.value);
  const gz = Number(speakerEditZInputEl?.value);
  const scene = gsrdToSceneCartesian({ x: gx, y: gy, z: gz });
  applySpeakerCartesianEdit(idx, scene.x, scene.y, scene.z, true);
});

bindSpeakerCoordChange(speakerEditAzInputEl, (idx) => {
  const az = Number(speakerEditAzInputEl?.value);
  const el = Number(speakerEditElInputEl?.value);
  const r = Number(speakerEditRInputEl?.value);
  applySpeakerPolarEdit(idx, az, el, r, true);
});

bindSpeakerCoordChange(speakerEditElInputEl, (idx) => {
  const az = Number(speakerEditAzInputEl?.value);
  const el = Number(speakerEditElInputEl?.value);
  const r = Number(speakerEditRInputEl?.value);
  applySpeakerPolarEdit(idx, az, el, r, true);
});

bindSpeakerCoordChange(speakerEditRInputEl, (idx) => {
  const az = Number(speakerEditAzInputEl?.value);
  const el = Number(speakerEditElInputEl?.value);
  const r = Number(speakerEditRInputEl?.value);
  applySpeakerPolarEdit(idx, az, el, r, true);
});

if (speakerEditSpatializeToggleEl) {
  speakerEditSpatializeToggleEl.addEventListener('change', () => {
    if (selectedSpeakerIndex === null) return;
    const index = selectedSpeakerIndex;
    const nextSpatialize = speakerEditSpatializeToggleEl.checked ? 1 : 0;
    setSpeakerSpatializeLocal(index, nextSpatialize);
    invoke('control_speaker_spatialize', { id: index, spatialize: nextSpatialize });
    invoke('control_speakers_apply');
    renderSpeakerEditor();
  });
}

if (trailToggleEl) {
  trailToggleEl.addEventListener('change', () => {
    trailsEnabled = trailToggleEl.checked;
    sourceTrails.forEach((trail, id) => {
      trail.line.visible = trailsEnabled;
      if (trailsEnabled) {
        rebuildTrailGeometry(id);
      }
    });
  });
}

if (trailLengthSliderEl) {
  trailLengthSliderEl.addEventListener('input', () => {
    trailMaxPoints = Number(trailLengthSliderEl.value);
    if (trailLengthValEl) trailLengthValEl.textContent = String(trailMaxPoints);
    sourceTrails.forEach((trail, id) => {
      if (trail.positions.length > trailMaxPoints) {
        trail.positions.splice(0, trail.positions.length - trailMaxPoints);
      }
      rebuildTrailGeometry(id);
    });
  });
}

if (trailTtlSliderEl) {
  trailTtlSliderEl.addEventListener('input', () => {
    const seconds = Number(trailTtlSliderEl.value);
    trailPointTtlMs = Math.max(500, seconds * 1000);
    if (trailTtlValEl) trailTtlValEl.textContent = `${seconds.toFixed(1)}s`;
  });
}

applyStaticTranslations();
setOscStatus('initializing');

// ── OSC config panel ───────────────────────────────────────────────────────

if (oscConfigToggleBtnEl && oscConfigFormEl) {
  oscConfigToggleBtnEl.addEventListener('click', () => {
    const isOpen = oscConfigFormEl.classList.toggle('open');
    oscConfigToggleBtnEl.textContent = isOpen ? '✕' : '⚙';
    if (isOpen) {
      invoke('get_osc_config').then((cfg) => {
        if (oscHostInputEl) oscHostInputEl.value = cfg.host;
        if (oscRxPortInputEl) oscRxPortInputEl.value = String(cfg.osc_rx_port);
        if (oscListenPortInputEl) oscListenPortInputEl.value = String(cfg.osc_port);
      }).catch(() => {});
    }
  });
}

if (oscConfigApplyBtnEl) {
  oscConfigApplyBtnEl.addEventListener('click', () => {
    const host = oscHostInputEl?.value.trim() || '127.0.0.1';
    const osc_rx_port = Math.max(1, Math.min(65535, parseInt(oscRxPortInputEl?.value || '9000', 10)));
    const osc_port = Math.max(0, Math.min(65535, parseInt(oscListenPortInputEl?.value || '0', 10)));
    invoke('save_osc_config', { config: { host, osc_rx_port, osc_port } })
      .then(() => {
        setOscStatus('reconnecting');
        oscConfigFormEl?.classList.remove('open');
        if (oscConfigToggleBtnEl) oscConfigToggleBtnEl.textContent = '⚙';
      })
      .catch((e) => console.error('[osc config]', e));
  });
}

if (roomGeometryToggleBtnEl && roomGeometryFormEl) {
  roomGeometryToggleBtnEl.addEventListener('click', () => {
    setRoomGeometryExpanded(!roomGeometryExpanded);
  });
}
loadRoomGeometryPrefs();
refreshRoomGeometryInputState();
setRoomGeometryExpanded(false);

// ── layout select ──────────────────────────────────────────────────────────

if (layoutSelectEl) {
  layoutSelectEl.addEventListener('change', () => {
    invoke('select_layout', { key: layoutSelectEl.value });
  });
}

function applyInitState(payload) {
  speakerMuted.clear();
  objectMuted.clear();
  speakerManualMuted.clear();
  objectManualMuted.clear();

  Object.entries(payload.sources || {}).forEach(([id, position]) => {
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
    if (typeof payload.spread.fromDistance === 'boolean') {
      spreadState.fromDistance = payload.spread.fromDistance;
    }
    if (typeof payload.spread.distanceRange === 'number') {
      spreadState.distanceRange = payload.spread.distanceRange;
    }
    if (typeof payload.spread.distanceCurve === 'number') {
      spreadState.distanceCurve = payload.spread.distanceCurve;
    }
  }
  updateSpreadDisplay();
  if (payload.vbapCartesian) {
    if (typeof payload.vbapCartesian.xSize === 'number') {
      vbapCartesianState.xSize = payload.vbapCartesian.xSize > 0 ? payload.vbapCartesian.xSize : null;
    }
    if (typeof payload.vbapCartesian.ySize === 'number') {
      vbapCartesianState.ySize = payload.vbapCartesian.ySize > 0 ? payload.vbapCartesian.ySize : null;
    }
    if (typeof payload.vbapCartesian.zSize === 'number') {
      vbapCartesianState.zSize = payload.vbapCartesian.zSize > 0 ? payload.vbapCartesian.zSize : null;
    }
  }
  updateVbapCartesian();
  if (payload.vbapPolar) {
    if (typeof payload.vbapPolar.azimuthResolution === 'number') {
      vbapPolarState.azimuthResolution = payload.vbapPolar.azimuthResolution > 0 ? payload.vbapPolar.azimuthResolution : null;
    }
    if (typeof payload.vbapPolar.elevationResolution === 'number') {
      vbapPolarState.elevationResolution = payload.vbapPolar.elevationResolution > 0 ? payload.vbapPolar.elevationResolution : null;
    }
    if (typeof payload.vbapPolar.distanceRes === 'number') {
      vbapPolarState.distanceRes = payload.vbapPolar.distanceRes > 0 ? payload.vbapPolar.distanceRes : null;
    }
    if (typeof payload.vbapPolar.distanceMax === 'number') {
      vbapPolarState.distanceMax = payload.vbapPolar.distanceMax > 0 ? payload.vbapPolar.distanceMax : null;
    }
  }
  if (typeof payload.vbapAllowNegativeZ === 'boolean') {
    vbapAllowNegativeZ = payload.vbapAllowNegativeZ;
  }
  updateVbapPolar();
  if (typeof payload.vbapRecomputing === 'boolean') {
    vbapRecomputing = payload.vbapRecomputing;
  }
  renderVbapStatus();
  if (typeof payload.loudness === 'number') {
    loudnessEnabled = payload.loudness !== 0;
  }
  if (typeof payload.loudnessSource === 'number') {
    loudnessSource = payload.loudnessSource;
  }
  if (typeof payload.loudnessGain === 'number') {
    loudnessGain = payload.loudnessGain;
  }
  updateLoudnessDisplay();
  if (typeof payload.masterGain === 'number') {
    masterGain = payload.masterGain;
  }
  updateMasterGainUI();
  if (payload.distanceDiffuse) {
    if (typeof payload.distanceDiffuse.enabled === 'boolean') {
      distanceDiffuseState.enabled = payload.distanceDiffuse.enabled;
    }
    if (typeof payload.distanceDiffuse.threshold === 'number') {
      distanceDiffuseState.threshold = payload.distanceDiffuse.threshold;
    }
    if (typeof payload.distanceDiffuse.curve === 'number') {
      distanceDiffuseState.curve = payload.distanceDiffuse.curve;
    }
  }
  updateDistanceDiffuseUI();
  if (typeof payload.adaptiveResampling === 'number') {
    adaptiveResamplingEnabled = payload.adaptiveResampling !== 0;
  }
  updateAdaptiveResamplingUI();
  if (typeof payload.configSaved === 'number') {
    configSaved = payload.configSaved !== 0;
  }
  updateConfigSavedUI();
  if (typeof payload.latencyMs === 'number') {
    latencyMs = payload.latencyMs;
  }
  if (typeof payload.latencyInstantMs === 'number') {
    setLatencyInstantMs(payload.latencyInstantMs);
  }
  if (typeof payload.latencyTargetMs === 'number') {
    latencyTargetMs = payload.latencyTargetMs;
  }
  if (typeof payload.resampleRatio === 'number') {
    resampleRatio = payload.resampleRatio;
  }
  if (typeof payload.audioSampleRate === 'number') {
    audioSampleRate = payload.audioSampleRate > 0 ? payload.audioSampleRate : null;
  }
  if (typeof payload.audioSampleFormat === 'string') {
    audioSampleFormat = payload.audioSampleFormat.trim() || null;
  }
  if (typeof payload.oscStatus === 'string') {
    const s = payload.oscStatus;
    if (s === 'initializing' || s === 'connected' || s === 'reconnecting' || s === 'error') {
      setOscStatus(s);
    }
  }
  updateLatencyDisplay();
  updateLatencyMeterUI();
  updateResampleRatioDisplay();
  updateAudioFormatDisplay();
  updateMasterMeterUI();

  hydrateLayoutSelect(payload.layouts || [], payload.selectedLayoutKey);
  refreshOverlayLists();
  renderSpeakerEditor();
}

// Initialize state from backend, then subscribe to events.
invoke('get_state').then((payload) => {
  applyInitState(payload);
}).catch((e) => {
  console.error('[tauri] get_state failed:', e);
  setOscStatus('error');
});

listen('layouts:update', ({ payload }) => {
  hydrateLayoutSelect(payload.layouts || [], payload.selectedLayoutKey);
});

listen('layout:selected', ({ payload }) => {
  if (payload.key && layoutsByKey.has(payload.key)) {
    if (layoutSelectEl) layoutSelectEl.value = payload.key;
    renderLayout(payload.key);
  }
});

listen('layout:radius_m', ({ payload }) => {
  const value = Math.max(0.01, Number(payload?.value) || 1.0);
  metersPerUnit = value;
  const layout = currentLayoutKey ? layoutsByKey.get(currentLayoutKey) : null;
  if (layout) {
    layout.radius_m = value;
  }
  updateRoomRatioDisplay();
  renderSpeakerEditor();
});

listen('source:update', ({ payload }) => {
  updateSource(payload.id, payload.position);
});

listen('osc:status', ({ payload }) => {
  const next = payload?.status;
  if (next === 'initializing' || next === 'connected' || next === 'reconnecting' || next === 'error') {
    setOscStatus(next);
  }
});

listen('spatial:frame', ({ payload }) => {
  const isReset = Boolean(payload?.reset);
  const objectCount = Math.max(0, Number(payload?.objectCount ?? 0) | 0);

  if (isReset) {
    for (const trail of sourceTrails.values()) {
      trail.positions.length = 0;
      trail.line.geometry.dispose();
      trail.line.geometry = new THREE.BufferGeometry();
    }
  }

  // Ensure IDs [0..objectCount-1] exist, even if gsrd sends only deltas.
  for (let i = 0; i < objectCount; i += 1) {
    const id = String(i);
    if (!sourceMeshes.has(id)) {
      updateSource(id, { x: 0, y: 0, z: 0, name: `Object_${i}`, _noTrail: true });
    }
  }

  // Safety purge in case stale objects remain locally.
  for (const id of Array.from(sourceMeshes.keys())) {
    const idx = Number(id);
    if (Number.isInteger(idx) && idx >= objectCount) {
      removeSource(id);
    }
  }
});

listen('source:meter', ({ payload }) => {
  updateSourceLevel(payload.id, payload.meter);
});

listen('source:gains', ({ payload }) => {
  updateSourceGains(payload.id, payload.gains);
});

listen('speaker:meter', ({ payload }) => {
  updateSpeakerLevel(Number(payload.id), payload.meter);
});

listen('object:gain', ({ payload }) => {
  objectGainCache.set(String(payload.id), Number(payload.gain));
  updateObjectControlsUI();
});

listen('speaker:gain', ({ payload }) => {
  speakerGainCache.set(String(payload.id), Number(payload.gain));
  updateSpeakerControlsUI();
});

listen('speaker:delay', ({ payload }) => {
  const id = String(payload.id);
  const delayMs = Math.max(0, Number(payload.delayMs) || 0);
  speakerDelays.set(id, delayMs);
  renderSpeakerEditor();
  updateSpeakerControlsUI();
});

listen('object:mute', ({ payload }) => {
  const key = String(payload.id);
  if (Number(payload.muted)) {
    objectMuted.add(key);
  } else {
    objectMuted.delete(key);
    objectManualMuted.delete(key);
  }
  updateObjectControlsUI();
});

listen('speaker:mute', ({ payload }) => {
  const key = String(payload.id);
  if (Number(payload.muted)) {
    speakerMuted.add(key);
  } else {
    speakerMuted.delete(key);
    speakerManualMuted.delete(key);
  }
  updateSpeakerControlsUI();
});

listen('speaker:spatialize', ({ payload }) => {
  const index = Number(payload.id);
  if (!Number.isInteger(index) || index < 0) {
    return;
  }
  const next = Number(payload.spatialize) === 0 ? 0 : 1;
  setSpeakerSpatializeLocal(index, next);
  updateSpeakerControlsUI();
});

listen('speaker:name', ({ payload }) => {
  const index = Number(payload.id);
  if (!Number.isInteger(index) || index < 0) {
    return;
  }
  const speaker = currentLayoutSpeakers[index];
  if (!speaker) {
    return;
  }
  speaker.id = String(payload.name ?? speaker.id ?? index);
  updateSpeakerVisualsFromState(index);
  updateSpeakerControlsUI();
});

listen('room_ratio', ({ payload }) => {
  if (payload.roomRatio) {
    applyRoomRatio(payload.roomRatio);
  }
});

listen('spread:min', ({ payload }) => {
  spreadState.min = Number(payload.value);
  updateSpreadDisplay();
});

listen('spread:max', ({ payload }) => {
  spreadState.max = Number(payload.value);
  updateSpreadDisplay();
});

listen('spread:from_distance', ({ payload }) => {
  spreadState.fromDistance = payload.enabled === true;
  updateSpreadDisplay();
});

listen('spread:distance_range', ({ payload }) => {
  spreadState.distanceRange = Number(payload.value);
  updateSpreadDisplay();
});

listen('spread:distance_curve', ({ payload }) => {
  spreadState.distanceCurve = Number(payload.value);
  updateSpreadDisplay();
});

listen('vbap:recomputing', ({ payload }) => {
  vbapRecomputing = payload.enabled === true;
  renderVbapStatus();
});

listen('vbap:cart:x_size', ({ payload }) => {
  const value = Number(payload.value);
  vbapCartesianState.xSize = value > 0 ? value : null;
  updateVbapCartesian();
});

listen('vbap:cart:y_size', ({ payload }) => {
  const value = Number(payload.value);
  vbapCartesianState.ySize = value > 0 ? value : null;
  updateVbapCartesian();
});

listen('vbap:cart:z_size', ({ payload }) => {
  const value = Number(payload.value);
  vbapCartesianState.zSize = value > 0 ? value : null;
  updateVbapCartesian();
});

listen('vbap:polar:azimuth_resolution', ({ payload }) => {
  const value = Number(payload.value);
  vbapPolarState.azimuthResolution = value > 0 ? value : null;
  updateVbapPolar();
});

listen('vbap:polar:elevation_resolution', ({ payload }) => {
  const value = Number(payload.value);
  vbapPolarState.elevationResolution = value > 0 ? value : null;
  updateVbapPolar();
});

listen('vbap:polar:distance_res', ({ payload }) => {
  const value = Number(payload.value);
  vbapPolarState.distanceRes = value > 0 ? value : null;
  updateVbapPolar();
});

listen('vbap:polar:distance_max', ({ payload }) => {
  const value = Number(payload.value);
  vbapPolarState.distanceMax = value > 0 ? value : null;
  updateVbapPolar();
});

listen('vbap:allow_negative_z', ({ payload }) => {
  vbapAllowNegativeZ = payload.enabled === true;
  updateVbapPolar();
});

listen('loudness', ({ payload }) => {
  loudnessEnabled = Number(payload.enabled) !== 0;
  updateLoudnessDisplay();
});

listen('loudness:source', ({ payload }) => {
  loudnessSource = Number(payload.value);
  updateLoudnessDisplay();
});

listen('loudness:gain', ({ payload }) => {
  loudnessGain = Number(payload.value);
  updateLoudnessDisplay();
});

listen('master:gain', ({ payload }) => {
  masterGain = Number(payload.value);
  updateMasterGainUI();
});

listen('distance_diffuse:enabled', ({ payload }) => {
  distanceDiffuseState.enabled = payload.enabled === true;
  updateDistanceDiffuseUI();
});

listen('distance_diffuse:threshold', ({ payload }) => {
  distanceDiffuseState.threshold = Number(payload.value);
  updateDistanceDiffuseUI();
});

listen('distance_diffuse:curve', ({ payload }) => {
  distanceDiffuseState.curve = Number(payload.value);
  updateDistanceDiffuseUI();
});

listen('adaptive_resampling', ({ payload }) => {
  adaptiveResamplingEnabled = Number(payload.enabled) !== 0;
  updateAdaptiveResamplingUI();
});

listen('config:saved', ({ payload }) => {
  configSaved = payload.saved !== 0;
  updateConfigSavedUI();
});

listen('latency', ({ payload }) => {
  latencyMs = Number(payload.value);
  updateLatencyDisplay();
  updateLatencyMeterUI();
});

listen('latency:instant', ({ payload }) => {
  setLatencyInstantMs(payload.value);
  updateLatencyDisplay();
  updateLatencyMeterUI();
});

listen('latency:target', ({ payload }) => {
  latencyTargetMs = Number(payload.value);
  latencyMs = Number(payload.value);
  updateLatencyDisplay();
  updateLatencyMeterUI();
});

listen('resample_ratio', ({ payload }) => {
  resampleRatio = Number(payload.value);
  updateResampleRatioDisplay();
});

listen('audio:sample_rate', ({ payload }) => {
  const v = Number(payload.value);
  audioSampleRate = Number.isFinite(v) && v > 0 ? Math.round(v) : null;
  updateAudioFormatDisplay();
});

listen('audio:sample_format', ({ payload }) => {
  audioSampleFormat = typeof payload.value === 'string' ? (payload.value.trim() || null) : null;
  updateAudioFormatDisplay();
});

listen('source:remove', ({ payload }) => {
  removeSource(payload.id);
});

setupNumericWheelEditing();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  updateRoomFaceVisibility();
  updateSelectedSpeakerFaceShadows();
  updateSelectedObjectFaceShadows();
  const now = performance.now();
  decayTrails(now);
  decayMeters(now);

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
