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

test('parse remove message', () => {
  const out = parseOscMessage({
    address: '/source/remove',
    args: ['kick']
  });
  assert.deepEqual(out, { type: 'remove', id: 'kick' });
});
