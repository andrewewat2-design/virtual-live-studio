const CAST = [
  { id: 'nova', name: 'Nova', role: 'Main host', style: 'warm, quick-witted, welcoming', color: '#9c83ff', emoji: '✦' },
  { id: 'milo', name: 'Milo', role: 'The playful one', style: 'curious, cheeky, light-hearted', color: '#ffb36b', emoji: '☀' },
  { id: 'zuri', name: 'Zuri', role: 'The challenger', style: 'confident, clever, encouraging', color: '#70d6c2', emoji: '✧' }
];

const SAFE_FALLBACKS = [
  'I see you in the room! What should we get into next?',
  'That is a strong opening. The room is warming up!',
  'Okay, now you have our attention. Tell us more.',
  'I am putting that question to the room. Who has a take?',
  'We need a little more context before we crown a winner!'
];

const BLOCKED_PATTERNS = [
  /\b(kill yourself|go kill yourself)\b/i,
  /\b(doxx|doxing|swat them)\b/i,
  /\b(send .*password|credit card number)\b/i
];

export function getCast() {
  return CAST.map((character) => ({ ...character }));
}

export function moderateMessage(input) {
  if (typeof input !== 'string') return { allowed: false, reason: 'invalid' };
  const text = input.trim();
  if (!text) return { allowed: false, reason: 'empty' };
  if (text.length > 240) return { allowed: false, reason: 'too_long' };
  if (BLOCKED_PATTERNS.some((pattern) => pattern.test(text))) {
    return { allowed: false, reason: 'unsafe' };
  }
  if (/https?:\/\//i.test(text) || /www\./i.test(text)) {
    return { allowed: false, reason: 'links_disabled' };
  }
  return { allowed: true, text };
}

function chooseSpeaker(message, turn) {
  const lower = message.toLowerCase();
  if (/challenge|dare|bet|prove|game|competition/.test(lower)) return CAST[2];
  if (/joke|funny|laugh|😂|🤣/.test(lower)) return CAST[1];
  if (turn % 4 === 3) return CAST[1];
  if (turn % 5 === 4) return CAST[2];
  return CAST[0];
}

export function createDirector() {
  let turn = 0;
  let lastSpeaker = null;
  let lastReplyAt = 0;
  const history = [];

  function respond(rawMessage) {
    const moderation = moderateMessage(rawMessage);
    if (!moderation.allowed) {
      return { accepted: false, moderation, reply: null };
    }
    const now = Date.now();
    let speaker = chooseSpeaker(moderation.text, turn);
    if (speaker.id === lastSpeaker && turn > 0) {
      const alternate = CAST.find((member) => member.id !== lastSpeaker);
      if (alternate) speaker = alternate;
    }
    const replyText = buildReply(moderation.text, speaker, turn);
    turn += 1;
    lastSpeaker = speaker.id;
    lastReplyAt = now;
    history.push({ role: 'visitor', text: moderation.text, at: now });
    history.push({ role: 'character', speakerId: speaker.id, text: replyText, at: now });
    if (history.length > 40) history.splice(0, history.length - 40);
    return {
      accepted: true,
      moderation,
      reply: { speakerId: speaker.id, speakerName: speaker.name, text: replyText, at: now },
      director: { turn, lastSpeaker: speaker.id, lastReplyAt }
    };
  }

  function reset() {
    turn = 0;
    lastSpeaker = null;
    lastReplyAt = 0;
    history.length = 0;
  }

  return { respond, reset, getHistory: () => history.map((entry) => ({ ...entry })) };
}

function buildReply(message, speaker, turn) {
  const name = speaker.name;
  const lower = message.toLowerCase();
  if (/^(hi|hey|hello|heyy|yo)\b/.test(lower)) {
    return speaker.id === 'nova'
      ? 'Hey, welcome in! Grab a seat in the virtual lounge. What brings you here?'
      : 'Look who just walked in! Welcome to the room!';
  }
  if (/who are you|your name|introduce/.test(lower)) {
    return speaker.id === 'nova'
      ? 'I am Nova, your host. Milo brings the mischief, Zuri brings the challenges, and I keep this show moving.'
      : speaker.id === 'milo'
        ? 'Milo. Professional question-asker, amateur troublemaker. Nice to meet you!'
        : 'Zuri here. I bring the challenges. Are you ready to earn your place on the leaderboard?';
  }
  if (/boring|bored/.test(lower)) return 'Bored? That sounds like a challenge. Give us one topic and we will make a show out of it.';
  if (/joke|funny/.test(lower)) return 'I had a joke about livestream latency, but you would probably hear the punchline tomorrow.';
  if (/challenge|dare|game/.test(lower)) return 'Challenge accepted! Give the room ten seconds: what is one thing you can do better than everyone here?';
  if (/love|❤️|❤/.test(lower)) return 'Sending that good energy right back to you. You are part of the room now!';
  if (/where.*(from|live)|country|kenya|nairobi/.test(lower)) return 'We have room for the whole world in here. Where are you joining us from?';
  if (message.endsWith('?')) return 'That is a good question. Let us hear two different opinions before we decide.';
  if (turn % 3 === 1) return 'Milo has entered the conversation: that is either genius or the beginning of a very funny mistake.';
  if (turn % 3 === 2) return 'Zuri says we should turn that into a challenge. Who is brave enough to go first?';
  return SAFE_FALLBACKS[turn % SAFE_FALLBACKS.length].replace('I see you', name === 'Nova' ? 'I see you' : name + ' sees you');
}
