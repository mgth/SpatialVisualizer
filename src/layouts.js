const fs = require('fs');
const path = require('path');
const { sphericalToCartesian, clamp } = require('./oscParser');

const LAYOUTS_DIR = path.join(__dirname, '..', 'layouts');

function normalizeSpeaker(speaker) {
  if (speaker && typeof speaker.x === 'number' && typeof speaker.y === 'number' && typeof speaker.z === 'number') {
    return {
      id: String(speaker.id || 'spk'),
      x: clamp(speaker.x, -1, 1),
      y: clamp(speaker.y, -1, 1),
      z: clamp(speaker.z, -1, 1)
    };
  }

  const azimuth = Number(speaker.azimuth ?? speaker.az ?? 0);
  const elevation = Number(speaker.elevation ?? speaker.el ?? 0);
  const distance = Number(speaker.distance ?? speaker.dist ?? 1);
  const c = sphericalToCartesian(azimuth, elevation, distance);

  return {
    id: String(speaker.id || 'spk'),
    x: clamp(c.x, -1, 1),
    y: clamp(c.y, -1, 1),
    z: clamp(c.z, -1, 1)
  };
}

function loadLayouts() {
  if (!fs.existsSync(LAYOUTS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(LAYOUTS_DIR)
    .filter((file) => file.endsWith('.json'))
    .map((file) => {
      const fullPath = path.join(LAYOUTS_DIR, file);
      const raw = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      const speakers = Array.isArray(raw.speakers) ? raw.speakers.map(normalizeSpeaker) : [];
      return {
        key: path.basename(file, '.json'),
        name: raw.name || path.basename(file, '.json'),
        speakers
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

module.exports = {
  loadLayouts,
  normalizeSpeaker
};
