const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Função para redimensionar e recortar imagem
async function resizeImage(filePath, width, height) {
  const outputDir = 'processed'; // Diretório para imagens processadas
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const fileNameWithExtension = path.basename(filePath);
  // Montando o caminho de saída com o diretório 'processed' e o nome do arquivo original com sua extensão
  const outputPath = path.join(outputDir, fileNameWithExtension);

  await sharp(filePath)
    .resize(width, height, {
      fit: sharp.fit.cover,
      position: sharp.strategy.entropy,
    })
    .toFile(outputPath);

  return fileNameWithExtension;
}

module.exports = { resizeImage };
