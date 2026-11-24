import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config.js';

const FONT = 'Georgia, serif';

export default class PauseScene extends Phaser.Scene {
  constructor() { super('Pause'); }

  init(data) { this.levelIndex = data.level ?? 0; }

  create() {
    // dim layer; also blocks touches from reaching the paused game
    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x05061a, 0.78).setOrigin(0).setInteractive();

    this.add.text(GAME_W / 2, 300, 'Paused', {
      fontFamily: FONT, fontSize: '56px', color: '#ffe9a8',
      stroke: '#3a2210', strokeThickness: 6,
    }).setOrigin(0.5);

    this.button(430, 'RESUME', true, () => this.resume());
    this.button(520, 'RESTART', false, () => {
      this.scene.stop('Game');
      this.scene.start('Game', { level: this.levelIndex });
    });
    this.button(595, 'MENU', false, () => {
      this.scene.stop('Game');
      this.scene.start('Menu');
    });

    this.input.keyboard.on('keydown-P', () => this.resume());
    this.input.keyboard.on('keydown-ESC', () => this.resume());
  }

  resume() {
    this.scene.resume('Game');
    this.scene.stop();
  }

  button(y, label, strong, cb) {
    this.add.text(GAME_W / 2, y, label, {
      fontFamily: FONT, fontSize: strong ? '34px' : '26px',
      color: strong ? '#3a2210' : '#ffe9a8',
      backgroundColor: strong ? '#ffc857' : '#1b2a6b',
      padding: { x: 30, y: strong ? 10 : 7 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', cb);
  }
}