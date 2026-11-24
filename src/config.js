export const GAME_W = 540;
export const GAME_H = 960;

// All tuning values live here so you can balance quickly.
export const TUNING = {
  darkness: 0.86,     // how dark the world is outside your glow (was 0.93, lower lets the backgrounds show)
  lanternScale: 0.6,  // on-screen size of the lantern image
  windRadius: 160,
  windForce: 90,       // push per stroke segment
  maxPush: 330,        // cap on total push, so strokes can't stack up
  windLife: 700,       // ms a stroke lasts (shorter = easier to change direction)
  trailMinDist: 14,
  maxSpeed: 220,
  damping: 0.35,       // share of speed kept per second (lower = stops faster)
  brake: 0.02,         // same, while holding a finger still
  holdBrakeMs: 140,    // finger still this long = brake
  sink: 25,
  glowMin: 80,
  glowRange: 220,
  keyForce: 320,
};

export const SCORE = {
  firefly: 10,
  lantern: 50,
  levelClear: 100,
  glowMax: 100,
  timeMax: 100,
  noHit: 50,
  parSeconds: 120,  // finishing at or after this gives 0 speed bonus
  starRatio: 0.7,   // share of fireflies needed for the 2nd star
};