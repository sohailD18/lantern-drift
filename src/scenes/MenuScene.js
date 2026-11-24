import { startMusic, addMuteButton } from '../utils/audio.js';
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config.js';
import { LEVELS } from '../levels/index.js';
import { getCurrent, listPlayers, findPlayer, setPlayer, topScores } from '../utils/storage.js';

const FONT = 'Georgia, serif';

export default class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    this.input.keyboard.clearCaptures();
    this.input.keyboard.disableGlobalCapture();
    this.levelObjs = [];
    this.startLevel = 0;

    this.add.image(0, 0, 'bg1').setOrigin(0).setDisplaySize(GAME_W, GAME_H);
    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x05061a, 0.4).setOrigin(0);

    for (let i = 0; i < 12; i++) {
      const f = this.add.image(
        Phaser.Math.Between(20, GAME_W - 20),
        Phaser.Math.Between(300, GAME_H - 40),
        'firefly'
      ).setScale(0.4);
      this.tweens.add({
        targets: f, y: f.y - Phaser.Math.Between(40, 120),
        alpha: { from: 0.3, to: 1 }, duration: Phaser.Math.Between(1500, 3000),
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }

    this.add.image(GAME_W / 2, 120, 'logo');
    addMuteButton(this, GAME_W - 24, 16);
    this.input.once('pointerdown', () => startMusic());

    const lantern = this.add.image(GAME_W / 2, 290, 'lantern').setScale(0.9);
    const aura = this.add.image(GAME_W / 2, 290, 'glow').setScale(2.6).setAlpha(0.45).setBlendMode('ADD');
    this.tweens.add({ targets: [lantern, aura], y: 275, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // name input
    this.add.text(GAME_W / 2, 372, 'Player name', { fontFamily: FONT, fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);
    const last = getCurrent();
    this.nameInput = this.add.dom(
      GAME_W / 2, 420, 'input',
      `width:300px;height:46px;font:28px ${FONT};text-align:center;border-radius:10px;` +
      'border:2px solid #ffc857;background:#0a0c2e;color:#ffe9a8;outline:none;'
    );
    const el = this.nameInput.node;
    el.setAttribute('maxlength', '12');
    el.setAttribute('placeholder', 'Your name');
    el.setAttribute('autocomplete', 'off');
    el.value = last ? last.name : '';
    el.addEventListener('input', () => this.refresh());
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.play(); });

    // recent players on this device
    const recent = listPlayers().slice(0, 4);
    if (recent.length) {
      const chips = recent.map((p) =>
        this.add.text(0, 482, p.name, {
          fontFamily: FONT, fontSize: '20px', color: '#ffe9a8',
          backgroundColor: '#1b2a6b', padding: { x: 10, y: 5 },
        }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
          .on('pointerdown', () => { el.value = p.name; this.refresh(); })
      );
      const gap = 10;
      const totalW = chips.reduce((s, c) => s + c.width, 0) + gap * (chips.length - 1);
      let cx = (GAME_W - totalW) / 2;
      chips.forEach((c) => { c.x = cx; cx += c.width + gap; });
    }

    this.playBtn = this.add.text(GAME_W / 2, 690, 'PLAY', {
      fontFamily: FONT, fontSize: '36px', color: '#3a2210',
      backgroundColor: '#ffc857', padding: { x: 36, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.play());
    this.tweens.add({ targets: this.playBtn, scale: { from: 1, to: 1.06 }, duration: 800, yoyo: true, repeat: -1 });

    // top scores on this device
    this.add.text(GAME_W / 2, 765, 'Top scores on this device', {
      fontFamily: FONT, fontSize: '22px', color: '#9fdcff',
    }).setOrigin(0.5);
    const top = topScores(5);
    if (!top.length) {
      this.add.text(GAME_W / 2, 805, 'No scores yet. Be the first!', {
        fontFamily: FONT, fontSize: '20px', color: '#ffffff',
      }).setOrigin(0.5);
    } else {
      top.forEach((t, i) => {
        this.add.text(150, 800 + i * 28, `${i + 1}. ${t.name}`, { fontFamily: FONT, fontSize: '22px', color: '#ffffff' });
        this.add.text(390, 800 + i * 28, String(t.total), { fontFamily: FONT, fontSize: '22px', color: '#ffe9a8' }).setOrigin(1, 0);
      });
    }

    this.refresh();
  }

  refresh() {
    const p = findPlayer(this.nameInput.node.value);
    const unlocked = p ? Math.min(p.unlocked, LEVELS.length) : 1;
    this.startLevel = unlocked - 1;
    this.playBtn.setText(p && p.plays > 0 ? `CONTINUE (Level ${unlocked})` : 'PLAY');

    this.levelObjs.forEach((o) => o.destroy());
    this.levelObjs = [];

    LEVELS.forEach((L, i) => {
      const x = GAME_W / 2 + (i - (LEVELS.length - 1) / 2) * 150;
      const y = 585;
      const open = i < unlocked;
      const box = this.add.rectangle(x, y, 130, 120, open ? 0x1b2a6b : 0x15152e, 0.9)
        .setStrokeStyle(2, open ? 0xffc857 : 0x444466);
      const num = this.add.text(x, y - 30, String(i + 1), {
        fontFamily: FONT, fontSize: '40px', color: open ? '#ffe9a8' : '#666688',
      }).setOrigin(0.5);
      const nm = this.add.text(x, y + 4, open ? L.name : 'Locked', {
        fontFamily: FONT, fontSize: '16px', color: open ? '#ffffff' : '#666688',
      }).setOrigin(0.5);
      const st = p && p.levels[i] ? p.levels[i].stars : 0;
      const stars = this.add.text(x, y + 36, open ? '★'.repeat(st) + '☆'.repeat(3 - st) : '', {
        fontFamily: FONT, fontSize: '24px', color: '#ffc857',
      }).setOrigin(0.5);
      if (open) box.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.start(i));
      this.levelObjs.push(box, num, nm, stars);
    });
  }

  play() { this.start(this.startLevel); }

  start(levelIndex) {
    startMusic();
    setPlayer(this.nameInput.node.value);
    this.scene.start('Game', { level: levelIndex });
  }
}