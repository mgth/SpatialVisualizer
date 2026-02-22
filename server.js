const path = require('path');
const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const osc = require('osc');
const { parseOscMessage } = require('./src/oscParser');
const { loadLayouts } = require('./src/layouts');

function parseCliArgs(argv) {
  const out = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      continue;
    }

    const [rawKey, inlineValue] = token.slice(2).split('=');
    const key = rawKey.trim();
    if (!key) {
      continue;
    }

    if (inlineValue !== undefined) {
      out[key] = inlineValue;
      continue;
    }

    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      out[key] = next;
      i += 1;
      continue;
    }

    out[key] = true;
  }

  return out;
}

function toPort(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 65535 ? parsed : fallback;
}

function toListenPort(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 65535 ? parsed : fallback;
}

const args = parseCliArgs(process.argv.slice(2));

const HTTP_PORT = toPort(args.httpPort ?? args['http-port'] ?? process.env.PORT, 3000);
const OSC_PORT = toListenPort(args.oscPort ?? args['osc-port'] ?? process.env.OSC_PORT, 0);
const OSC_HOST = String(args.host ?? args.oscHost ?? args['osc-host'] ?? process.env.OSC_HOST ?? '127.0.0.1');
const OSC_RX_PORT = toPort(args.oscRxPort ?? args['osc-rx-port'] ?? process.env.OSC_RX_PORT, 9000);
const HEARTBEAT_INTERVAL_MS = 5000;
const HEARTBEAT_ACK_TIMEOUT_MS = 10000;


const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const layouts = loadLayouts();

const state = {
  sources: {},
  sourceLevels: {},
  speakerLevels: {},
  objectSpeakerGains: {},
  layouts,
  selectedLayoutKey: layouts[0]?.key || null
};

function broadcast(payload) {
  const message = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function buildLiveLayoutFromSpeakers(speakers) {
  return {
    key: 'truehdd-live',
    name: 'truehdd (live)',
    speakers: speakers.map((speaker) => ({
      id: speaker.name || `spk-${speaker.index}`,
      x: speaker.position.x,
      y: speaker.position.y,
      z: speaker.position.z,
      spatialize: speaker.spatialize
    }))
  };
}

function applyTruehddSpeakerConfig(speakers) {
  if (!Array.isArray(speakers) || speakers.length === 0) {
    return;
  }

  const liveLayout = buildLiveLayoutFromSpeakers(speakers);
  const withoutLive = state.layouts.filter((layout) => layout.key !== liveLayout.key);
  state.layouts = [liveLayout, ...withoutLive];
  state.selectedLayoutKey = liveLayout.key;

  broadcast({
    type: 'layouts:update',
    layouts: state.layouts,
    selectedLayoutKey: state.selectedLayoutKey
  });
}

function handleParsedOsc(parsed) {
  if (!parsed) {
    return;
  }

  if (parsed.type === 'update') {
    state.sources[parsed.id] = {
      ...parsed.position,
      updatedAt: Date.now()
    };

    broadcast({
      type: 'source:update',
      id: parsed.id,
      position: state.sources[parsed.id]
    });
  }

  if (parsed.type === 'remove') {
    delete state.sources[parsed.id];
    delete state.sourceLevels[parsed.id];
    delete state.objectSpeakerGains[parsed.id];
    broadcast({ type: 'source:remove', id: parsed.id });
  }

  if (parsed.type === 'meter:object') {
    state.sourceLevels[parsed.id] = {
      peakDbfs: parsed.peakDbfs,
      rmsDbfs: parsed.rmsDbfs,
      updatedAt: Date.now()
    };

    broadcast({
      type: 'source:meter',
      id: parsed.id,
      meter: state.sourceLevels[parsed.id]
    });
  }


  if (parsed.type === 'meter:object:gains') {
    state.objectSpeakerGains[parsed.id] = {
      gains: parsed.gains,
      updatedAt: Date.now()
    };

    broadcast({
      type: 'source:gains',
      id: parsed.id,
      gains: parsed.gains
    });
  }

  if (parsed.type === 'meter:speaker') {
    state.speakerLevels[parsed.id] = {
      peakDbfs: parsed.peakDbfs,
      rmsDbfs: parsed.rmsDbfs,
      updatedAt: Date.now()
    };

    broadcast({
      type: 'speaker:meter',
      id: parsed.id,
      meter: state.speakerLevels[parsed.id]
    });
  }
}

function handleOscMessage(oscMsg) {
  if (handleHeartbeatResponseAddress(oscMsg?.address)) {
    return;
  }

  handleParsedOsc(parseOscMessage(oscMsg));
}

function handleOscBundle(bundle) {
  const packets = Array.isArray(bundle?.packets) ? bundle.packets : [];
  const configPackets = [];

  packets.forEach((packet) => {
    if (!packet?.address) {
      return;
    }

    if (handleHeartbeatResponseAddress(packet.address)) {
      return;
    }

    const parsed = parseOscMessage(packet);
    if (!parsed) {
      return;
    }

    if (parsed.type.startsWith('config:')) {
      configPackets.push(parsed);
      return;
    }

    handleParsedOsc(parsed);
  });

  if (configPackets.length === 0) {
    return;
  }

  const countMessage = configPackets.find((packet) => packet.type === 'config:speakers:count');
  const speakerPackets = configPackets
    .filter((packet) => packet.type === 'config:speaker')
    .sort((a, b) => a.index - b.index);

  const count = countMessage?.count;
  if (typeof count === 'number' && speakerPackets.length !== count) {
    console.warn(`[osc] truehdd speaker config count mismatch: expected ${count}, got ${speakerPackets.length}`);
  }

  applyTruehddSpeakerConfig(speakerPackets);
}

const oscUdpPort = new osc.UDPPort({
  localAddress: '0.0.0.0',
  localPort: OSC_PORT,
  metadata: true
});

let heartbeatInterval = null;
let activeListenPort = null;
let lastHeartbeatAckAt = 0;

function sendTruehddControlMessage(address, listenPort) {
  oscUdpPort.send(
    {
      address,
      args: [{ type: 'i', value: listenPort }]
    },
    OSC_HOST,
    OSC_RX_PORT
  );
}

function registerToTruehdd(listenPort, reason = 'startup') {
  activeListenPort = listenPort;
  sendTruehddControlMessage('/truehdd/register', listenPort);
  lastHeartbeatAckAt = Date.now();
  console.log(`[osc] register sent to udp://${OSC_HOST}:${OSC_RX_PORT} with listen_port=${listenPort} (${reason})`);
}

function handleHeartbeatResponseAddress(address) {
  const normalized = String(address || '').toLowerCase();
  if (normalized === '/truehdd/heartbeat/ack') {
    lastHeartbeatAckAt = Date.now();
    return true;
  }

  if (normalized === '/truehdd/heartbeat/unknown') {
    if (activeListenPort !== null) {
      registerToTruehdd(activeListenPort, 'heartbeat unknown');
    }
    return true;
  }

  return false;
}

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

function startHeartbeat(listenPort) {
  stopHeartbeat();
  activeListenPort = listenPort;
  lastHeartbeatAckAt = Date.now();

  heartbeatInterval = setInterval(() => {
    sendTruehddControlMessage('/truehdd/heartbeat', listenPort);

    const ackAgeMs = Date.now() - lastHeartbeatAckAt;
    if (ackAgeMs > HEARTBEAT_ACK_TIMEOUT_MS) {
      registerToTruehdd(listenPort, `heartbeat timeout ${Math.round(ackAgeMs)}ms`);
    }
  }, HEARTBEAT_INTERVAL_MS);

  if (typeof heartbeatInterval.unref === 'function') {
    heartbeatInterval.unref();
  }
}

oscUdpPort.on('ready', () => {
  const listenPort = oscUdpPort.socket?.address?.().port || OSC_PORT;
  console.log(`[osc] listening on udp://0.0.0.0:${listenPort}`);

  registerToTruehdd(listenPort);

  startHeartbeat(listenPort);
  console.log(`[osc] heartbeat started: /truehdd/heartbeat every ${HEARTBEAT_INTERVAL_MS / 1000}s`);
});

oscUdpPort.on('message', handleOscMessage);
oscUdpPort.on('bundle', handleOscBundle);

oscUdpPort.on('error', (err) => {
  console.error('[osc] error:', err.message);
});

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const payload = JSON.parse(message.toString());
      if (payload?.type === 'layout:select') {
        const hasLayout = state.layouts.some((layout) => layout.key === payload.key);
        if (!hasLayout) {
          return;
        }
        state.selectedLayoutKey = payload.key;
        broadcast({ type: 'layout:selected', key: state.selectedLayoutKey });
      }
    } catch {
      // Ignore invalid client payloads.
    }
  });

  ws.send(
    JSON.stringify({
      type: 'state:init',
      sources: state.sources,
      sourceLevels: state.sourceLevels,
      speakerLevels: state.speakerLevels,
      objectSpeakerGains: state.objectSpeakerGains,
      layouts: state.layouts,
      selectedLayoutKey: state.selectedLayoutKey
    })
  );
});

server.listen(HTTP_PORT, () => {
  console.log(`[http] http://localhost:${HTTP_PORT}`);
});


let isShuttingDown = false;

function shutdown(signal) {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  if (signal) {
    console.log(`[shutdown] received ${signal}, stopping services...`);
  }

  stopHeartbeat();

  wss.clients.forEach((client) => {
    try {
      client.close();
    } catch {
      // Ignore close errors during shutdown.
    }
  });

  try {
    wss.close();
  } catch {
    // Ignore close errors during shutdown.
  }

  try {
    oscUdpPort.close();
  } catch {
    // Ignore close errors during shutdown.
  }

  server.close(() => {
    process.exit(0);
  });

  setTimeout(() => {
    process.exit(0);
  }, 1000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

oscUdpPort.open();
