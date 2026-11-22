import test from 'node:test';
import assert from 'node:assert/strict';
import { createEntertainmentDirector } from '../server/agents.js';

test('rose gift creates a coordinated applause performance', () => {
  const director = createEntertainmentDirector();
  const result = director.handleFanEvent({ type: 'gift', gift: 'rose', name: 'Maya' });
  assert.equal(result.accepted, true);
  assert.equal(result.performance.action, 'clap');
  assert.deepEqual(result.performance.participants, ['nova', 'milo', 'zuri']);
  assert.match(result.performance.text, /Maya/);
});

test('universe gift creates a personalised song for the named fan', () => {
  const result = createEntertainmentDirector().handleFanEvent({
    type: 'gift', gift: 'universe', name: 'Kito'
  });
  assert.equal(result.performance.action, 'personal_song');
  assert.match(result.performance.song, /Kito/);
});

test('supported fan instructions map to bounded stage actions', () => {
  const director = createEntertainmentDirector();
  assert.equal(director.handleFanEvent({ type: 'instruction', action: 'dance', name: 'Jay' }).performance.action, 'dance');
  assert.equal(director.handleFanEvent({ type: 'instruction', action: 'swap_positions', name: 'Jay' }).performance.action, 'swap_positions');
});

test('unknown gifts and arbitrary instructions are rejected', () => {
  const director = createEntertainmentDirector();
  assert.equal(director.handleFanEvent({ type: 'gift', gift: 'cash', name: 'A' }).reason, 'unsupported_gift');
  assert.equal(director.handleFanEvent({ type: 'instruction', action: 'open_settings', name: 'A' }).reason, 'unsupported_instruction');
});

test('fan names are cleaned and event sequence can reset', () => {
  const director = createEntertainmentDirector();
  const first = director.handleFanEvent({ type: 'gift', gift: 'rose', name: '<Maya>' });
  assert.equal(first.fanName, 'Maya');
  assert.equal(director.handleFanEvent({ type: 'gift', gift: 'rose', name: 'Jay' }).eventId, 2);
  director.reset();
  assert.equal(director.handleFanEvent({ type: 'gift', gift: 'rose', name: 'Jay' }).eventId, 1);
});
