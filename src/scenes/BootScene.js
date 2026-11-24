import { initAudio } from '../utils/audio.js';
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config.js';

export default class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    const txt = this.add.text(GAME_W / 2, GAME_H / 2, 'Loading... 0%', {
      fontFamily: 'Georgia, serif', fontSize: '28px', color: '#ffe9a8',
    }).setOrigin(0.5);
    this.load.on('progress', (v) => txt.setText(`Loading... ${Math.round(v * 100)}%`));
    this.load.on('loaderror', (f) => console.warn('Missing asset:', f.key));

    this.load.setPath(`${import.meta.env.BASE_URL}assets/images/`);
    this.load.image('logo', 'logo.png');
    this.load.image('lantern', 'lantern.png');
    this.load.image('firefly', 'firefly.png');
    this.load.image('thorn', 'thorn.png');
    this.load.image('shadow', 'shadow.png');
    this.load.image('bg1', 'bg1.jpg');
    this.load.image('bg2', 'bg2.jpg');
    this.load.image('bg3', 'bg3.jpg');
    // List only the audio files you actually have in public/assets/audio/
    const AUDIO_FILES = []; // later, for example: ['music', 'win', 'collect']
    this.load.setPath(`${import.meta.env.BASE_URL}assets/audio/`);
    AUDIO_FILES.forEach((k) => this.load.audio(k, `${k}.mp3`));
  }

  create() {
    initAudio(this.game);
    this.makeSky();
    this.makeGlow();
    this.makeSpark();
    this.makeGoal();
    this.scene.start('Menu');
  }

  makeSky() {
    const t = this.textures.createCanvas('sky', 16, 256);
    const c = t.context;
    const g = c.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#f2b45a');
    g.addColorStop(0.2, '#2a6f8f');
    g.addColorStop(0.6, '#1b2a6b');
    g.addColorStop(1, '#0a0c2e');
    c.fillStyle = g;
    c.fillRect(0, 0, 16, 256);
    t.refresh();
  }

  makeGlow() {
    const s = 256;
    const t = this.textures.createCanvas('glow', s, s);
    const c = t.context;
    const g = c.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.55, 'rgba(255,255,255,0.85)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, s, s);
    t.refresh();
  }

  makeSpark() {
    const s = 32;
    const t = this.textures.createCanvas('spark', s, s);
    const c = t.context;
    const g = c.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,250,200,1)');
    g.addColorStop(0.3, 'rgba(255,220,90,0.9)');
    g.addColorStop(1, 'rgba(255,200,60,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, s, s);
    t.refresh();
  }

  makeGoal() {
    const s = 200;
    const t = this.textures.createCanvas('goal', s, s);
    const c = t.context;
    const g = c.createRadialGradient(100, 100, 0, 100, 100, 100);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,225,120,0.9)');
    g.addColorStop(1, 'rgba(255,170,60,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, s, s);
    t.refresh();
  }
}