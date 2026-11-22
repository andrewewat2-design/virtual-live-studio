const GIFTS = Object.freeze({
  rose: {
    label: 'Rose',
    response: 'Thank you for the rose, {name}! That deserves a proper round of applause.',
    action: 'clap',
    speakerId: 'nova',
    participants: ['nova', 'milo', 'zuri']
  },
  universe: {
    label: 'Universe',
    response: '{name}, you sent a whole universe! Milo, give us a little celebration song for our guest.',
    action: 'personal_song',
    speakerId: 'milo',
    participants: ['nova', 'milo', 'zuri']
  }
});

const INSTRUCTIONS = Object.freeze({
  clap: { action: 'clap', response: 'The whole cast is clapping for you, {name}!' },
  dance: { action: 'dance', response: 'You asked for a dance, {name}. Milo is already moving!' },
  swap_positions: { action: 'swap_positions', response: 'A cast reshuffle! Nova, Milo and Zuri are changing places for you, {name}.' },
  sing: { action: 'personal_song', response: 'A song for {name}? Milo, take the microphone!' }
});

function safeName(value) {
  if (typeof value !== 'string') return 'our guest';
  const cleaned = value.replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 24);
  return cleaned || 'our guest';
}

function makeSong(name) {
  return [
    `This little spotlight shines on ${name},`,
    'The room is brighter, call your name,',
    'Nova cheers and Zuri smiles,',
    'Milo sings to light the miles!'
  ].join(' ');
}

/**
 * Deterministic specialist agents supervised by one director.
 * This local ruleset is intentionally API-free; generative providers can
 * later replace creative copy without gaining control of stage permissions.
 */
export function createEntertainmentDirector() {
  let sequence = 0;

  function handleFanEvent(input) {
    if (!input || typeof input !== 'object') return { accepted: false, reason: 'invalid_event' };
    const name = safeName(input.name);
    let plan;

    if (input.type === 'gift') {
      const gift = GIFTS[String(input.gift || '').toLowerCase()];
      if (!gift) return { accepted: false, reason: 'unsupported_gift' };
      plan = {
        kind: 'gift',
        label: gift.label,
        action: gift.action,
        speakerId: gift.speakerId,
        participants: [...gift.participants],
        text: gift.response.replaceAll('{name}', name),
        ...(gift.action === 'personal_song' ? { song: makeSong(name) } : {})
      };
    } else if (input.type === 'instruction') {
      const instruction = INSTRUCTIONS[String(input.action || '').toLowerCase()];
      if (!instruction) return { accepted: false, reason: 'unsupported_instruction' };
      plan = {
        kind: 'instruction',
        label: input.action,
        action: instruction.action,
        speakerId: input.action === 'dance' ? 'milo' : 'nova',
        participants: input.action === 'swap_positions' ? ['nova', 'milo', 'zuri'] : ['nova', 'milo', 'zuri'],
        text: instruction.response.replaceAll('{name}', name)
      };
    } else {
      return { accepted: false, reason: 'unsupported_event' };
    }

    sequence += 1;
    return {
      accepted: true,
      eventId: sequence,
      fanName: name,
      performance: plan
    };
  }

  function reset() { sequence = 0; }
  return { handleFanEvent, reset };
}
