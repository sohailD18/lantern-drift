// Player profiles saved in the browser (localStorage).
// If storage is blocked (some private modes), the game still works in memory.
const KEY = 'lanternDrift.v1';
let data = null;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.players) return parsed;
    }
  } catch (e) { /* ignore: fall back to memory */ }
  return { current: null, players: {} };
}

function db() {
  if (!data) data = load();
  return data;
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
}

const keyOf = (name) => name.trim().toLowerCase();

export function cleanName(raw) {
  const n = (raw || '').replace(/\s+/g, ' ').trim().slice(0, 12);
  return n || 'Player';
}

export function findPlayer(raw) {
  const n = (raw || '').trim();
  if (!n) return null;
  return db().players[keyOf(n)] || null;
}

export function setPlayer(raw) {
  const name = cleanName(raw);
  const k = keyOf(name);
  const d = db();
  if (!d.players[k]) {
    d.players[k] = { name, created: Date.now(), plays: 0, unlocked: 1, levels: {}, total: 0, lastPlayed: Date.now() };
  }
  d.current = k;
  d.players[k].lastPlayed = Date.now();
  save();
  return d.players[k];
}

export function getCurrent() {
  const d = db();
  return d.current ? d.players[d.current] || null : null;
}

export function listPlayers() {
  return Object.values(db().players).sort((a, b) => b.lastPlayed - a.lastPlayed);
}

export function addPlay() {
  const p = getCurrent();
  if (p) { p.plays++; p.lastPlayed = Date.now(); save(); }
}

export function recordResult(levelIndex, score, stars) {
  const p = getCurrent();
  if (!p) return { newBest: false, total: 0 };
  const prev = p.levels[levelIndex];
  const newBest = !prev || score > prev.best;
  p.levels[levelIndex] = {
    best: Math.max(score, prev ? prev.best : 0),
    stars: Math.max(stars, prev ? prev.stars : 0),
  };
  p.unlocked = Math.max(p.unlocked, levelIndex + 2);
  p.total = Object.values(p.levels).reduce((s, l) => s + l.best, 0);
  save();
  return { newBest, total: p.total };
}

export function topScores(n = 5) {
  return listPlayers()
    .filter((p) => p.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, n)
    .map((p) => ({ name: p.name, total: p.total }));
}