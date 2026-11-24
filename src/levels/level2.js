export const level2 = {
  name: 'Thorn Forest',
  bg: 'bg2',
  hint: 'Thorns drain your light. Watch for gusts!',
  height: 2400,
  start: { x: 270, y: 2250 },
  goal: { x: 270, y: 140 },
  drain: 0.012, // light now fades slowly, so fireflies matter
  gust: { first: 6000, min: 5000, max: 9000, warn: 1200, duration: 1800, force: 260 },
  fireflies: [
    { x: 270, y: 2150 }, { x: 270, y: 1960 }, { x: 400, y: 1790 },
    { x: 130, y: 1790 }, { x: 210, y: 1580 }, { x: 400, y: 1560 },
    { x: 330, y: 1380 }, { x: 120, y: 1180 }, { x: 370, y: 1190 },
    { x: 230, y: 980 },  { x: 400, y: 880 },  { x: 120, y: 730 },
    { x: 270, y: 560 },  { x: 230, y: 300 },
  ],
  thorns: [
    { x: 130, y: 2050 }, { x: 400, y: 2050, s: 1.2 },
    { x: 270, y: 1880, s: 1.3 }, { x: 480, y: 1850 },
    { x: 90, y: 1700 }, { x: 330, y: 1650, s: 1.2 },
    { x: 200, y: 1480, s: 1.3 }, { x: 460, y: 1450 },
    { x: 70, y: 1300, s: 1.2 }, { x: 300, y: 1250 },
    { x: 430, y: 1100, s: 1.3 }, { x: 150, y: 1060 },
    { x: 290, y: 900, s: 1.4 }, { x: 60, y: 820 },
    { x: 450, y: 700 }, { x: 180, y: 640, s: 1.3 },
    { x: 350, y: 480, s: 1.2 }, { x: 100, y: 400 },
  ],
};