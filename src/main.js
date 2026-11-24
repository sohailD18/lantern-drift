import Phaser from 'phaser';
import './style.css';
import { GAME_W, GAME_H } from './config.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import ResultScene from './scenes/ResultScene.js';
import FinaleScene from './scenes/FinaleScene.js';
import PauseScene from './scenes/PauseScene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_W,
  height: GAME_H,
  backgroundColor: '#05061a',
  dom: { createContainer: true }, // needed for the name input box
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [BootScene, MenuScene, GameScene, ResultScene, FinaleScene, PauseScene],
});