import { createServer } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { createDirector, getCast, moderateMessage } from './director.js';
import { loadSession, saveSession } from './store.js';

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '0.0.0.0';
const MAX_CLIENTS = 40;
const MAX_MESSAGE_BYTES = 4096;
const RATE_WINDOW_MS = 10_000;
const RATE_LIMIT = 12;

const session = await loadSession();
const director = createDirector();
let showActive = session.showActive;
let events = session.events;
const clients = new Set();
const rateBuckets = new WeakMap();

function makeEvent(type, payload = {}) {
  const event = { type, at: Date.now(), ...payload };
  events.push(event);
  if (events.length > 200) events = events.slice(-200);
  void saveSession({ events, showActive }).catch((error) => console.error('Session save failed:', error.message));
  return event;
}

function broadcast(event) {
  const encoded = JSON.stringify(event);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) client.send(encoded);
  }
}

function sendTo(client, event) {
  if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(event));
}

function isRateLimited(client) {
  const now = Date.now();
  const bucket = rateBuckets.get(client) || [];
  const recent = bucket.filter((time) => now - time < RATE_WINDOW_MS);
  recent.push(now);
  rateBuckets.set(client, recent);
  return recent.length > RATE_LIMIT;
}

function handleMessage(client, raw) {
  if (raw.length > MAX_MESSAGE_BYTES || isRateLimited(client)) {
    sendTo(client, { type: 'notice', level: 'warning', text: 'Slow down for a moment and try again.' });
    return;
  }
  let message;
  try { message = JSON.parse(raw.toString()); } catch {
    sendTo(client, { type: 'notice', level: 'warning', text: 'That message could not be understood.' });
    return;
  }
  if (!message || typeof message.type !== 'string') return;

  if (message.type === 'chat') {
    const moderation = moderateMessage(message.text);
    if (!moderation.allowed) {
      sendTo(client, { type: 'moderation', reason: moderation.reason, text: 'That message was not sent.' });
      return;
    }
    const visitor = makeEvent('visitor', {
      name: cleanName(message.name) || 'Visitor',
      text: moderation.text
    });
    broadcast(visitor);
    if (!showActive) return;
    const result = director.respond(moderation.text);
    if (result.reply) {
      const reply = makeEvent('reply', result.reply);
      broadcast(reply);
    }
    broadcast({ type: 'director', text: 'The director selected a speaker and completed a turn.', turn: result.director.turn });
    return;
  }

  if (message.type === 'show:start') {
    showActive = true;
    const event = makeEvent('show', { active: true, text: 'The show is on.' });
    broadcast(event);
    return;
  }
  if (message.type === 'show:pause') {
    showActive = false;
    const event = makeEvent('show', { active: false, text: 'The show is paused.' });
    broadcast(event);
    return;
  }
  if (message.type === 'room:clear') {
    director.reset();
    events = [];
    const event = { type: 'room:cleared', at: Date.now() };
    void saveSession({ events, showActive }).catch((error) => console.error('Session save failed:', error.message));
    broadcast(event);
    return;
  }
  if (message.type === 'moment') {
    const allowed = new Set(['question', 'poll', 'challenge']);
    if (!allowed.has(message.moment)) return;
    const event = makeEvent('moment', { moment: message.moment });
    broadcast(event);
  }
}

function cleanName(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 24);
}

const server = createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    response.end(JSON.stringify({ ok: true, service: 'virtual-live-studio', clients: clients.size, showActive }));
    return;
  }
  if (request.url === '/api/cast') {
    response.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    response.end(JSON.stringify(getCast()));
    return;
  }
  response.writeHead(404, { 'content-type': 'application/json' });
  response.end(JSON.stringify({ error: 'not_found' }));
});

const sockets = new WebSocketServer({ server, path: '/ws', maxPayload: MAX_MESSAGE_BYTES });
sockets.on('connection', (client) => {
  if (clients.size >= MAX_CLIENTS) {
    client.close(1013, 'Studio is full');
    return;
  }
  clients.add(client);
  sendTo(client, {
    type: 'hello',
    cast: getCast(),
    showActive,
    events: events.slice(-100)
  });
  client.on('message', (raw) => handleMessage(client, raw));
  client.on('close', () => clients.delete(client));
  client.on('error', () => clients.delete(client));
});

server.listen(PORT, HOST, () => {
  console.log(`Virtual Live Studio server listening on http://${HOST}:${PORT}`);
});

function shutdown() {
  for (const client of clients) client.close(1001, 'Server shutting down');
  sockets.close();
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
