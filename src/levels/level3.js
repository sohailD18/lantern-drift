export const level3 = {
  name: 'Storm Sky',
  bg: 'bg3',
  hint: 'A shadow hunts your light. Touch dormant lanterns to push it back!',
  height: 2400,
  start: { x: 270, y: 2250 },
  goal: { x: 270, y: 140 },
  drain: 0.01,
  gust: { first: 4000, min: 3500, max: 6500, warn: 900, duration: 1800, force: 280 },
  shadow: {
    startGap: 300,   // starts this far below the lantern (just off screen)
    delay: 3500,     // ms before it starts chasing
    speed: 60,       // base chase speed (px/s)
    ramp: 0.002,     // speed gained per ms, so it gets faster over time
    stun: 2500,      // ms it freezes after you light a lantern
    pushBack: 450,   // px it is thrown back
  },
  fireflies: [
    { x: 270, y: 2120 }, { x: 140, y: 1950 }, { x: 400, y: 1700 },
    { x: 200, y: 1550 }, { x: 350, y: 1300 }, { x: 120, y: 1150 },
    { x: 400, y: 950 },  { x: 250, y: 820 },  { x: 130, y: 560 },
    { x: 380, y: 430 },
  ],
  thorns: [
    { x: 150, y: 2020, s: 1.2 }, { x: 400, y: 1850 }, { x: 90, y: 1600, s: 1.2 },
    { x: 430, y: 1380 }, { x: 250, y: 1230, s: 1.3 }, { x: 80, y: 900 },
    { x: 420, y: 700, s: 1.2 }, { x: 270, y: 520, s: 1.3 },
  ],
  dormant: [
    { x: 270, y: 1850 }, { x: 130, y: 1450 }, { x: 400, y: 1080 },
    { x: 150, y: 720 },  { x: 340, y: 380 },
  ],
};