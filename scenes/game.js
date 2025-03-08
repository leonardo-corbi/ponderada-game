import { showControlsPopup } from "../assets/components/popup.js";

/**
 * A classe GameScene representa a cena principal do jogo, onde toda a lógica é gerenciada.
 * Ela herda de Phaser.Scene para utilizar os recursos do framework Phaser.
 */
export default class GameScene extends Phaser.Scene {
  // --- Propriedades da Classe ---
  constructor() {
    super({ key: "gameScene" }); // Define o nome da cena como "gameScene"
    this.hasGun = false; // Indica se o jogador coletou a arma
    this.hasShield = false; // Indica se o jogador coletou o escudo
    this.playerHealth = 100; // Vida atual do jogador
    this.maxHealth = 100; // Vida máxima do jogador
    this.isAnimating = false; // Controla se o jogador está em uma animação
    this.shieldActive = false; // Controla se o escudo está ativo
  }

  // --- Pré-carregamento de Assets ---
  /**
   * Carrega todos os assets (imagens, spritesheets e tilemaps) necessários para o jogo.
   * Organizado por categorias para facilitar a leitura.
   */
  preload() {
    // Backgrounds com efeito parallax
    this.load.image("layer1", "assets/background/layer1.png");
    this.load.image("layer2", "assets/background/layer2.png");
    this.load.image("layer3", "assets/background/layer3.png");
    this.load.image("layer4", "assets/background/layer4.png");
    this.load.image("layer5", "assets/background/layer5.png");

    // Tilesets e mapa
    this.load.image("tileset", "assets/map/tileset.png");
    this.load.image("tileset-2", "assets/map/tileset-2.png");
    this.load.tilemapTiledJSON("map", "assets/map/map.tmj");

    // Assets do jogador
    this.load.image("idle", "assets/player/idle.png");
    this.load.spritesheet("run", "assets/player/run.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet("shoot", "assets/player/shoot.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.image("shield", "assets/player/shield.png");

    // Assets dos inimigos
    this.load.spritesheet("enemy-idle", "assets/enemy/idle.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("enemy-shoot", "assets/enemy/shoot.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    // Projéteis
    this.load.image("bullet", "assets/bullet.png");
  }

  // --- Criação dos Elementos do Jogo ---
  /**
   * Configura os elementos visuais e físicos do jogo, como background, mapa, jogador e inimigos.
   * Separado em subseções para maior clareza.
   */
  create() {
    const { width, height } = this.sys.game.canvas; // Dimensões da tela
    const map = this.make.tilemap({ key: "map" }); // Cria o tilemap a partir do arquivo JSON
    const worldWidth = map.widthInPixels; // Largura do mundo em pixels
    const worldHeight = map.heightInPixels; // Altura do mundo em pixels
    this.worldHeight = worldHeight; // Armazena a altura do mundo

    // **Background com Parallax**
    this.layer1 = this.add
      .tileSprite(0, 0, worldWidth, height, "layer1")
      .setOrigin(0) // Origem no canto superior esquerdo
      .setScrollFactor(0.1) // Fator de rolagem para o efeito parallax
      .setTileScale(0.5); // Escala do tile
    this.layer2 = this.add
      .tileSprite(0, 0, worldWidth, height, "layer2")
      .setOrigin(0)
      .setScrollFactor(0.3)
      .setTileScale(0.75);
    this.layer3 = this.add
      .tileSprite(0, 0, worldWidth, height, "layer3")
      .setOrigin(0)
      .setScrollFactor(0.5);
    this.layer4 = this.add
      .tileSprite(0, 0, worldWidth, height, "layer4")
      .setOrigin(0)
      .setScrollFactor(0.7);
    this.layer5 = this.add
      .tileSprite(0, 0, worldWidth, height, "layer5")
      .setOrigin(0)
      .setScrollFactor(1.0);

    // **Configuração do Tilemap**
    const tileset = map.addTilesetImage("tiles", "tileset"); // Associa o tileset principal
    const tileset2 = map.addTilesetImage("tileset-2", "tileset-2"); // Associa o tileset secundário
    this.layerGround = map.createLayer("ground", tileset, 0, 0); // Camada de chão com colisão
    this.layerGround.setCollisionByProperty({ collide: true }); // Define colisão com base na propriedade "collide"
    this.layerEscadas = map.createLayer("escadas", tileset, 0, 0); // Camada de escadas
    map.createLayer("objetos", tileset, 0, 0); // Camada de objetos decorativos
    this.layerGun = map.createLayer("arma", tileset2, 0, 0); // Camada da arma coletável
    this.layerShield = map.createLayer("escudo", tileset2, 0, 0); // Camada do escudo coletável
    this.layerWin = map.createLayer("win", tileset2, 0, 0); // Camada de vitória

    // **Jogador**
    this.player = this.physics.add.sprite(100, 300, "idle"); // Cria o sprite do jogador
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight); // Define os limites do mundo
    this.player.setCollideWorldBounds(true); // Impede que o jogador saia do mundo
    this.player.setGravityY(1100); // Aplica gravidade ao jogador
    this.player.body.setSize(36, 36).setOffset(8, 2); // Ajusta o corpo de colisão

    // **Inimigos**
    this.enemies = this.physics.add.group({ immovable: true }); // Grupo de inimigos
    const enemyPositions = [
      { x: 1050, y: 100 },
      { x: 1200, y: 100 },
      { x: 1350, y: 100 },
      { x: 1500, y: 100 },
      { x: 1809, y: 300 },
      { x: 2300, y: 300 },
    ];
    enemyPositions.forEach((pos) => {
      let enemy = this.enemies.create(pos.x, pos.y, "enemy-idle").setScale(2); // Cria um inimigo
      enemy.body.setSize(20, 32).setOffset(7, 0); // Ajusta o corpo de colisão
      enemy.setCollideWorldBounds(true); // Impede que o inimigo saia do mundo
      enemy.setGravityY(1100); // Aplica gravidade
      enemy.health = 100; // Define a vida do inimigo
      enemy.anims.play("enemy-idle", true); // Inicia a animação de idle
      this.physics.add.collider(enemy, this.layerGround); // Adiciona colisão com o chão
    });

    // **Projéteis**
    this.projectiles = this.physics.add.group(); // Grupo de projéteis do jogador
    this.enemyProjectiles = this.physics.add.group(); // Grupo de projéteis dos inimigos
    this.physics.add.collider(
      this.enemyProjectiles,
      this.layerGround,
      (projectile) => projectile.destroy()
    ); // Destroi projéteis dos inimigos ao colidir com o chão
    this.physics.add.overlap(
      this.projectiles,
      this.enemies,
      this.handlePlayerBulletEnemyCollision,
      null,
      this
    ); // Colisão entre projéteis do jogador e inimigos
    this.physics.add.overlap(
      this.player,
      this.enemyProjectiles,
      this.handleEnemyBulletPlayerCollision,
      null,
      this
    ); // Colisão entre projéteis dos inimigos e jogador

    // **Animações do Jogador**
    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("run", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1, // Repete indefinidamente
    });
    this.anims.create({
      key: "shoot",
      frames: this.anims.generateFrameNumbers("shoot", { start: 0, end: 6 }),
      frameRate: 20,
      repeat: 0, // Executa uma vez
    });

    // **Animações dos Inimigos**
    this.anims.create({
      key: "enemy-idle",
      frames: this.anims.generateFrameNumbers("enemy-idle", {
        start: 0,
        end: 0,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "enemy-shoot",
      frames: this.anims.generateFrameNumbers("enemy-shoot", {
        start: 0,
        end: 3,
      }),
      frameRate: 20,
      repeat: 0,
    });
    this.anims.on("animationstart", (anim, frame, gameObject) => {
      if (anim.key === "enemy-shoot" && gameObject.health) {
        gameObject.body.setSize(20, 32).setOffset(7, 0); // Ajusta colisão durante animação
      }
    });
    this.anims.on("animationcomplete", (anim, frame, gameObject) => {
      if (anim.key === "enemy-shoot" && gameObject.health) {
        gameObject.body.setSize(20, 32).setOffset(7, 0); // Restaura colisão após animação
      }
    });

    // **Escudo**
    this.shield = this.add
      .sprite(this.player.x, this.player.y, "shield")
      .setVisible(false) // Inicialmente invisível
      .setDepth(10); // Define a profundidade para ficar acima de outros elementos

    // **Colisões e Câmera**
    this.groundCollider = this.physics.add.collider(
      this.player,
      this.layerGround
    ); // Colisão entre jogador e chão
    this.cameras.main.startFollow(this.player); // Câmera segue o jogador
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight); // Limites da câmera
    this.cameras.main.setZoom(1.2); // Zoom da câmera

    // **Controles**
    this.cursors = this.input.keyboard.createCursorKeys(); // Teclas de direção
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    ); // Tecla de tiro
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S); // Tecla do escudo

    // **Evento de Tiro dos Inimigos**
    this.time.addEvent({
      delay: 2000, // A cada 2 segundos
      callback: this.enemyShoot,
      callbackScope: this,
      loop: true, // Repete indefinidamente
    });
  }

  // --- Atualização da Lógica do Jogo ---
  /**
   * Atualiza o estado do jogo a cada frame, controlando movimento, interações e eventos.
   */
  update() {
    const speed = 160; // Velocidade de movimento do jogador
    let climbing = false; // Indica se o jogador está escalando

    // **Atualização do Parallax**
    this.layer1.tilePositionX = this.cameras.main.scrollX * 0.05;
    this.layer2.tilePositionX = this.cameras.main.scrollX * 0.1;
    this.layer3.tilePositionX = this.cameras.main.scrollX * 0.15;
    this.layer4.tilePositionX = this.cameras.main.scrollX * 0.2;
    this.layer5.tilePositionX = this.cameras.main.scrollX * 0.25;

    // **Movimento do Jogador**
    if (!this.isAnimating) {
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-speed); // Move para a esquerda
        this.player.anims.play("run", true); // Toca animação de corrida
        this.player.setFlipX(true); // Espelha o sprite
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(speed); // Move para a direita
        this.player.anims.play("run", true);
        this.player.setFlipX(false);
      } else {
        this.player.setVelocityX(0); // Para o movimento horizontal
        this.player.anims.stop(); // Para a animação
        this.player.setTexture("idle"); // Define a textura de repouso
      }
    }

    // **Tiro do Jogador**
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (
        this.player.body.velocity.x === 0 && // Só atira se estiver parado
        !this.isAnimating &&
        !this.shieldActive &&
        this.hasGun
      ) {
        this.isAnimating = true;
        this.shoot(); // Executa o método de tiro
      }
    }

    // **Controle do Escudo**
    if (this.keyS.isDown) {
      if (
        this.player.body.velocity.x === 0 &&
        !this.isAnimating &&
        !this.shieldActive &&
        this.hasShield
      ) {
        this.activateShield(); // Ativa o escudo
      }
    } else if (this.shieldActive) {
      this.deactivateShield(); // Desativa o escudo quando a tecla é solta
    }
    this.shield.setPosition(this.player.x, this.player.y); // Escudo segue o jogador
    if (this.shieldActive) this.shield.setFlipX(this.player.flipX); // Espelha o escudo conforme o jogador

    // **Escadas**
    const ladderTile = this.layerEscadas.getTileAtWorldXY(
      this.player.x,
      this.player.y
    );
    if (ladderTile && !this.isAnimating) {
      if (this.cursors.up.isDown || this.cursors.down.isDown) {
        climbing = true;
        this.player.setVelocityY(this.cursors.up.isDown ? -speed : speed); // Move para cima ou baixo
        this.player.body.allowGravity = false; // Desativa gravidade
        this.groundCollider.active = false; // Desativa colisão com o chão
      }
    }

    // **Gravidade e Salto**
    if (!climbing && !this.isAnimating) {
      this.player.body.allowGravity = true; // Reativa gravidade
      this.groundCollider.active = true; // Reativa colisão com o chão
      if (this.cursors.up.isDown && this.player.body.blocked.down) {
        this.player.setVelocityY(-330); // Executa o salto
      }
    }

    // **Coleta de Itens**
    if (!this.hasGun) {
      const tileGun = this.layerGun.getTileAtWorldXY(
        this.player.x,
        this.player.y
      );
      if (tileGun && tileGun.properties.coletavel)
        this.coletarArma(this.player, tileGun);
    }
    if (!this.hasShield) {
      const tileShield = this.layerShield.getTileAtWorldXY(
        this.player.x,
        this.player.y
      );
      if (tileShield && tileShield.properties.coletavel)
        this.coletarEscudo(this.player, tileShield);
    }

    // **Condição de Vitória**
    const winTile = this.layerWin.getTileAtWorldXY(
      this.player.x,
      this.player.y
    );
    if (winTile) this.goToVictoryScene();

    // **Condição de Derrota (queda)**
    if (this.player.y > 420) {
      this.hasGun = false;
      this.hasShield = false;
      this.playerHealth = 100;
      this.maxHealth = 100;
      this.scene.restart(); // Reinicia a cena
      setTimeout(() => {
        showControlsPopup(this, "Você perdeu. \nReiniciando jogo");
      }, 100);
    }
  }

  // --- Métodos Auxiliares ---
  /**
   * Transição para a cena de vitória com fade out.
   */
  goToVictoryScene() {
    this.cameras.main.fadeOut(500, 0, 0, 0); // Fade out em 500ms
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("victoryScene"); // Inicia a cena de vitória
    });
  }

  /**
   * Coleta a arma e exibe instruções.
   * @param {Phaser.GameObjects.Sprite} player - O sprite do jogador.
   * @param {Phaser.Tilemaps.Tile} tile - O tile da arma.
   */
  coletarArma(player, tile) {
    if (tile.properties.coletavel) {
      this.layerGun.removeTileAt(tile.x, tile.y); // Remove o tile da arma
      this.hasGun = true; // Ativa a posse da arma
      showControlsPopup(
        this,
        "Você pegou a ARMA!\nControles: \n- Espaço: Atirar"
      );
    }
  }

  /**
   * Coleta o escudo e exibe instruções.
   * @param {Phaser.GameObjects.Sprite} player - O sprite do jogador.
   * @param {Phaser.Tilemaps.Tile} tile - O tile do escudo.
   */
  coletarEscudo(player, tile) {
    if (tile.properties.coletavel) {
      this.layerShield.removeTileAt(tile.x, tile.y); // Remove o tile do escudo
      this.hasShield = true; // Ativa a posse do escudo
      showControlsPopup(this, "Você pegou o ESCUDO!\nControles: \n- S: Escudo");
    }
  }

  /**
   * Faz o jogador atirar um projétil.
   */
  shoot() {
    this.player.anims.play("shoot", true); // Toca a animação de tiro
    const direction = this.player.flipX ? -1 : 1; // Define a direção do tiro
    const offsetX = this.player.flipX ? -10 : 10; // Ajusta a posição do projétil
    const projectile = this.projectiles.create(
      this.player.x + offsetX,
      this.player.y - 10,
      "bullet"
    );
    projectile.setSize(10, 10).setOffset(5, 5); // Ajusta o corpo de colisão
    projectile.setVelocityX(800 * direction); // Define a velocidade horizontal
    projectile.setGravityY(70); // Adiciona gravidade leve
    projectile.setFlipX(this.player.flipX); // Espelha o projétil
    this.player.once("animationcomplete", () => {
      this.player.setTexture("idle"); // Retorna ao estado de repouso
      this.isAnimating = false; // Libera para novas ações
    });
  }

  /**
   * Faz os inimigos atirarem projéteis em direção ao jogador.
   */
  enemyShoot() {
    this.enemies.children.iterate((enemy) => {
      if (!enemy.active) return; // Ignora inimigos inativos
      const distance = Phaser.Math.Distance.Between(
        enemy.x,
        enemy.y,
        this.player.x,
        this.player.y
      );
      if (distance > 300) return; // Só atira se o jogador estiver a menos de 300 pixels

      enemy.setFlipX(this.player.x < enemy.x); // Ajusta a direção do inimigo
      enemy.anims.play("enemy-shoot", true); // Toca a animação de tiro

      const offsetX = enemy.flipX ? -20 : 20; // Ajusta a posição do projétil
      const angle = Phaser.Math.Angle.Between(
        enemy.x,
        enemy.y,
        this.player.x,
        this.player.y
      );

      this.time.delayedCall(200, () => {
        if (enemy.active) {
          const enemyProjectile = this.enemyProjectiles.create(
            enemy.x + offsetX,
            enemy.y - 10,
            "bullet"
          );
          const speed = 300;
          enemyProjectile.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
          ); // Direciona ao jogador
          enemyProjectile.setGravityY(70); // Adiciona gravidade leve
          enemyProjectile.setFlipX(enemy.flipX); // Espelha o projétil
        }
      });

      enemy.once("animationcomplete", () => {
        enemy.anims.play("enemy-idle", true); // Retorna ao estado de repouso
      });
    });
  }

  /**
   * Trata a colisão entre projétil do jogador e inimigo.
   * @param {Phaser.GameObjects.Sprite} projectile - Projétil do jogador.
   * @param {Phaser.GameObjects.Sprite} enemy - Inimigo atingido.
   */
  handlePlayerBulletEnemyCollision(projectile, enemy) {
    projectile.destroy(); // Remove o projétil
    enemy.health -= 100; // Reduz a vida do inimigo
    if (enemy.health <= 0) enemy.destroy(); // Destroi o inimigo se a vida zerar
  }

  /**
   * Trata a colisão entre projétil do inimigo e jogador.
   * @param {Phaser.GameObjects.Sprite} player - O jogador.
   * @param {Phaser.GameObjects.Sprite} projectile - Projétil do inimigo.
   */
  handleEnemyBulletPlayerCollision(player, projectile) {
    projectile.destroy(); // Remove o projétil
    if (!this.shieldActive) {
      // Só causa dano se o escudo estiver inativo
      this.playerHealth -= 25; // Reduz a vida do jogador
      if (this.playerHealth <= 0) {
        // Verifica se o jogador morreu
        this.hasGun = false;
        this.hasShield = false;
        this.playerHealth = 100;
        this.maxHealth = 100;
        this.scene.restart(); // Reinicia a cena
        setTimeout(() => {
          showControlsPopup(this, "Você perdeu. \nReiniciando jogo");
        }, 100);
      }
    }
  }

  /**
   * Ativa o escudo do jogador.
   */
  activateShield() {
    if (this.hasShield) {
      this.shieldActive = true;
      this.isAnimating = true;
      this.shield.setVisible(true).setFlipX(this.player.flipX); // Mostra e espelha o escudo
      this.player.setTint(0x00ffff); // Aplica um efeito visual ao jogador
    }
  }

  /**
   * Desativa o escudo do jogador.
   */
  deactivateShield() {
    this.shieldActive = false;
    this.isAnimating = false;
    this.shield.setVisible(false); // Esconde o escudo
    this.player.clearTint(); // Remove o efeito visual
  }
}
