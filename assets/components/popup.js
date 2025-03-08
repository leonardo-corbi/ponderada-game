export function showControlsPopup(scene, message) {
  // Configurações do popup
  const margin = 10;
  const popupWidth = 230;
  const popupHeight = 150;
  // Posiciona o popup no canto superior direito
  const x = scene.cameras.main.width - 200;
  const y = margin;

  // Cria um container na posição definida
  const container = scene.add.container(x, y);

  // Fundo do popup com origem no canto superior direito (1,0)
  const background = scene.add.rectangle(
    0,
    0,
    popupWidth,
    popupHeight,
    0x000000,
    0.8
  );
  background.setOrigin(1, 0);

  // Texto com a mensagem, alinhado à direita
  const text = scene.add.text(-10, 10, message, {
    fontSize: "16px",
    fill: "#ffffff",
    align: "right",
  });
  text.setOrigin(1, 0);

  container.add(background);
  container.add(text);

  // Remove o popup após 3 segundos (3000 ms)
  scene.time.delayedCall(5000, () => {
    container.destroy();
  });
}
