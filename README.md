# Lantern Drift

A calm, atmospheric mobile and web game. On festival night, a tiny lantern spirit drifts into a dark, wild sky. You don't steer it. You draw the wind, and its glow is both your health and your vision.

Play it: https://lantern-drift-game.netlify.app
Demo video: _(add your video link)_

## The idea

- Draw the wind. Drag a finger or the mouse to draw short wind trails. The lantern is pushed along them, so it feels like drifting, not driving.
- Light is everything. The glow is both health and vision. The world outside it is dark. Fireflies grow the light, and hazards shrink it. If it reaches zero, the lantern fades out.
- One new rule per level. Each of the three levels changes how you think, not only how fast you react.

## How to play

| Action | Touch | Keyboard / mouse |
|---|---|---|
| Move | Drag to draw wind | Drag with the mouse, or arrow keys / WASD |
| Stop | Hold your finger still | Hold the mouse still |
| Pause | Tap the II button | P or Esc |
| Mute | Tap the speaker | M |

Goal: guide the lantern up to the golden beacon at the top of each level.

## Levels

| # | Name | New rule |
|---|---|---|
| 1 | Meadow | Learn to draw wind and collect fireflies. No danger. |
| 2 | Thorn Forest | Thorns drain your light, and gusts push you sideways after a warning. |
| 3 | Storm Sky | A shadow creature hunts you. Touch dormant lanterns to light them and push it back. |

Finish Level 3 to reach the festival sky.

## Scoring

| Item | Points |
|---|---|
| Each firefly | +10 |
| Each lantern lit (Level 3) | +50 |
| Level clear | +100 |
| Light left at the finish | up to +100 |
| Speed bonus | up to +100 |
| No-hit bonus | +50 |

You earn 1 to 3 stars per level: finish it, collect at least 70% of the fireflies, and take no hits. Progress, best scores, and unlocked levels are saved per player name in the browser.

## Features

- Three levels, a start screen with player names, a result screen with stars, a pause menu, and a finale
- Light-as-health darkness effect with a pulsing glow
- Hand-painted AI-generated art with slow parallax backgrounds
- Particle effects, screen shake, a glowing lantern trail, and warned gusts
- Music and sound effects with a mute button
- Works on phones and desktops with the same code

## Tech stack

| Layer | Choice |
|---|---|
| Game engine | Phaser 3 |
| Build tool | Vite |
| Language | JavaScript (ES modules) |
| Physics | Phaser Arcade Physics |
| Saving | Browser localStorage |
| Backend and database | None. It is a static site. |

## Run it locally

You need Node.js installed.

```bash
git clone <your-repo-url>
cd lantern-drift
npm install
npm run dev
```

Open the address Vite prints (usually `http://localhost:5173`). To test on a phone on the same Wi-Fi, run `npm run dev -- --host` and open the Network address.

To build for hosting:

```bash
npm run build
```

The output is in the `dist` folder and can be uploaded to any static host.

## Project structure

```
lantern-drift/
├── index.html
├── public/assets/
│   ├── images/        # AI-generated art (logo, characters, backgrounds)
│   └── audio/         # optional mp3 files
├── src/
│   ├── main.js        # game setup
│   ├── config.js      # all tuning values
│   ├── scenes/        # Boot, Menu, Game, Result, Finale, Pause
│   ├── levels/        # level data (level1.js to level3.js)
│   └── utils/         # storage.js (profiles), audio.js (sound)
└── docs/              # research, AI log, concept, screenshots
```

Every level is a small data file, and one `GameScene` runs them all. Tuning values (wind strength, drain, difficulty) live in `src/config.js`.

## How AI was used

AI was used throughout, and every prompt and tool is logged in [`docs/ai-prompts.md`](docs/ai-prompts.md).

| Area | Tool |
|---|---|
| Concept, design, and all game code | Claude |
| Logo, characters, and backgrounds | Gemini image generation |
| Reference research (first draft) | Gemini, structured with Claude |
| Image cleanup | Photopea and a background remover |
| Audio | Synthesized sounds written with Claude _(update if you add AI-generated music)_ |

## Documents
- [Art direction board](docs/art-direction-board.png)
- [Game concept](docs/Lantern%20Drift%20Game%20Concept.docx)
- [Reference games research](docs/research.md)
- [AI tools and workflow log](docs/ai-prompts.md)

## Known limitations

- Player history is saved in one browser and does not follow a player to another device. A hosted leaderboard would be the next step.
- Sound is currently synthesized in code. Real music files can be dropped into `public/assets/audio/` and listed in `BootScene.js`.
- This is a prototype with three levels, not a full commercial game.
