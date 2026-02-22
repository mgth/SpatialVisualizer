const test = require('node:test');
const assert = require('node:assert/strict');
const { parseOscMessage } = require('../src/oscParser');

test('parse legacy /source/position id x y z', () => {
  const out = parseOscMessage({
    address: '/source/position',
    args: ['kick', -0.2, 0.4, 0.1]
  });
  assert.equal(out.type, 'update');
  assert.equal(out.id, 'kick');
  assert.deepEqual(out.position, { x: -0.2, y: 0.4, z: 0.1 });
});

test('parse address embedded id /source/kick/position', () => {
  const out = parseOscMessage({
    address: '/source/kick/position',
    args: [0.1, 0.2, 0.3]
  });
  assert.equal(out.id, 'kick');
  assert.deepEqual(out.position, { x: 0.1, y: 0.2, z: 0.3 });
});

test('parse spherical /source/kick/aed', () => {
  const out = parseOscMessage({
    address: '/source/kick/aed',
    args: [90, 0, 1]
  });
  assert.equal(out.id, 'kick');
  assert.ok(Math.abs(out.position.x) < 1e-6);
  assert.ok(Math.abs(out.position.z - 1) < 1e-6);
});



test('map truehdd object xyz orientation to scene convention', () => {
  const out = parseOscMessage({
    address: '/truehdd/object/10/xyz',
    args: [0.2, 0.8, 0.1]
  });

  assert.deepEqual(out, {
    type: 'update',
    id: '10',
    position: { x: 0.8, y: 0.1, z: 0.2 }
  });
});
test('parse remove message', () => {
  const out = parseOscMessage({
    address: '/source/remove',
    args: ['kick']
  });
  assert.deepEqual(out, { type: 'remove', id: 'kick' });
});

test('parse object meter message', () => {
  const out = parseOscMessage({
    address: '/truehdd/meter/object/10',
    args: [-4.2, -18.7]
  });
  assert.deepEqual(out, {
    type: 'meter:object',
    id: '10',
    peakDbfs: -4.2,
    rmsDbfs: -18.7
  });
});


test('parse object speaker gains message', () => {
  const out = parseOscMessage({
    address: '/truehdd/meter/object/1/gains',
    args: [0.972, 0, 0.135, -1, 1.7]
  });

  assert.deepEqual(out, {
    type: 'meter:object:gains',
    id: '1',
    gains: [0.972, 0, 0.135, 0, 1]
  });
});

test('parse speaker meter message', () => {
  const out = parseOscMessage({
    address: '/truehdd/meter/speaker/3',
    args: [{ type: 'f', value: 1.2 }, { type: 'f', value: -120 }]
  });
  assert.deepEqual(out, {
    type: 'meter:speaker',
    id: '3',
    peakDbfs: 0,
    rmsDbfs: -100
  });
});
