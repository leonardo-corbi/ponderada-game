import GameScene from "./scenes/game.js";

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
      debug: true,
    },
  },

  scene: [GameScene],
};

const game = new Phaser.Game(config);
