# Lantern Drift: AI Tools & Workflow Log

This file documents every AI tool used to build Lantern Drift, what each was used for, the prompts, and what I decided or fixed by hand.

Items marked _(fill in)_ are details only I know (exact prompts or tool versions) and need to be completed before submitting.

## 1. Summary

| Area | Tool | Used for |
|---|---|---|
| Concept and design | Claude | Brainstorming, original hook, 3-level structure, art direction, concept document |
| Game code | Claude | Phaser project structure, scenes, wind-drawing controls, light mask, 3 levels, scoring, profiles, audio, pause and finale |
| Debugging | Claude | Console error diagnosis, touch-control bug, audio on mobile, file-name case issue |
| Reference research | Gemini (first draft), Claude (structure) | Analysis of 3 reference games |
| Sprites, logo, backgrounds | Gemini (image generation) | Lantern, firefly, thorn, shadow creature, logo, 3 backgrounds |
| Art direction board | Claude (script) | Assembled the board image from the generated assets |
| Image cleanup | Photopea and a background remover _(fill in which)_ | Background removal, trimming, resizing, removing the generator's corner mark |
| Audio | Claude (code) | Synthesized music and sound effects using the Web Audio API, with a slot for AI-generated mp3 files _(update if you add Suno / ElevenLabs files)_ |

## 2. Tech stack

- Phaser 3.90.0 (game engine)
- Vite (dev server and build)
- JavaScript (ES modules)
- Browser localStorage for player profiles and scores
- No backend or database
- Hosting: _(add at the end: Netlify / GitHub Pages link)_

## 3. Workflow overview

1. Used Claude to turn a plain idea ("Lantern Drift") into an original concept: draw the wind to move the lantern, and light is both health and vision.
2. Researched three reference games (Gemini first draft, structured with Claude) and linked each to a design decision.
3. Built the game in stages with Claude: Level 1, then Levels 2 and 3, score and profiles, art, audio, and polish. After each stage I tested on laptop and phone and reported problems back.
4. Generated all character, logo, and background art with an image AI in one consistent style, then cleaned it up by hand.
5. Replaced the code-drawn placeholders with the AI art using the same texture names, so no gameplay code had to change.

## 4. Prompt log

### Entry 1: Concept development
- Tool: Claude
- Goal: Turn "Lantern Drift" into an original, distinct concept.
- Prompt: _(fill in: paste your first message asking for a review of the Lantern Drift structure and concept)_
- Result: Hook defined: draw wind trails instead of steering directly; glow as health and vision; one new rule per level.
- My decisions: Kept the three-level structure and chose to build only one polished game.

### Entry 2: Design document
- Tool: Claude (Docs)
- Prompt: "Create a Claude Doc from your last answer."
- Result: `Lantern Drift Game Concept` document: pitch, mechanics, levels, ending, art direction.

### Entry 3: Project structure and stack
- Tool: Claude
- Prompt: "Guide me how to build with project structure and which tech is used in FE BE DB."
- Result: Front-end-only plan (Phaser + Vite), scene and level-data structure, no backend or database.
- My decisions: Chose pure Phaser instead of adding React, to keep the scope small and match the brief's preference.

### Entry 4: Level 1 prototype
- Tool: Claude
- Result: Boot, Menu, and Game scenes; code-drawn placeholder art; draw-the-wind input; darkness mask with a glow hole; fireflies and a goal beacon.
- Problem and fix: A `404` in the console was the missing favicon, fixed with a one-line `<link rel="icon">`.

### Entry 5: Keyboard controls
- Prompt: "Only mouse is working, I am unable to play with arrow buttons or WASD."
- Result: Arrow keys and WASD added on top of wind drawing.

### Entry 6: Level progress HUD
- Prompt: "I can't see which level I am in or what I need to do to reach the next level."
- Result: Level label, firefly counter, vertical progress bar, and a level-complete summary.

### Entry 7: Level 2, Thorn Forest
- Prompt: "Level2"
- Result: Thorn hazards that drain glow, warned sideways gusts, slow light drain.

### Entry 8: Level 3, Storm Sky
- Prompt: "Level3"
- Result: A chasing shadow that speeds up over time, and dormant lanterns that stun it and push it back.

### Entry 9: Score and player history
- Prompt: "I can see the health bar but unable to see points, and what about storing history for each user?"
- Result: Score system (fireflies, lanterns, speed, light left, no-hit bonus), 1 to 3 stars, result screen, and per-player profiles saved in the browser with level unlocking and top scores.
- My decisions: Chose browser storage over a backend, because it hosts as a plain static site. Limit: history does not follow a player to another device.

### Entry 10: Touch-control bug (playtest finding)
- What I found: On my phone, dragging up moved the lantern fast, but dragging down or trying to stop barely worked.
- Diagnosis (Claude): Stroke direction was measured in world coordinates while the camera scrolled, strokes stacked their forces, and there was no real braking.
- Fix: Strokes measured in screen space, a cap on total push, per-frame friction, and holding a finger still brakes the lantern. I confirmed it felt right on my phone.

### Entry 11: AI art generation
- Tool: Gemini image generation. Full prompts are in section 5.
- Result: Logo, lantern, firefly, thorn, shadow creature, and three backgrounds in one style.
- Problems and fixes: The first thorn prompt was refused by the image tool's content filter, so I reworded it (removed "menacing" and "cute", added "dramatic" and "mysterious"). Two backgrounds had the tool's corner sparkle mark, which I removed.

### Entry 12: Art integration
- Tool: Claude
- Result: All eight images loaded; sprites scaled to on-screen size; slow parallax backgrounds; logo on the menu; a firefly glow behind each sprite; darkness level tuned so the backgrounds show through.
- Problem and fix: The shadow image failed to load because the file was named `Shadow.png` and the code asked for `shadow.png`. Renamed to lowercase, which also prevents a failure on case-sensitive web hosts.

### Entry 13: Audio
- Tool: Claude
- Result: An audio system that plays AI-generated mp3 files when they exist and otherwise synthesized sounds, with a mute button that is remembered.
- Problems and fixes: A typo (`fx` instead of `sfx`) crashed the game at the first gust. Sound did not play on my phone, because mobile browsers allow audio only after the finger is lifted, so I rewrote the unlock logic.

### Entry 14: Polish
- Tool: Claude
- Result: Pause menu, glowing lantern trail, a festival-sky finale after Level 3, and removal of the developer level-skip key.

### Entry 15: Reference research
- Tools: Gemini (first draft) and Claude (structure)
- Result: `docs/research.md` covers Alto's Odyssey, Downwell, and Archero, each linked to a design decision.
- My decisions: Removed a generated section that described a different game (a cave-descent concept) because it did not match what I built.

## 5. Art generation log

Style anchor, used in every prompt:
`soft hand-painted digital illustration, paper lantern aesthetic, deep indigo and teal night palette with warm amber and gold glow, gentle painterly brush texture, clean silhouette, cute and calm mood, no text, no watermark`

| Asset | Tool | Prompt (then the style anchor) | Output file | Cleanup |
|---|---|---|---|---|
| Logo | Gemini | `game logo that reads "Lantern Drift", glowing golden lettering with a small paper lantern, soft warm light, on a dark indigo background` | `logo.png` | Background removed, corner sparkle removed, trimmed |
| Lantern spirit | Gemini | `a round glowing paper lantern with a tiny happy face, small top cap and bottom tassel, warm amber light inside, front view, single object, centered` | `lantern.png` | Background removed, trimmed, resized to about 99x128 |
| Firefly | Gemini | `a single tiny glowing firefly, soft golden light, simple wings, single object, centered` | `firefly.png` | Background removed, resized to 64x64 |
| Thorn | Gemini | First attempt (refused): `a dark spiky thorn bramble ball ... menacing but stylized`. Accepted: `a dark spiky bramble ball, dramatic silhouette, deep purple-black thorns with a faint crimson glowing rim, mysterious forest hazard, single object, centered, plain flat background` | `thorn.png` | Background removed, resized to 144x144 |
| Shadow creature | Gemini | `a smoky shadow spirit with soft wispy edges and two pale glowing eyes, dark violet and indigo smoke, mysterious, front view, single object, centered, plain flat background` | `shadow.png` | Background removed, resized to about 343x320 |
| Dormant lantern | None | Reuses the lantern image, tinted grey in code | none | none |
| Background: Meadow | Gemini | `a quiet night meadow with tall grass and wildflowers at the bottom, soft amber glow on the horizon, deep indigo sky with faint stars above` plus anchor, `no characters, tall vertical composition, calm uncluttered center, 9:16 portrait` | `bg1.jpg` | Corner sparkle mark removed, exported as JPG |
| Background: Thorn Forest | Gemini | `a misty dark forest at night with tree silhouettes on both sides, teal fog drifting between the trees, a narrow gap of indigo night sky in the middle` plus the same ending | `bg2.jpg` | Resized, exported as JPG |
| Background: Storm Sky | Gemini | `a dramatic night sky with swirling violet clouds and distant soft flashes of light, a warm golden glow of tiny floating paper lanterns far above` plus the same ending | `bg3.jpg` | Corner sparkle mark removed, exported as JPG |

_(fill in: replace "background remover" in the Summary with the exact tool you used, for example remove.bg or Photopea)_

## 6. Audio log

| Sound | How it was made | File |
|---|---|---|
| Ambient music | Synthesized in code with the Web Audio API (soft sine notes on a calm scale) | none (generated live) |
| Firefly collect | Synthesized two-note chime | none |
| Thorn / shadow hit | Synthesized low thud | none |
| Lantern lit | Synthesized rising glow | none |
| Win | Synthesized four-note rising chime | none |
| Lose | Synthesized slow falling tone | none |

_(fill in: if you generate real files with Suno or ElevenLabs, list the tool, the exact prompt, and the file name here, and update the Summary table)_

## 7. What AI did and what I did

- AI generated: code scaffolding and all three levels, the scoring and profile system, the audio system, and all character, logo, and background art.
- I directed and decided: the concept direction, the choice to build one polished game, difficulty and feel tuning, the art style and which generated image to keep for each asset, and the level layouts.
- I did by hand: testing on laptop and phone, reporting bugs, image cleanup in an editor (background removal, trimming, resizing, removing watermarks), and file organization.

## 8. Lessons learned

- One shared style prompt kept the logo, characters, and backgrounds consistent.
- Real-device testing found a control bug that desktop testing never showed.
- Keeping all tuning values in one config file made balancing quick.
- Small file-name details (a capital letter, a missing letter in a function name) cause errors that are easy to miss, so check the console first.
