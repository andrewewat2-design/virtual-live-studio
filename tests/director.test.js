import test from 'node:test';
import assert from 'node:assert/strict';
import { createDirector, getCast, moderateMessage } from '../server/director.js';

test('moderation rejects empty, oversized, unsafe, and linked messages', () => {
  assert.equal(moderateMessage('   ').reason, 'empty');
  assert.equal(moderateMessage('x'.repeat(241)).reason, 'too_long');
  assert.equal(moderateMessage('go kill yourself').reason, 'unsafe');
  assert.equal(moderateMessage('visit https://example.com').reason, 'links_disabled');
  assert.equal(moderateMessage('hello').allowed, true);
});

test('director selects only known characters and returns a reply', () => {
  const director = createDirector();
  const known = new Set(getCast().map((character) => character.id));
  const result = director.respond('Tell us a joke');
  assert.equal(result.accepted, true);
  assert.ok(known.has(result.reply.speakerId));
  assert.ok(result.reply.text.length > 0);
});

test('speaker rotation does not mutate the shared cast profiles', () => {
  const before = getCast();
  const director = createDirector();
  for (let i = 0; i < 12; i += 1) director.respond('hello everyone');
  assert.deepEqual(getCast(), before);
});

test('history is bounded and reset clears it', () => {
  const director = createDirector();
  for (let i = 0; i < 30; i += 1) director.respond('hello');
  assert.ok(director.getHistory().length <= 40);
  director.reset();
  assert.deepEqual(director.getHistory(), []);
});
