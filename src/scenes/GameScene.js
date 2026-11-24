import { sfx, addMuteButton, toggleMute } from '../utils/audio.js';
import Phaser from 'phaser';
import { GAME_W, GAME_H, TUNING, SCORE } from '../config.js';
import { LEVELS } from '../levels/index.js';
import { getCurrent, addPlay, recordResult } from '../utils/storage.js';

const FONT = 'Georgia, serif';

export default class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  init(data) { this.levelIndex = data.level ?? 0; }

  create() {
    const L = (this.level = LEVELS[this.levelIndex]);
    this.finished = false;
    this.glow = 0.8;
    this.segments = [];
    this.lastPoint = null;
    this.lastMoveTime = 0;
    this.score = 0;
    this.hits = 0;
    this.elapsed = 0;
    this.collected = 0;
    this.flyTotal = L.fireflies.length;
    this.litCount = 0;
    this.hitCooldown = 0;
    addPlay();

    // keyboard: arrows + WASD
    this.input.keyboard.enableGlobalCapture();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');

    this.physics.world.setBounds(0, 0, GAME_W, L.height);
    this.cameras.main.setBounds(0, 0, GAME_W, L.height);

    // background: painted image with slow parallax (falls back to the code-drawn sky)
    if (L.bg && this.textures.exists(L.bg)) {
      const src = this.textures.get(L.bg).getSourceImage();
      const s = Math.max(GAME_W / src.width, (GAME_H + 300) / src.height);
      this.bg = this.add.image(GAME_W / 2, 0, L.bg).setOrigin(0.5, 0)
        .setScale(s).setScrollFactor(0).setDepth(-10);
      this.bgRange = Math.max(0, this.bg.displayHeight - GAME_H);
      this.bg.y = -this.bgRange; // start by showing the bottom of the picture
    } else {
      this.bg = null;
      this.add.image(0, 0, 'sky').setOrigin(0).setDisplaySize(GAME_W, L.height);
    }

    // fireflies (sprite + soft glow behind it)
    this.fireflies = L.fireflies.map((p) => {
      const halo = this.add.image(p.x, p.y, 'spark').setDepth(4).setScale(2)
        .setBlendMode('ADD').setAlpha(0.6);
      const f = this.add.image(p.x, p.y, 'firefly').setDepth(5).setScale(0.5);
      f.halo = halo;
      this.tweens.add({
        targets: f, scale: { from: 0.42, to: 0.58 },
        duration: Phaser.Math.Between(600, 1100), yoyo: true, repeat: -1,
      });
      this.tweens.add({
        targets: halo, alpha: { from: 0.35, to: 0.85 },
        duration: Phaser.Math.Between(600, 1100), yoyo: true, repeat: -1,
      });
      return f;
    });

    // thorns (Level 2+)
    this.thorns = (L.thorns || []).map((p) => {
      const sc = p.s || 1;
      const th = this.add.image(p.x, p.y, 'thorn').setDepth(5).setScale(0.5 * sc);
      th.hitR = 26 * sc;
      this.tweens.add({ targets: th, angle: 360, duration: 7000, repeat: -1 });
      this.add.image(p.x, p.y, 'glow')
        .setDepth(52).setTint(0xff3355).setAlpha(0.22)
        .setScale(0.6 * sc).setBlendMode('ADD');
      return th;
    });

    // gusts
    this.gust = L.gust ? { state: 'idle', timer: L.gust.first, dir: 1 } : null;
    this.gustGfx = this.add.graphics().setScrollFactor(0).setDepth(90);
    this.gustText = this.add.text(GAME_W / 2, 260, '', {
      fontFamily: FONT, fontSize: '40px', color: '#bfe9ff',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setAlpha(0);

    // dormant lanterns + shadow (Level 3)
    this.dormant = (L.dormant || []).map((p) => {
      const img = this.add.image(p.x, p.y, 'lantern').setScale(TUNING.lanternScale)
        .setDepth(5).setTint(0x556677).setAlpha(0.7);
      const aura = this.add.image(p.x, p.y, 'glow')
        .setDepth(52).setTint(0x66ccff).setAlpha(0.3).setScale(0.7).setBlendMode('ADD');
      this.tweens.add({ targets: aura, alpha: { from: 0.15, to: 0.4 }, duration: 800, yoyo: true, repeat: -1 });
      return { img, aura, lit: false };
    });

    if (L.shadow) {
      this.shadow = this.add.image(L.start.x, L.start.y + L.shadow.startGap, 'shadow')
        .setDepth(56).setScale(0.7);
      this.tweens.add({ targets: this.shadow, scale: { from: 0.65, to: 0.79 }, duration: 700, yoyo: true, repeat: -1 });
      this.shadowState = { delay: L.shadow.delay, stun: 0, elapsed: 0, cooldown: 0 };
      this.litText = this.add.text(20, 128, `Lanterns lit: 0 / ${this.dormant.length}`, {
        fontFamily: FONT, fontSize: '22px', color: '#9fdcff',
        stroke: '#000000', strokeThickness: 4,
      }).setScrollFactor(0).setDepth(100);
    }

    // goal beacon
    this.goal = this.add.image(L.goal.x, L.goal.y, 'goal').setDepth(60).setBlendMode('ADD');
    this.tweens.add({ targets: this.goal, scale: { from: 1, to: 1.3 }, duration: 900, yoyo: true, repeat: -1 });

    // lantern
    this.lantern = this.physics.add.image(L.start.x, L.start.y, 'lantern')
      .setScale(TUNING.lanternScale).setDepth(60);
    this.lantern.setCollideWorldBounds(true);
    this.lantern.setMaxVelocity(TUNING.maxSpeed);
    this.lantern.setGravityY(TUNING.sink);
    this.cameras.main.startFollow(this.lantern, true, 0.08, 0.08);

    // glowing trail behind the lantern
    this.trail = this.add.particles(0, 0, 'spark', {
      follow: this.lantern,
      speed: { min: 5, max: 25 },
      lifespan: 800,
      scale: { start: 0.7, end: 0 },
      alpha: { start: 0.6, end: 0 },
      frequency: 55,
      blendMode: 'ADD',
    }).setDepth(59);

    // darkness layer
    this.dark = this.add.renderTexture(0, 0, GAME_W, GAME_H)
      .setOrigin(0).setScrollFactor(0).setDepth(50);
    this.glowStamp = this.make.image({ key: 'glow', add: false });

    // wind ribbons + HUD
    this.windGfx = this.add.graphics().setDepth(55);
    this.hud = this.add.graphics().setScrollFactor(0).setDepth(100);

    const style = {
      fontFamily: FONT, fontSize: '22px', color: '#ffe9a8',
      stroke: '#000000', strokeThickness: 4,
    };
    this.levelText = this.add.text(20, 10, `Level ${this.levelIndex + 1} / ${LEVELS.length}: ${L.name}`, style)
      .setScrollFactor(0).setDepth(100);
    this.flyText = this.add.text(20, 38, '', style).setScrollFactor(0).setDepth(100);
    this.scoreText = this.add.text(20, 64, 'Score: 0', {
      ...style, fontSize: '28px', color: '#ffffff',
    }).setScrollFactor(0).setDepth(100);
    const player = getCurrent();
    this.add.text(GAME_W - 20, 10, player ? player.name : '', { ...style, color: '#9fdcff' })
      .setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    this.hint = this.add.text(GAME_W / 2, 200, L.hint, {
      fontFamily: FONT, fontSize: '22px', color: '#ffffff',
      align: 'center', wordWrap: { width: GAME_W - 80 },
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.tweens.add({ targets: this.hint, alpha: 0, delay: 5000, duration: 800 });
    addMuteButton(this, GAME_W - 24, 44);
    this.input.keyboard.on('keydown-M', () => toggleMute());

    this.add.text(GAME_W - 24, 80, 'II', {
      fontFamily: FONT, fontSize: '28px', fontStyle: 'bold', color: '#ffe9a8',
      stroke: '#000000', strokeThickness: 4, padding: { x: 8, y: 4 },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(110)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.pauseGame());
    this.input.keyboard.on('keydown-P', () => this.pauseGame());
    this.input.keyboard.on('keydown-ESC', () => this.pauseGame());


    // input: drawing wind
    this.input.on('pointerdown', (p) => { this.lastPoint = { x: p.x, y: p.y }; this.lastMoveTime = this.time.now; });
    this.input.on('pointermove', (p) => this.addWind(p));
    this.input.on('pointerup', () => { this.lastPoint = null; });

  }

  pauseGame() {
    if (this.finished || this.scene.isPaused()) return;
    this.scene.launch('Pause', { level: this.levelIndex });
    this.scene.pause();
  }

  addWind(p) {
    if (!p.isDown || !this.lastPoint || this.finished) return;
    // direction comes from SCREEN movement, so camera scrolling can't bias it
    const dx = p.x - this.lastPoint.x;
    const dy = p.y - this.lastPoint.y;
    const d = Math.hypot(dx, dy);
    if (d < TUNING.trailMinDist) return;
    const cam = this.cameras.main;
    const x1 = this.lastPoint.x + cam.scrollX, y1 = this.lastPoint.y + cam.scrollY;
    const x2 = p.x + cam.scrollX, y2 = p.y + cam.scrollY;
    this.segments.push({
      x1, y1, x2, y2,
      mx: (x1 + x2) / 2, my: (y1 + y2) / 2,
      dx: dx / d, dy: dy / d, age: 0,
    });
    this.lastPoint = { x: p.x, y: p.y };
    this.lastMoveTime = this.time.now;
  }

  update(time, delta) {
    if (this.finished) return;
    this.elapsed += delta;
    const dt = delta / 1000;
    const { x, y } = this.lantern;

    // wind
    let fx = 0, fy = 0;
    const g = this.windGfx;
    g.clear();
    for (let i = this.segments.length - 1; i >= 0; i--) {
      const s = this.segments[i];
      s.age += delta;
      if (s.age > TUNING.windLife) { this.segments.splice(i, 1); continue; }
      const life = 1 - s.age / TUNING.windLife;
      const dist = Phaser.Math.Distance.Between(x, y, s.mx, s.my);
      if (dist < TUNING.windRadius) {
        const k = (1 - dist / TUNING.windRadius) * life * TUNING.windForce;
        fx += s.dx * k;
        fy += s.dy * k;
      }
      g.lineStyle(6 * life + 1, 0xbfe9ff, 0.7 * life);
      g.lineBetween(s.x1, s.y1, s.x2, s.y2);
    }

    // keyboard adds to the wind force
    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const up = this.cursors.up.isDown || this.keys.W.isDown;
    const down = this.cursors.down.isDown || this.keys.S.isDown;
    if (left) fx -= TUNING.keyForce;
    if (right) fx += TUNING.keyForce;
    if (up) fy -= TUNING.keyForce;
    if (down) fy += TUNING.keyForce;

    fx += this.updateGust(time, delta);

    // finger resting on the screen = brake
    const holding = this.input.activePointer.isDown && time - this.lastMoveTime > TUNING.holdBrakeMs;
    if (holding) this.segments.length = 0;

    // cap total push so overlapping strokes can't launch the lantern
    const push = Math.hypot(fx, fy);
    if (push > TUNING.maxPush) { fx *= TUNING.maxPush / push; fy *= TUNING.maxPush / push; }
    this.lantern.setAcceleration(fx, fy);

    // friction every frame, much stronger while braking
    this.lantern.body.velocity.scale(Math.pow(holding ? TUNING.brake : TUNING.damping, dt));
    this.lantern.rotation = Phaser.Math.Clamp(this.lantern.body.velocity.x / 800, -0.3, 0.3);

    // light drain
    this.glow = Phaser.Math.Clamp(this.glow - this.level.drain * dt, 0, 1);

    // collect fireflies
    for (const f of this.fireflies) {
      if (f.active && Phaser.Math.Distance.Between(x, y, f.x, f.y) < 34) this.collect(f);
    }

    this.hitThorns(time);
    this.updateShadow(time, delta);

    // darkness with a soft pulsing hole around the lantern
    const radius = (TUNING.glowMin + this.glow * TUNING.glowRange) * (1 + 0.03 * Math.sin(time / 200));
    const cam = this.cameras.main;
    this.dark.fill(0x05061a, TUNING.darkness);
    this.glowStamp.setScale((radius * 2) / 256);
    this.dark.erase(this.glowStamp, x - cam.scrollX, y - cam.scrollY);

    this.drawHud();

    // win / lose
    if (Phaser.Math.Distance.Between(x, y, this.level.goal.x, this.level.goal.y) < 60) this.win();
    else if (this.glow <= 0) this.lose();
  }

  updateGust(time, delta) {
    const G = this.level.gust;
    const g = this.gustGfx;
    g.clear();
    if (!G) return 0;
    const s = this.gust;
    s.timer -= delta;

    if (s.state === 'idle' && s.timer <= 0) {
      s.state = 'warn';
      s.timer = G.warn;
      s.dir = Math.random() < 0.5 ? -1 : 1;
      this.gustText.setText(s.dir > 0 ? 'Gust >>>' : '<<< Gust');
    } else if (s.state === 'warn' && s.timer <= 0) {
      s.state = 'blow';
      sfx('wind');
      s.timer = G.duration;
      this.gustText.setAlpha(0);
    } else if (s.state === 'blow' && s.timer <= 0) {
      s.state = 'idle';
      s.timer = Phaser.Math.Between(G.min, G.max);
    }

    if (s.state === 'warn') this.gustText.setAlpha(0.5 + 0.5 * Math.sin(time / 90));
    if (s.state === 'blow') {
      g.lineStyle(3, 0xbfe9ff, 0.45);
      for (let i = 0; i < 12; i++) {
        const y = (time * 0.25 + i * 83) % GAME_H;
        const run = ((time * 1.2 + i * 97) % (GAME_W + 200)) - 100;
        const x = s.dir > 0 ? run : GAME_W - run;
        g.lineBetween(x, y, x + s.dir * 80, y);
      }
      return s.dir * G.force;
    }
    return 0;
  }

  hitThorns(time) {
    if (time < this.hitCooldown) return;
    const { x, y } = this.lantern;
    for (const th of this.thorns) {
      if (Phaser.Math.Distance.Between(x, y, th.x, th.y) < th.hitR + 16) {
        this.glow = Math.max(0, this.glow - 0.15);
        this.hits++;
        sfx('hit');
        this.hitCooldown = time + 900;
        this.cameras.main.shake(180, 0.012);
        const a = Math.atan2(y - th.y, x - th.x);
        this.lantern.setVelocity(Math.cos(a) * 240, Math.sin(a) * 240);
        this.lantern.setTint(0xff6677);
        this.time.delayedCall(250, () => this.lantern.clearTint());
        break;
      }
    }
  }

  updateShadow(time, delta) {
    const SH = this.level.shadow;
    if (!SH) return;
    const st = this.shadowState;
    const { x, y } = this.lantern;

    for (const d of this.dormant) {
      if (!d.lit && Phaser.Math.Distance.Between(x, y, d.img.x, d.img.y) < 55) this.lightLantern(d);
    }

    if (st.delay > 0) { st.delay -= delta; return; }
    if (st.stun > 0) { st.stun -= delta; return; }

    st.elapsed += delta;
    const speed = SH.speed + st.elapsed * SH.ramp;
    const a = Math.atan2(y - this.shadow.y, x - this.shadow.x);
    this.shadow.x += Math.cos(a) * speed * (delta / 1000);
    this.shadow.y += Math.sin(a) * speed * (delta / 1000);

    const reach = this.shadow.displayWidth * 0.28 + 14;
    if (time > st.cooldown && Phaser.Math.Distance.Between(x, y, this.shadow.x, this.shadow.y) < reach) {
      st.cooldown = time + 1200;
      this.glow = Math.max(0, this.glow - 0.2);
      this.hits++;
      sfx('hit');
      this.cameras.main.shake(220, 0.015);
      this.lantern.setVelocity(Math.cos(a) * 300, Math.sin(a) * 300);
      this.lantern.setTint(0xaa88ff);
      this.time.delayedCall(250, () => this.lantern.clearTint());
    }
  }

  lightLantern(d) {
    d.lit = true;
    sfx('light');
    this.litCount++;
    d.img.clearTint().setAlpha(1).setDepth(60);
    this.tweens.killTweensOf(d.aura);
    d.aura.setTint(0xffc857).setAlpha(0.6).setScale(1.4);
    this.glow = Math.min(1, this.glow + 0.1);
    this.litText.setText(`Lanterns lit: ${this.litCount} / ${this.dormant.length}`);
    this.addScore(SCORE.lantern, d.img.x, d.img.y - 40);

    const p = this.add.particles(d.img.x, d.img.y, 'spark', {
      speed: { min: 80, max: 220 }, lifespan: 700,
      scale: { start: 1.2, end: 0 }, blendMode: 'ADD', emitting: false,
    }).setDepth(61);
    p.explode(25);
    this.time.delayedCall(900, () => p.destroy());
    this.cameras.main.flash(250, 255, 220, 150);

    this.shadowState.stun = this.level.shadow.stun;
    this.tweens.add({
      targets: this.shadow,
      y: Math.min(this.level.height + 300, this.shadow.y + this.level.shadow.pushBack),
      duration: 700, ease: 'Cubic.easeOut',
    });
  }

  collect(f) {
    sfx('collect');
    this.collected++;
    this.glow = Math.min(1, this.glow + 0.06);
    this.addScore(SCORE.firefly, f.x, f.y - 20);
    const p = this.add.particles(f.x, f.y, 'spark', {
      speed: { min: 50, max: 140 }, lifespan: 500,
      scale: { start: 0.9, end: 0 }, blendMode: 'ADD', emitting: false,
    }).setDepth(61);
    p.explode(10);
    this.time.delayedCall(700, () => p.destroy());
    this.tweens.killTweensOf([f, f.halo]);
    f.halo.destroy();
    f.destroy();
  }

  addScore(n, x, y) {
    this.score += n;
    if (x !== undefined) this.popText(x, y, `+${n}`);
    this.tweens.add({ targets: this.scoreText, scale: { from: 1.25, to: 1 }, duration: 200 });
  }

  popText(x, y, msg) {
    const t = this.add.text(x, y, msg, {
      fontFamily: FONT, fontSize: '24px', color: '#ffe9a8',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(65);
    this.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 800, onComplete: () => t.destroy() });
  }

  drawHud() {
    const h = this.hud;
    h.clear();

    // glow (health) bar
    h.fillStyle(0x000000, 0.5).fillRoundedRect(20, 104, 200, 16, 8);
    h.fillStyle(0xffc857, 1).fillRoundedRect(20, 104, 200 * this.glow, 16, 8);

    this.flyText.setText(`Fireflies: ${this.collected} / ${this.flyTotal}`);
    this.scoreText.setText(`Score: ${this.score}`);

    // vertical progress bar
    const { start, goal } = this.level;
    const progress = Phaser.Math.Clamp((start.y - this.lantern.y) / (start.y - goal.y), 0, 1);
    const barX = GAME_W - 30, barTop = 140, barH = 640;
    h.fillStyle(0x000000, 0.5).fillRoundedRect(barX - 6, barTop, 12, barH, 6);
    h.fillStyle(0xffc857, 0.9).fillRoundedRect(barX - 6, barTop + barH * (1 - progress), 12, barH * progress, 6);
    h.fillStyle(0xfff3b0, 1).fillCircle(barX, barTop + barH * (1 - progress), 9);
    h.fillStyle(0xffffff, 1).fillCircle(barX, barTop, 7);

    // parallax: the painted background drifts as you climb
    if (this.bg) this.bg.y = -this.bgRange * (1 - progress);
  }

  win() {
    this.finished = true;
    this.trail.stop();
    this.lantern.setAcceleration(0, 0).setVelocity(0, 0).setGravityY(0);
    const p = this.add.particles(this.lantern.x, this.lantern.y, 'spark', {
      speed: { min: 80, max: 260 }, lifespan: 1200,
      scale: { start: 1.4, end: 0 }, blendMode: 'ADD', emitting: false,
    }).setDepth(61);
    p.explode(60);
    this.cameras.main.flash(500, 255, 230, 160);
    sfx('win');
    // scoring
    const par = (this.level.par || SCORE.parSeconds) * 1000;
    const clear = SCORE.levelClear;
    const glowPts = Math.round(this.glow * SCORE.glowMax);
    const timePts = Math.round(SCORE.timeMax * Phaser.Math.Clamp(1 - this.elapsed / par, 0, 1));
    const noHitPts = this.hits === 0 ? SCORE.noHit : 0;
    const total = this.score + clear + glowPts + timePts + noHitPts;
    const ratio = this.flyTotal ? this.collected / this.flyTotal : 1;
    const fireflyStar = ratio >= SCORE.starRatio;
    const noHitStar = this.hits === 0;
    const stars = 1 + (fireflyStar ? 1 : 0) + (noHitStar ? 1 : 0);
    const res = recordResult(this.levelIndex, total, stars);

    this.time.delayedCall(1400, () => {
      this.scene.start('Result', {
        level: this.levelIndex,
        levelName: this.level.name,
        isLast: this.levelIndex + 1 >= LEVELS.length,
        pickups: this.score, clear, glowPts, timePts, noHitPts, total, stars,
        newBest: res.newBest,
        journeyTotal: res.total,
        flags: { fireflies: fireflyStar, noHit: noHitStar },
        seconds: Math.round(this.elapsed / 1000),
      });
    });
  }

  lose() {
    this.finished = true;
    this.trail.stop();
    this.lantern.setAcceleration(0, 0);
    sfx('lose');
    this.tweens.add({ targets: this.lantern, alpha: 0, duration: 1500 });
    this.time.delayedCall(1500, () =>
      this.endText(`The light faded...\nScore: ${this.score}\nTap to try again`, () =>
        this.scene.start('Game', { level: this.levelIndex })));
  }

  endText(msg, onTap) {
    this.add.text(GAME_W / 2, GAME_H / 2, msg, {
      fontFamily: FONT, fontSize: '38px', color: '#ffe9a8',
      align: 'center', stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(120);
    this.time.delayedCall(500, () => {
      this.input.once('pointerdown', onTap);
      this.input.keyboard.once('keydown-SPACE', onTap);
      this.input.keyboard.once('keydown-ENTER', onTap);
    });
  }
}