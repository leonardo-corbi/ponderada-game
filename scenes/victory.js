/**
 * A classe VictoryScene representa a cena de vitória do jogo.
 */
export default class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: "victoryScene" });
  }

  /**
   * Pré-carrega todos os assets necessários para a cena de vitória.
   */
  preload() {
    // Carregamento das imagens de fundo
    this.load.image("layer1", "assets/background/layer1.png");
    this.load.image("layer2", "assets/background/layer2.png");
    this.load.image("layer3", "assets/background/layer3.png");
    this.load.image("layer4", "assets/background/layer4.png");
    this.load.image("layer5", "assets/background/layer5.png");
    // Carregamento das imagens da interface de usuário (UI)
    this.load.image("title", "assets/ui/title.png");
    this.load.image("backButton", "assets/ui/backButton.png");
    this.load.image("developedBy", "assets/ui/developed_by.png");
    this.load.image("inteli", "assets/ui/inteli.png");
  }

  /**
   * Cria e configura todos os elementos visuais da cena de vitória.
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

    // Adiciona a imagem "Developed By" à esquerda
    const developedBy = this.add.image(width / 3, height / 2.4, "developedBy");

    // Adiciona a imagem "Inteli" à direita
    const inteli = this.add.image(width / 1.4, height / 2.4, "inteli");

    // Adiciona o botão "Back" no centro inferior da tela
    const backButton = this.add
      .image(width / 2, height / 1.3, "backButton")
      .setInteractive(); // Torna o botão interativo

    // Ação ao clicar no botão "Back" com transição de fade
    backButton.on("pointerdown", () => {
      this.cameras.main.fadeOut(500, 0, 0, 0, (camera, progress) => {
        if (progress === 1) {
          this.scene.start("menuScene"); // Retorna à cena do menu após o fade
        }
      });
    });
  }
}
