function unwrapArg(arg) {
  return arg && typeof arg === 'object' && Object.prototype.hasOwnProperty.call(arg, 'value')
    ? arg.value
    : arg;
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function sphericalToCartesian(azimuthDeg, elevationDeg, distance) {
  const az = (azimuthDeg * Math.PI) / 180;
  const el = (elevationDeg * Math.PI) / 180;
  const d = distance;

  const x = d * Math.cos(el) * Math.cos(az);
  const y = d * Math.sin(el);
  const z = d * Math.cos(el) * Math.sin(az);

  return { x, y, z };
}

function findIdInAddress(parts) {
  const anchors = ['source', 'sources', 'object', 'obj', 'track', 'channel'];
  const reserved = new Set(['position', 'pos', 'xyz', 'aed', 'spherical', 'polar', 'angles', 'remove', 'delete', 'off']);

  for (let i = 0; i < parts.length - 1; i += 1) {
    if (anchors.includes(parts[i])) {
      const candidate = parts[i + 1];
      if (!reserved.has(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}

function parseMeterMessage(parts, args) {
  const meterIndex = parts.indexOf('meter');
  if (meterIndex === -1 || parts.length <= meterIndex + 2) {
    return null;
  }

  const meterKind = parts[meterIndex + 1];
  const meterId = parts[meterIndex + 2];
  const [peakRaw, rmsRaw] = args;
  const peakDbfs = clamp(toNumber(peakRaw) ?? -100, -100, 0);
  const rmsDbfs = clamp(toNumber(rmsRaw) ?? -100, -100, 0);

  if (!['object', 'speaker'].includes(meterKind) || !meterId) {
    return null;
  }

  return {
    type: meterKind === 'object' ? 'meter:object' : 'meter:speaker',
    id: String(meterId),
    peakDbfs,
    rmsDbfs
  };
}


function mapCartesianByAddress(parts, position) {
  const isTruehddObjectXyz = parts.includes('truehdd') && parts.includes('object') && parts.includes('xyz');
  if (!isTruehddObjectXyz) {
    return position;
  }

  // truehdd/object/{id}/xyz uses x=right, y=up, z=front.
  // Our scene convention is x=front, y=up, z=right.
  return {
    x: position.z,
    y: position.y,
    z: position.x
  };
}

function parseOscMessage(oscMsg) {
  const address = String(oscMsg.address || '');
  const parts = address.split('/').filter(Boolean).map((p) => p.toLowerCase());
  const args = (oscMsg.args || []).map(unwrapArg);

  if (parts.includes('meter')) {
    return parseMeterMessage(parts, args);
  }

  const isRemove = parts.some((p) => ['remove', 'delete', 'off'].includes(p));
  if (isRemove) {
    const idFromAddress = findIdInAddress(parts);
    const idFromArg = args.length > 0 ? String(args[0]) : null;
    const id = idFromArg || idFromAddress;
    return id ? { type: 'remove', id } : null;
  }

  const idFromAddress = findIdInAddress(parts);

  const hasSphericalHint = parts.some((p) => ['aed', 'spherical', 'polar', 'angles'].includes(p));
  const hasPositionHint = parts.some((p) => ['position', 'xyz', 'pos'].includes(p));

  let id = idFromAddress;
  let numericArgs = args.map(toNumber).filter((n) => n !== null);

  if (!id && args.length >= 4) {
    id = String(args[0]);
    numericArgs = args.slice(1).map(toNumber).filter((n) => n !== null);
  }

  if (!id || numericArgs.length < 3) {
    return null;
  }

  let position;
  if (hasSphericalHint) {
    const [azimuth, elevation, distance] = numericArgs;
    position = sphericalToCartesian(azimuth, elevation, distance);
  } else if (hasPositionHint || numericArgs.length >= 3) {
    const [x, y, z] = numericArgs;
    position = { x, y, z };
  }

  if (!position) {
    return null;
  }

  const mappedPosition = mapCartesianByAddress(parts, position);

  return {
    type: 'update',
    id,
    position: {
      x: clamp(mappedPosition.x, -1, 1),
      y: clamp(mappedPosition.y, -1, 1),
      z: clamp(mappedPosition.z, -1, 1)
    }
  };
}

module.exports = {
  parseOscMessage,
  sphericalToCartesian,
  clamp
};
