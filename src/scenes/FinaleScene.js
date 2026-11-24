import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config.js';
import { sfx } from '../utils/audio.js';

const FONT = 'Georgia, serif';

export default class FinaleScene extends Phaser.Scene {
  constructor() { super('Finale'); }

  init(data) { this.d = data; }

  create() {
    sfx('win');
    this.add.image(0, 0, 'bg3').setOrigin(0).setDisplaySize(GAME_W, GAME_H);
    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x05061a, 0.2).setOrigin(0);

    // the festival: many small lanterns drifting up forever
    for (let i = 0; i < 45; i++) {
      const x = Phaser.Math.Between(20, GAME_W - 20);
      const sc = Phaser.Math.FloatBetween(0.12, 0.3);
      const lan = this.add.image(x, GAME_H + 60, 'lantern').setScale(sc).setAlpha(0);
      const aura = this.add.image(x, GAME_H + 60, 'glow').setScale(sc * 3.2)
        .setTint(0xffc857).setBlendMode('ADD').setAlpha(0);
      const delay = Phaser.Math.Between(0, 6000);
      this.tweens.add({
        targets: [lan, aura], y: -80, duration: Phaser.Math.Between(8000, 14000),
        delay, repeat: -1,
      });
      this.tweens.add({ targets: lan, alpha: 1, duration: 800, delay });
      this.tweens.add({ targets: aura, alpha: 0.5, duration: 800, delay });
      this.tweens.add({
        targets: [lan, aura], x: x + Phaser.Math.Between(-30, 30),
        duration: Phaser.Math.Between(2000, 3500), yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }

    // your lantern rises and joins them
    const hero = this.add.image(GAME_W / 2, GAME_H - 100, 'lantern').setScale(0.9);
    const halo = this.add.image(GAME_W / 2, GAME_H - 100, 'glow').setScale(3.4)
      .setAlpha(0.6).setBlendMode('ADD');
    this.tweens.add({
      targets: [hero, halo], y: 300, duration: 3500, ease: 'Cubic.easeOut',
      onComplete: () => {
        this.cameras.main.flash(500, 255, 230, 160);
        const p = this.add.particles(GAME_W / 2, 300, 'spark', {
          speed: { min: 80, max: 280 }, lifespan: 1400,
          scale: { start: 1.4, end: 0 }, blendMode: 'ADD', emitting: false,
        });
        p.explode(70);
        this.tweens.add({ targets: [hero, halo], y: 285, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      },
    });

    const style = { fontFamily: FONT, color: '#ffe9a8', align: 'center', stroke: '#000000', strokeThickness: 6 };
    const title = this.add.text(GAME_W / 2, 470, 'You reached the\nfestival sky!', { ...style, fontSize: '46px' })
      .setOrigin(0.5).setAlpha(0);
    const sub = this.add.text(GAME_W / 2, 580, 'Your light joined\nthousands of lanterns.', { ...style, fontSize: '26px', color: '#ffffff' })
      .setOrigin(0.5).setAlpha(0);
    const score = this.add.text(GAME_W / 2, 665, `${this.d.name ? this.d.name + '  ·  ' : ''}Total score: ${this.d.total}`, { ...style, fontSize: '28px', color: '#9fdcff' })
      .setOrigin(0.5).setAlpha(0);
    const btn = this.add.text(GAME_W / 2, 780, 'PLAY AGAIN', {
      fontFamily: FONT, fontSize: '32px', color: '#3a2210',
      backgroundColor: '#ffc857', padding: { x: 30, y: 10 },
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('Menu'));

    this.tweens.add({ targets: [title, sub, score, btn], alpha: 1, duration: 900, delay: 3200 });
  }
}