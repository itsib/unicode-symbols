const { createConverter } = require('convert-svg-to-png');
const fs = require('fs/promises');
const path = require('path');
const { optimize, render } = require('svgo');

const COLOR = 'rgba(255, 255, 255, 0.7)';

const INPUT_DIR = path.resolve(__dirname, '../assets/svg');
const OUTPUT_SVG_DIR = path.resolve(__dirname, '../assets/_svg');
const OUTPUT_PNG_DIR = path.resolve(__dirname, '../assets/icons');

async function generateIcons() {
  const inputFiles = await fs.readdir(INPUT_DIR);
  const converter = createConverter({ outputFilePath: OUTPUT_PNG_DIR });

  await fs.rm(OUTPUT_SVG_DIR, { recursive: true, force: true });
  await fs.mkdir(OUTPUT_SVG_DIR);

  try {
    for (let i = 0; i < inputFiles.length; i++) {
      const file = inputFiles[i];
      if (!file.endsWith('.svg')) {
        continue;
      }

      const svgFile = await fs.readFile(path.resolve(INPUT_DIR, file), 'utf8');
      const { data: svgContent } = optimize(svgFile, {
        js2svg: {
          indent: 4,
          pretty: true,
        },
        plugins: [
          'preset-default',
          {
            name: 'convertPathData',
            params: {
              applyTransforms: true,
              applyTransformsStroked: true,
              convertToQ: true,
            },
          },
          getSvgoPlugin(file),
        ],
      });

      const svgOutput = path.resolve(OUTPUT_SVG_DIR, file);
      await fs.writeFile(svgOutput, svgContent, 'utf8');

      const pngOutput = path.resolve(OUTPUT_PNG_DIR, file.replace('.svg', '.png'));
      await converter.convertFile(svgOutput, {
        height: 20,
        width: 20,
        outputFilePath: pngOutput,
      });

      console.log(`\x1b[32m✔ Generated PNG file: ${pngOutput}\x1b[0m`)
    }
  } finally {
    await converter.destroy();
  }
}

/**
 * Returns plugin to fix colors
 * @param {string} fileName
 * @returns {Plugin}
 */
function getSvgoPlugin(fileName) {
  return {
    name: 'replaceFill',
    description: 'Colors replacer',
    fn: () => ({
      element: {
        enter: (node, parentNode) => {
          if (node.attributes.fill === 'currentColor') {
            node.attributes.fill = COLOR;
            return;
          }
          if (node.attributes.stroke === 'currentColor') {
            node.attributes.stroke = COLOR;
            return;
          }

          if (node.attributes.fill == null) {
            return;
          }
          node.attributes.fill = COLOR;
        },
      }
    }),
  }
}

generateIcons().catch(console.error)