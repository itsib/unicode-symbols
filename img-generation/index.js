const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { optimize, render } = require('svgo');

const SIZES = [16, 24, 32, 48, 64, 96, 128, 256, 512, 768, 1024];
const ICON_SIZE = 20;
const ICON_COLOR = 'rgba(255, 255, 255, 1)';
const LOGO_SVG = path.resolve(__dirname, 'logo.svg');
const ICONS_SVG = path.resolve(__dirname, 'svg');
const LOGOS_DIR = path.resolve(__dirname, '../src/assets/brand/');
const ICONS_DIR = path.resolve(__dirname, '../src/assets/icons/');

const VIEWPORT = '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
const TITLE = '<title>Image</title>';
const HTML = `<html lang="en"><head>${VIEWPORT}${TITLE}</head><body>@img@</body></html>`;

if (!fs.existsSync(LOGO_SVG)) {
  throw new Error('No logo found');
}

function getSvgoPlugin() {
  return {
    name: 'replaceFill',
    description: 'Colors replacer',
    fn: () => ({
      element: {
        enter: (node, parentNode) => {
          if (node.attributes.fill === 'currentColor') {
            node.attributes.fill = ICON_COLOR;
            return;
          }
          if (node.attributes.stroke === 'currentColor') {
            node.attributes.stroke = ICON_COLOR;
            return;
          }

          if (node.attributes.fill == null) {
            return;
          }
          node.attributes.fill = ICON_COLOR;
        },
      }
    }),
  }
}

async function genLogos(page) {
  if (!fs.existsSync(LOGOS_DIR)) {
    fs.mkdirSync(LOGOS_DIR);
  }

  console.log(`\x1b[0;93m  Generate App Logos\x1b[0m`);

  const logoHtml = fs.readFileSync(LOGO_SVG, 'utf8');

  await page.setContent(HTML.replace('@img@', logoHtml), {
    waitUntil: 'domcontentloaded',
  });
  await page.setViewport({ width: 1024, height: 1024 });

  const svgElement = await page.$('svg');

  for (let size of SIZES) {
    const filename = `${size}x${size}.png`;

    await page.$eval('svg', (node, _size) => {
      node.setAttribute('width', `${_size}px`);
      node.setAttribute('height', `${_size}px`);
    }, size);

    await svgElement.screenshot({
      path: path.resolve(LOGOS_DIR, filename),
      type: 'png',
      omitBackground: true,
    });

    console.log(`\x1b[2;37m  Logo created › ${filename}\x1b[0m`);
  }
}

async function genIcons(page) {
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR);
  }

  console.log(`\x1b[0;93m  Generate Interface Icons\x1b[0m`);

  const iconsDirContent = fs.readdirSync(ICONS_SVG);

  for (let svgIconName of iconsDirContent) {
    if (!svgIconName.endsWith('.svg')) {
      continue;
    }
    const pngIconName = svgIconName.replace('.svg', '.png');
    const svgIconHtmlSrc = fs.readFileSync(path.resolve(ICONS_SVG, svgIconName), 'utf8');

    const { data: svgIconHtml } = optimize(svgIconHtmlSrc, {
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
        getSvgoPlugin(),
      ],
    })

    await page.setContent(HTML.replace('@img@', svgIconHtml), {
      waitUntil: 'domcontentloaded',
    });
    await page.setViewport({ width: 1024, height: 1024 });

    const svgElement = await page.$('svg');

    await page.$eval('svg', (node, _size) => {
      node.setAttribute('width', `${_size}px`);
      node.setAttribute('height', `${_size}px`);
    }, ICON_SIZE);

    await svgElement.screenshot({
      path: path.resolve(ICONS_DIR, pngIconName),
      type: 'png',
      omitBackground: true,
    });

    console.log(`\x1b[2;37m  Icon created › ${pngIconName}\x1b[0m`);
  }


}

async function start() {
  const browser = await puppeteer.launch({
    headless: true,
    channel: 'chrome',
  });

  const page = await browser.newPage();

  await genLogos(page);
  await genIcons(page);

  console.log(`\x1b[1;92m✔ Done\x1b[0m`);

  await browser.close();
}

start().catch(error => {
  console.error(error);
  process.exit(1);
});
