import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config.js';
import { getCurrent } from '../utils/storage.js';

const FONT = 'Georgia, serif';

export default class ResultScene extends Phaser.Scene {
  constructor() { super('Result'); }

  init(data) { this.d = data; }

  create() {
    const d = this.d;
    const p = getCurrent();
    this.add.image(0, 0, 'bg3').setOrigin(0).setDisplaySize(GAME_W, GAME_H);
    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x05061a, 0.55).setOrigin(0);

    this.add.text(GAME_W / 2, 80, `Level ${d.level + 1} complete!`, {
      fontFamily: FONT, fontSize: '44px', color: '#ffe9a8', stroke: '#3a2210', strokeThickness: 6,
    }).setOrigin(0.5);
    this.add.text(GAME_W / 2, 130, `${d.levelName}  ·  ${d.seconds}s${p ? '  ·  ' + p.name : ''}`, {
      fontFamily: FONT, fontSize: '22px', color: '#9fdcff',
    }).setOrigin(0.5);

    // stars
    for (let i = 0; i < 3; i++) {
      const earned = i < d.stars;
      const s = this.add.text(GAME_W / 2 + (i - 1) * 100, 205, '★', {
        fontFamily: FONT, fontSize: '80px', color: earned ? '#ffc857' : '#2b2f55',
      }).setOrigin(0.5).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 400, delay: 200 + i * 250, ease: 'Back.easeOut' });
    }
    const ok = (b) => (b ? '✓' : '✗');
    this.add.text(GAME_W / 2, 270,
      `✓ Finish    ${ok(d.flags.fireflies)} 70% fireflies    ${ok(d.flags.noHit)} No hits`, {
        fontFamily: FONT, fontSize: '20px', color: '#ffffff',
      }).setOrigin(0.5);

    // score breakdown
    const rows = [
      ['Fireflies & lanterns', d.pickups],
      ['Level clear', d.clear],
      ['Light left', d.glowPts],
      ['Speed bonus', d.timePts],
      ['No-hit bonus', d.noHitPts],
    ];
    rows.forEach((r, i) => {
      const y = 325 + i * 40;
      const a = this.add.text(90, y, r[0], { fontFamily: FONT, fontSize: '26px', color: '#ffffff' }).setAlpha(0);
      const b = this.add.text(450, y, `+${r[1]}`, { fontFamily: FONT, fontSize: '26px', color: '#ffe9a8' }).setOrigin(1, 0).setAlpha(0);
      this.tweens.add({ targets: [a, b], alpha: 1, duration: 300, delay: 600 + i * 180 });
    });
    this.add.rectangle(GAME_W / 2, 535, 360, 2, 0xffc857, 0.8);
    this.add.text(90, 550, 'Level score', { fontFamily: FONT, fontSize: '32px', color: '#ffffff' });
    this.add.text(450, 550, String(d.total), { fontFamily: FONT, fontSize: '36px', color: '#ffc857' }).setOrigin(1, 0);

    if (d.newBest) {
      const nb = this.add.text(GAME_W / 2, 618, 'NEW BEST!', {
        fontFamily: FONT, fontSize: '30px', color: '#9fdcff', stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5);
      this.tweens.add({ targets: nb, scale: { from: 1, to: 1.15 }, duration: 500, yoyo: true, repeat: -1 });
    }
    this.add.text(GAME_W / 2, 668, `Your total score: ${d.journeyTotal}`, {
      fontFamily: FONT, fontSize: '24px', color: '#ffe9a8',
    }).setOrigin(0.5);

    // buttons
    const primary = d.isLast
      ? () => this.scene.start('Finale', { total: d.journeyTotal, name: p ? p.name : '' })
      : () => this.scene.start('Game', { level: d.level + 1 });
    this.button(GAME_W / 2, 760, d.isLast ? 'CONTINUE' : 'NEXT LEVEL', true, primary);
    this.button(GAME_W / 2, 835, 'REPLAY', false, () => this.scene.start('Game', { level: d.level }));
    if (!d.isLast) this.button(GAME_W / 2, 900, 'MENU', false, () => this.scene.start('Menu'));

    this.time.delayedCall(1500, () => {
      this.input.keyboard.once('keydown-SPACE', primary);
      this.input.keyboard.once('keydown-ENTER', primary);
    });
  }

  button(x, y, label, strong, cb) {
    this.add.text(x, y, label, {
      fontFamily: FONT, fontSize: strong ? '32px' : '24px',
      color: strong ? '#3a2210' : '#ffe9a8',
      backgroundColor: strong ? '#ffc857' : '#1b2a6b',
      padding: { x: 28, y: strong ? 10 : 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', cb);
  }
}