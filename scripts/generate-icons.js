const { createConverter } = require('convert-svg-to-png');
const fs = require('fs/promises');
const path = require('path');
const util = require('util');

const ICONS_DIR = path.resolve(__dirname, '../assets/icons/');

async function generateIcons() {
  const files = await fs.readdir(ICONS_DIR);
  const converter = createConverter({
    outputFilePath: ICONS_DIR,
    height: 20,
    width: 20,
  });

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.endsWith('.svg')) {
        continue;
      }

      const svgFile = path.resolve(ICONS_DIR, file);
      await converter.convertFile(svgFile, {
        height: 20,
        width: 20,
      });

    }
  } finally {
    await converter.destroy();
  }
}

generateIcons().catch(console.error)