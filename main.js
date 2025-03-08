import GameScene from "./scenes/game.js";
import MenuScene from "./scenes/menu.js";
import VictoryScene from "./scenes/victory.js";

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "boot" });
  }
}

const larguraJogo = 1000;
const alturaJogo = 550;

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
  },
  width: larguraJogo,
  height: alturaJogo,
  pixelArt: true,
  roundPixels: false,

  render: {
    autoResize: true,
    preserveDrawingBuffer: true,
  },

  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },

  scene: [MenuScene, GameScene, VictoryScene],
};

const game = new Phaser.Game(config);
