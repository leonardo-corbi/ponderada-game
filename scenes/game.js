import { showControlsPopup } from "../assets/components/popup.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "gameScene" });
    // Indicadores de aquisição de itens
    this.hasGun = false;
    this.hasShield = false;
    this.playerHealth = 100; // Vida inicial do jogador
    this.maxHealth = 100; // Vida máxima
  }

  preload() {
    // ==================================================
    // CARREGAMENTO DE ASSETS
    // ==================================================

    // BACKGROUNDS
    this.load.image("layer1", "assets/background/layer1.png");
    this.load.image("layer2", "assets/background/layer2.png");
    this.load.image("layer3", "assets/background/layer3.png");
    this.load.image("layer4", "assets/background/layer4.png");
    this.load.image("layer5", "assets/background/layer5.png");

    // TILEMAP E TILESET
    this.load.image("tileset", "assets/map/tileset.png");
    this.load.image("tileset-2", "assets/map/tileset-2.png");
    this.load.tilemapTiledJSON("map", "assets/map/map.tmj");

    // PLAYER E ITENS
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
    this.load.image("bullet", "assets/bullet.png");

    // INIMIGO
    this.load.spritesheet("enemy-idle", "assets/enemy/idle.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("enemy-shoot", "assets/enemy/shoot.png", {
      frameWidth: 32,
      frameHeight: 28,
    });
  }

  create() {
    // ==================================================
    // CONFIGURAÇÃO INICIAL
    // ==================================================
    const { width, height } = this.sys.game.canvas;
    const map = this.make.tilemap({ key: "map" });
    const worldWidth = map.widthInPixels;
    const worldHeight = map.heightInPixels;
    this.worldHeight = worldHeight;

    // ==================================================
    // CONFIGURAÇÃO DO BACKGROUND COM PARALLAX
    // ==================================================
    this.layer1 = this.add
      .tileSprite(0, 0, worldWidth, height, "layer1")
      .setOrigin(0)
      .setScrollFactor(0.1)
      .setTileScale(0.5);

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

    // ==================================================
    // CONFIGURAÇÃO DO TILEMAP E COLISÕES
    // ==================================================
    const tileset = map.addTilesetImage("tiles", "tileset");
    const tileset2 = map.addTilesetImage("tileset-2", "tileset-2");

    // Camada do chão com colisão
    this.layerGround = map.createLayer("ground", tileset, 0, 0);
    this.layerGround.setCollisionByProperty({ collide: true });

    // Outras camadas do mapa
    this.layerEscadas = map.createLayer("escadas", tileset, 0, 0);
    map.createLayer("objetos", tileset, 0, 0);
    this.layerGun = map.createLayer("arma", tileset2, 0, 0);
    this.layerShield = map.createLayer("escudo", tileset2, 0, 0);

    // ==================================================
    // CONFIGURAÇÃO DO JOGADOR
    // ==================================================
    this.player = this.physics.add.sprite(100, 300, "idle");
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(1100);
    this.player.body.setSize(36, 36).setOffset(8, 2); // Ajuste do corpo de colisão

    // ==================================================
    // CONFIGURAÇÃO DOS INIMIGOS
    // ==================================================
    this.enemies = this.physics.add.group({ immovable: true });
    const enemyPositions = [
      { x: 1050, y: 100 },
      { x: 1200, y: 100 },
      { x: 1350, y: 100 },
      { x: 1500, y: 100 },
      { x: 1809, y: 300 },
      { x: 2300, y: 300 },
    ];

    enemyPositions.forEach((pos) => {
      let enemy = this.enemies.create(pos.x, pos.y, "enemy-idle").setScale(2);
      enemy.body.setSize(20, 32).setOffset(7, 0); // Corpo ajustado para escala 2
      enemy.setCollideWorldBounds(true);
      enemy.setGravityY(1100);
      enemy.health = 100; // Vida inicial do inimigo
      this.physics.add.collider(enemy, this.layerGround);
    });

    // ==================================================
    // CONFIGURAÇÃO DOS PROJÉTEIS
    // ==================================================
    this.projectiles = this.physics.add.group(); // Projéteis do jogador
    this.enemyProjectiles = this.physics.add.group(); // Projéteis dos inimigos

    // Colisão dos projéteis inimigos com o chão
    this.physics.add.collider(
      this.enemyProjectiles,
      this.layerGround,
      (projectile) => {
        projectile.destroy();
      }
    );

    // Colisão dos projéteis do jogador com os inimigos
    this.physics.add.overlap(
      this.projectiles,
      this.enemies,
      this.handlePlayerBulletEnemyCollision,
      null,
      this
    );

    // Colisão dos projéteis inimigos com o jogador
    this.physics.add.overlap(
      this.player,
      this.enemyProjectiles,
      this.handleEnemyBulletPlayerCollision,
      null,
      this
    );

    // ==================================================
    // CONFIGURAÇÃO DAS ANIMAÇÕES
    // ==================================================
    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("run", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "shoot",
      frames: this.anims.generateFrameNumbers("shoot", { start: 0, end: 6 }),
      frameRate: 20,
      repeat: 0,
    });

    // ==================================================
    // CONFIGURAÇÃO DO ESCUDO
    // ==================================================
    this.shield = this.add
      .sprite(this.player.x, this.player.y, "shield")
      .setVisible(false)
      .setDepth(10);

    // ==================================================
    // CONFIGURAÇÃO DE COLISÕES E CÂMERA
    // ==================================================
    this.groundCollider = this.physics.add.collider(
      this.player,
      this.layerGround
    );
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setZoom(1.2);

    // ==================================================
    // CONFIGURAÇÃO DOS CONTROLES
    // ==================================================
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    // Evento periódico para tiro dos inimigos
    this.time.addEvent({
      delay: 2000,
      callback: this.enemyShoot,
      callbackScope: this,
      loop: true,
    });

    // Opcional: Habilitar debug de colisões para verificar corpos
    // this.physics.world.createDebugGraphic();
  }

  update() {
    const speed = 160;
    let climbing = false;

    console.log(this.player.y);
    console.log(this.worldHeight);

    // ==================================================
    // ATUALIZAÇÃO DO PARALLAX
    // ==================================================
    this.layer1.tilePositionX = this.cameras.main.scrollX * 0.05;
    this.layer2.tilePositionX = this.cameras.main.scrollX * 0.1;
    this.layer3.tilePositionX = this.cameras.main.scrollX * 0.15;
    this.layer4.tilePositionX = this.cameras.main.scrollX * 0.2;
    this.layer5.tilePositionX = this.cameras.main.scrollX * 0.25;

    // ==================================================
    // MOVIMENTAÇÃO DO JOGADOR
    // ==================================================
    if (!this.isAnimating) {
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-speed);
        this.player.anims.play("run", true);
        this.player.setFlipX(true);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(speed);
        this.player.anims.play("run", true);
        this.player.setFlipX(false);
      } else {
        this.player.setVelocityX(0);
        this.player.anims.stop();
        this.player.setTexture("idle");
      }
    }

    // ==================================================
    // SISTEMA DE TIRO DO JOGADOR
    // ==================================================
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (
        this.player.body.velocity.x === 0 &&
        !this.isAnimating &&
        !this.shieldActive &&
        this.hasGun
      ) {
        this.isAnimating = true;
        this.shoot();
      }
    }

    // ==================================================
    // SISTEMA DE ESCUDO
    // ==================================================
    if (this.keyS.isDown) {
      if (
        this.player.body.velocity.x === 0 &&
        !this.isAnimating &&
        !this.shieldActive &&
        this.hasShield
      ) {
        this.activateShield();
      }
    } else if (this.shieldActive) {
      this.deactivateShield();
    }

    // Atualiza a posição do escudo
    this.shield.setPosition(this.player.x, this.player.y);
    if (this.shieldActive) {
      this.shield.setFlipX(this.player.flipX);
    }

    // ==================================================
    // LÓGICA DE ESCALADA
    // ==================================================
    const ladderTile = this.layerEscadas.getTileAtWorldXY(
      this.player.x,
      this.player.y
    );
    if (ladderTile && !this.isAnimating) {
      if (this.cursors.up.isDown || this.cursors.down.isDown) {
        climbing = true;
        this.player.setVelocityY(this.cursors.up.isDown ? -speed : speed);
        this.player.body.allowGravity = false;
        this.groundCollider.active = false;
      }
    }

    // ==================================================
    // LÓGICA DE PULO
    // ==================================================
    if (!climbing && !this.isAnimating) {
      this.player.body.allowGravity = true;
      this.groundCollider.active = true;
      if (this.cursors.up.isDown && this.player.body.blocked.down) {
        this.player.setVelocityY(-330);
      }
    }

    // ==================================================
    // DETECÇÃO DE ITENS COLETÁVEIS
    // ==================================================
    if (!this.hasGun) {
      const tileGun = this.layerGun.getTileAtWorldXY(
        this.player.x,
        this.player.y
      );
      if (tileGun && tileGun.properties.coletavel) {
        this.coletarArma(this.player, tileGun);
      }
    }

    if (!this.hasShield) {
      const tileShield = this.layerShield.getTileAtWorldXY(
        this.player.x,
        this.player.y
      );
      if (tileShield && tileShield.properties.coletavel) {
        this.coletarEscudo(this.player, tileShield);
      }
    }

    if (this.player.y > 420) {
      this.hasGun = false;
      this.hasShield = false;
      this.playerHealth = 100; // Vida inicial do jogador
      this.maxHealth = 100; // Vida máxima
      this.scene.restart();
    }
  }

  // ==================================================
  // FUNÇÕES DE COLETA DE ITENS
  // ==================================================
  coletarArma(player, tile) {
    if (tile.properties.coletavel) {
      this.layerGun.removeTileAt(tile.x, tile.y);
      this.hasGun = true;
      showControlsPopup(
        this,
        "Você pegou a ARMA!\nControles: \n- Espaço: Atirar"
      );
    }
  }

  coletarEscudo(player, tile) {
    if (tile.properties.coletavel) {
      this.layerShield.removeTileAt(tile.x, tile.y);
      this.hasShield = true;
      showControlsPopup(this, "Você pegou o ESCUDO!\nControles: \n- S: Escudo");
    }
  }

  // ==================================================
  // FUNÇÃO DE TIRO DO JOGADOR
  // ==================================================
  shoot() {
    this.player.anims.play("shoot", true);
    const direction = this.player.flipX ? -1 : 1; // Direção baseada no flipX
    const offsetX = this.player.flipX ? -10 : 10; // Ajuste da posição do projétil
    const projectile = this.projectiles.create(
      this.player.x + offsetX,
      this.player.y - 10,
      "bullet"
    );
    projectile.setSize(10, 10).setOffset(5, 5); // Tamanho do corpo de colisão
    projectile.setVelocityX(800 * direction); // Velocidade na direção correta
    projectile.setGravityY(70);
    projectile.setFlipX(this.player.flipX);

    // Reseta a animação após completar
    this.player.once("animationcomplete", () => {
      this.player.setTexture("idle");
      this.isAnimating = false;
    });
  }

  // ==================================================
  // FUNÇÃO DE TIRO DOS INIMIGOS
  // ==================================================
  enemyShoot() {
    this.enemies.children.iterate((enemy) => {
      if (!enemy.active) return;
      const distance = Phaser.Math.Distance.Between(
        enemy.x,
        enemy.y,
        this.player.x,
        this.player.y
      );
      if (distance > 300) return; // Só atira se o jogador estiver a menos de 300px

      enemy.anims.play("enemy-shoot", true);
      const offsetX = enemy.flipX ? -20 : 20;
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
          );
          enemyProjectile.setGravityY(70);
          enemyProjectile.setFlipX(enemy.flipX);
        }
      });
    });
  }

  // ==================================================
  // COLISÃO: PROJÉTIL DO JOGADOR COM INIMIGO
  // ==================================================
  handlePlayerBulletEnemyCollision(projectile, enemy) {
    projectile.destroy(); // Remove o projétil ao atingir
    enemy.health -= 50; // Reduz a vida do inimigo
    if (enemy.health <= 0) {
      enemy.destroy(); // Destrói o inimigo se a vida acabar
    }
  }

  // ==================================================
  // COLISÃO: PROJÉTIL DO INIMIGO COM JOGADOR
  // ==================================================
  handleEnemyBulletPlayerCollision(player, projectile) {
    projectile.destroy(); // Remove o projétil ao atingir
    if (!this.shieldActive) {
      this.playerHealth -= 25; // Reduz a vida do jogador (se não houver escudo)
      if (this.playerHealth <= 0) {
        this.hasGun = false;
        this.hasShield = false;
        this.playerHealth = 100; // Vida inicial do jogador
        this.maxHealth = 100; // Vida máxima
        this.scene.restart(); // Reinicia o jogo se a vida acabar
      }
    }
  }

  // ==================================================
  // FUNÇÕES DO ESCUDO
  // ==================================================
  activateShield() {
    if (this.hasShield) {
      this.shieldActive = true;
      this.isAnimating = true;
      this.shield.setVisible(true).setFlipX(this.player.flipX);
      this.player.setTint(0x00ffff); // Efeito visual de escudo
    }
  }

  deactivateShield() {
    this.shieldActive = false;
    this.isAnimating = false;
    this.shield.setVisible(false);
    this.player.clearTint();
  }
}
