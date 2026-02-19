const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLayouts, normalizeSpeaker } = require('../src/layouts');

test('normalizeSpeaker supports spherical coordinates', () => {
  const s = normalizeSpeaker({ id: 'L', azimuth: 0, elevation: 0, distance: 1 });
  assert.equal(s.id, 'L');
  assert.equal(s.x, 1);
  assert.equal(s.y, 0);
  assert.equal(s.z, 0);
});

test('loadLayouts returns available layouts', () => {
  const layouts = loadLayouts();
  assert.ok(layouts.length >= 2);
  const stereo = layouts.find((l) => l.key === 'stereo');
  assert.ok(stereo);
  assert.equal(stereo.speakers.length, 2);
});
