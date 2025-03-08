/**
 * A classe MenuScene representa a cena do menu principal do jogo.
 */
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "menuScene" });
  }

  /**
   * Pré-carrega todos os assets necessários para o menu.
   */
  preload() {
    // Carregamento das imagens de fundo
    this.load.image("layer1", "assets/background/layer1.png");
    this.load.image("layer2", "assets/background/layer2.png");
    this.load.image("layer3", "assets/background/layer3.png");
    this.load.image("layer4", "assets/background/layer4.png");
    this.load.image("layer5", "assets/background/layer5.png");
    // Carregamento das imagens da interface de usuário (UI)
    this.load.image("startButton", "assets/ui/startButton.png");
    this.load.image("controlsButton", "assets/ui/controlsButton.png");
    this.load.image("title", "assets/ui/title.png");
  }

  /**
   * Cria e configura todos os elementos visuais do menu.
   */
  create() {
    const { width, height } = this.sys.game.config;

    // Adiciona as imagens de fundo estáticas em ordem
    this.add.image(width / 2, height / 2, "layer1").setOrigin(0.5);
    this.add.image(width / 2, height / 2, "layer2").setOrigin(0.5);
    this.add.image(width / 2, height / 2, "layer3").setOrigin(0.5);
    this.add.image(width / 2, height / 2, "layer4").setOrigin(0.5);
    this.add.image(width / 2, height / 2, "layer5").setOrigin(0.5);

    // Adiciona o título do jogo na parte superior da tela
    const title = this.add.image(width / 2, height / 4, "title");

    // Adiciona o botão "Start" no centro vertical da tela
    const startButton = this.add
      .image(width / 2, height / 1.7, "startButton")
      .setInteractive() // Torna o botão interativo
      .setScale(0.4); // Ajusta o tamanho do botão

    // Ação ao clicar no botão "Start" com transição de fade
    startButton.on("pointerdown", () => {
      this.cameras.main.fadeOut(500, 0, 0, 0, (camera, progress) => {
        if (progress === 1) {
          this.scene.start("gameScene"); // Inicia a cena do jogo após o fade
        }
      });
    });
  }
}
