// Audio: plays your AI-generated mp3 files if they exist,
// otherwise falls back to small synthesized sounds (Web Audio).
// Mobile-safe: audio starts only after the first finger-lift / click.
const MUTE_KEY = 'lanternDrift.muted';
let game = null;
let muted = false;
let musicObj = null;
let synthTimer = null;
let buttons = [];
let unlockInstalled = false;

try { muted = localStorage.getItem(MUTE_KEY) === '1'; } catch (e) { /* ignore */ }

const ctxOf = () => (game && game.sound && game.sound.context) || null;
const running = () => { const c = ctxOf(); return !!c && c.state === 'running'; };
const hasFile = (key) => !!game && game.cache.audio.exists(key);

export function initAudio(g) {
  game = g;
  installUnlock();
}

// Browsers only allow audio after a real user gesture (on phones: touchend / click).
function installUnlock() {
  if (unlockInstalled) return;
  unlockInstalled = true;
  const events = ['touchend', 'pointerup', 'click', 'keydown'];
  const handler = () => {
    const ctx = ctxOf();
    if (!ctx) return;
    const done = () => {
      if (ctx.state !== 'running') return;
      // play one silent sample: required to fully unlock iOS
      try {
        const b = ctx.createBuffer(1, 1, 22050);
        const s = ctx.createBufferSource();
        s.buffer = b;
        s.connect(ctx.destination);
        s.start(0);
      } catch (e) { /* ignore */ }
      events.forEach((ev) => window.removeEventListener(ev, handler));
      startMusic();
    };
    if (ctx.state === 'running') done();
    else ctx.resume().then(done).catch(() => {});
  };
  events.forEach((ev) => window.addEventListener(ev, handler, { passive: true }));
}

function tone(freq, start, dur, type = 'sine', vol = 0.12, slideTo = null, attack = 0.02) {
  const ctx = ctxOf();
  if (!ctx || ctx.state !== 'running') return;
  const t0 = ctx.currentTime + start;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g);
  g.connect(ctx.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

const SYNTH = {
  collect() { tone(880, 0, 0.25, 'sine', 0.12); tone(1320, 0.08, 0.3, 'sine', 0.1); },
  hit() { tone(160, 0, 0.3, 'triangle', 0.2, 60); },
  light() { tone(440, 0, 0.5, 'sine', 0.1, 880); tone(660, 0.15, 0.6, 'sine', 0.08); tone(990, 0.3, 0.6, 'sine', 0.06); },
  win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.15, 0.7, 'sine', 0.12)); },
  lose() { tone(330, 0, 1.6, 'sine', 0.12, 110); },
};

export function sfx(key) {
  if (muted || !game) return;
  if (hasFile(key)) game.sound.play(key, { volume: 0.7 });
  else if (SYNTH[key] && running()) SYNTH[key]();
}

const SCALE = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25];
function pad() {
  if (!running()) return;
  const f = SCALE[Math.floor(Math.random() * SCALE.length)];
  tone(f, 0, 3.4, 'sine', 0.05, null, 0.8);
  if (Math.random() < 0.5) tone(f / 2, 0, 3.8, 'sine', 0.04, null, 1.0);
}

export function startMusic() {
  if (muted || !game) return;
  if (!running()) return; // the unlock handler will call this again
  if (hasFile('music')) {
    if (!musicObj) musicObj = game.sound.add('music', { loop: true, volume: 0.35 });
    if (!musicObj.isPlaying) musicObj.play();
  } else if (!synthTimer) {
    pad();
    synthTimer = setInterval(pad, 1800);
  }
}

export function stopMusic() {
  if (musicObj && musicObj.isPlaying) musicObj.stop();
  if (synthTimer) { clearInterval(synthTimer); synthTimer = null; }
}

export function isMuted() { return muted; }

export function toggleMute() {
  muted = !muted;
  try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch (e) { /* ignore */ }
  if (muted) stopMusic(); else startMusic();
  buttons = buttons.filter((b) => b.active);
  buttons.forEach((b) => b.setText(muted ? '🔇' : '🔊'));
}

export function addMuteButton(scene, x, y) {
  const b = scene.add.text(x, y, muted ? '🔇' : '🔊', { fontSize: '30px' })
    .setOrigin(1, 0).setScrollFactor(0).setDepth(110)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => toggleMute());
  buttons.push(b);
  return b;
}