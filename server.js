const path = require('path');
const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const osc = require('osc');
const { parseOscMessage } = require('./src/oscParser');

const HTTP_PORT = Number(process.env.PORT || 3000);
const OSC_PORT = Number(process.env.OSC_PORT || 9000);

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const state = {
  sources: {}
};

function broadcast(payload) {
  const message = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function handleOscMessage(oscMsg) {
  const parsed = parseOscMessage(oscMsg);
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
    broadcast({ type: 'source:remove', id: parsed.id });
  }
}

const oscUdpPort = new osc.UDPPort({
  localAddress: '0.0.0.0',
  localPort: OSC_PORT,
  metadata: true
});

oscUdpPort.on('ready', () => {
  console.log(`[osc] listening on udp://0.0.0.0:${OSC_PORT}`);
});

oscUdpPort.on('message', handleOscMessage);

oscUdpPort.on('error', (err) => {
  console.error('[osc] error:', err.message);
});

wss.on('connection', (ws) => {
  ws.send(
    JSON.stringify({
      type: 'state:init',
      sources: state.sources
    })
  );
});

server.listen(HTTP_PORT, () => {
  console.log(`[http] http://localhost:${HTTP_PORT}`);
});

oscUdpPort.open();
