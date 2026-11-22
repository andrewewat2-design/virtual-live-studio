import './styles.css';

const $ = (id) => document.getElementById(id);
const state = { socket: null, cast: [], showActive: false, voice: false, stream: null, replies: 0 };
const sampleVisitors = [
  ['Maya', 'Nova, who came up with this whole virtual studio idea?'],
  ['Jay', 'Tell us a joke 😂'],
  ['Kito', 'I challenge Zuri to a quick game!'],
  ['Lena', 'Where is everyone joining from?']
];

function logDirector(message) {
  const line = document.createElement('span');
  line.textContent = message;
  $('director-log').prepend(line);
  while ($('director-log').children.length > 6) $('director-log').lastElementChild.remove();
}

function addChat(kind, name, message, speakerId = '') {
  const item = document.createElement('div');
  item.className = 'chat-item ' + kind;
  const heading = document.createElement('b');
  heading.textContent = kind === 'reply' ? (name + ' · cast') : name;
  const body = document.createElement('p');
  body.textContent = message;
  item.append(heading, body);
  $('chat-feed').append(item);
  $('chat-feed').scrollTop = $('chat-feed').scrollHeight;
  if (kind === 'reply') {
    $('active-speaker').textContent = name + ' is speaking';
    document.querySelectorAll('.avatar-card').forEach((card) => card.classList.toggle('speaking', card.dataset.id === speakerId));
    if (state.voice && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(message));
    }
  }
}

function renderCast(cast) {
  state.cast = cast;
  $('cast-list').replaceChildren();
  $('cast-count').textContent = cast.length + ' characters';
  const stage = $('character-canvas');
  stage.replaceChildren();
  cast.forEach((person, index) => {
    const card = document.createElement('div');
    card.className = 'avatar-card avatar-' + person.id;
    card.dataset.id = person.id;
    card.style.setProperty('--character-color', person.color);
    const orb = document.createElement('div');
    orb.className = 'avatar-orb';
    orb.textContent = person.emoji;
    const name = document.createElement('b');
    name.textContent = person.name;
    const role = document.createElement('small');
    role.textContent = person.role;
    card.append(orb, name, role);
    card.style.animationDelay = (index * 140) + 'ms';
    stage.append(card);
    const mini = document.createElement('div');
    mini.className = 'cast-chip';
    mini.innerHTML = '<span></span>';
    mini.querySelector('span').style.background = person.color;
    const label = document.createElement('div');
    const strong = document.createElement('b');
    strong.textContent = person.name;
    const small = document.createElement('small');
    small.textContent = person.role;
    label.append(strong, small);
    mini.append(label);
    $('cast-list').append(mini);
  });
}

function send(payload) {
  if (state.socket?.readyState === WebSocket.OPEN) state.socket.send(JSON.stringify(payload));
}

function connect() {
  const scheme = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const socket = new WebSocket(scheme + '//' + location.host + '/ws');
  state.socket = socket;
  socket.addEventListener('open', () => {
    $('connection-label').textContent = 'Studio connected';
    document.querySelector('.topbar-status').classList.add('connected');
  });
  socket.addEventListener('close', () => {
    $('connection-label').textContent = 'Studio disconnected';
    document.querySelector('.topbar-status').classList.remove('connected');
    setTimeout(connect, 1800);
  });
  socket.addEventListener('error', () => $('connection-label').textContent = 'Connecting…');
  socket.addEventListener('message', (event) => {
    let data;
    try { data = JSON.parse(event.data); } catch { return; }
    if (data.type === 'hello') {
      renderCast(data.cast || []);
      state.showActive = Boolean(data.showActive);
      updateShowControls();
      (data.events || []).forEach((entry) => {
        if (entry.type === 'visitor') addChat('visitor', entry.name, entry.text);
        if (entry.type === 'reply') addChat('reply', entry.speakerName, entry.text, entry.speakerId);
      });
    }
    if (data.type === 'visitor') addChat('visitor', data.name, data.text);
    if (data.type === 'reply') {
      state.replies += 1;
      addChat('reply', data.speakerName, data.text, data.speakerId);
      $('director-status').textContent = 'Director completed turn ' + state.replies;
      logDirector(data.speakerName + ' took the next turn.');
    }
    if (data.type === 'show') {
      state.showActive = data.active;
      updateShowControls();
      logDirector(data.text);
    }
    if (data.type === 'moment') {
      const moments = { question: 'The host is inviting the room to share opinions.', poll: 'A quick poll is ready for the audience.', challenge: 'A mini challenge has been announced.' };
      $('moment-output').textContent = moments[data.moment] || 'A new moment is ready.';
    }
    if (data.type === 'room:cleared') {
      $('chat-feed').replaceChildren();
      $('moment-output').textContent = 'Room cleared. Ready for a fresh show.';
      $('active-speaker').textContent = 'Waiting for the show to begin';
      state.replies = 0;
    }
    if (data.type === 'notice' || data.type === 'moderation') logDirector(data.text || 'A message was filtered.');
  });
}

function updateShowControls() {
  $('start-show').disabled = state.showActive;
  $('pause-show').disabled = !state.showActive;
  $('director-status').textContent = state.showActive ? 'Director is listening to the room' : 'Waiting for audience';
}

$('start-show').addEventListener('click', () => send({ type: 'show:start' }));
$('pause-show').addEventListener('click', () => send({ type: 'show:pause' }));
$('chat-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = $('chat-input');
  const text = input.value.trim();
  if (!text) return;
  send({ type: 'chat', name: 'You (test visitor)', text });
  input.value = '';
});
$('seed-chat').addEventListener('click', () => sampleVisitors.forEach(([name, text], index) => {
  setTimeout(() => send({ type: 'chat', name, text }), index * 420);
}));
document.querySelectorAll('[data-moment]').forEach((button) => button.addEventListener('click', () => send({ type: 'moment', moment: button.dataset.moment })));
$('clear-room').addEventListener('click', () => {
  if (confirm('Clear the local room conversation?')) send({ type: 'room:clear' });
});
$('voice-toggle').addEventListener('click', () => {
  state.voice = !state.voice;
  $('voice-toggle').textContent = state.voice ? '◖ Voice on' : '◖ Voice off';
  $('voice-toggle').setAttribute('aria-pressed', String(state.voice));
  if (!state.voice && 'speechSynthesis' in window) window.speechSynthesis.cancel();
});

function stopScreenShare(message = 'Screen sharing stopped.') {
  if (state.stream) state.stream.getTracks().forEach((track) => track.stop());
  state.stream = null;
  $('screen-preview').srcObject = null;
  $('screen-preview').classList.remove('visible');
  $('screen-placeholder').hidden = false;
  $('screen-status').textContent = 'NOT SHARED';
  $('screen-status').classList.remove('active');
  $('start-screen-share').disabled = false;
  $('stop-screen-share').disabled = true;
  $('screen-help').textContent = message + ' Visual AI analysis is not connected yet.';
}

$('start-screen-share').addEventListener('click', async () => {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    $('screen-help').textContent = 'This browser does not expose screen sharing here. Try a supported desktop browser or a newer browser version.';
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: { ideal: 5, max: 8 } }, audio: false });
    state.stream = stream;
    $('screen-preview').srcObject = stream;
    $('screen-preview').classList.add('visible');
    $('screen-placeholder').hidden = true;
    $('screen-status').textContent = 'SHARING';
    $('screen-status').classList.add('active');
    $('start-screen-share').disabled = true;
    $('stop-screen-share').disabled = false;
    $('screen-help').textContent = 'Your selected screen is visible to this studio only. No frames are being sent to a server or AI provider in this milestone.';
    stream.getVideoTracks()[0]?.addEventListener('ended', () => stopScreenShare('The browser ended screen sharing.'));
  } catch (error) {
    const messages = {
      NotAllowedError: 'Screen sharing was cancelled or permission was denied.',
      NotFoundError: 'No shareable screen or tab was available in this browser.',
      NotReadableError: 'The selected screen could not be captured by the browser or operating system.'
    };
    $('screen-help').textContent = messages[error.name] || 'Could not start screen sharing: ' + error.message;
  }
});
$('stop-screen-share').addEventListener('click', () => stopScreenShare());
window.addEventListener('beforeunload', () => {
  if (state.stream) state.stream.getTracks().forEach((track) => track.stop());
});

renderCast([
  { id: 'nova', name: 'Nova', role: 'Main host', color: '#9c83ff', emoji: '✦' },
  { id: 'milo', name: 'Milo', role: 'The playful one', color: '#ffb36b', emoji: '☀' },
  { id: 'zuri', name: 'Zuri', role: 'The challenger', color: '#70d6c2', emoji: '✧' }
]);
connect();
