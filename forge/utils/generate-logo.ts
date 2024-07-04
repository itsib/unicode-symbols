import { ensureDirExists } from './file-system';
import fs from 'node:fs/promises';
import path from 'path';
import puppeteer from 'puppeteer-core';

const HTML = `
<html lang="en">
<head>
  <title>Image</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>@img@</body>
</html>`;

export async function generateLogo(logoSvgPath: string, dists: string[]) {
  const logoSvg = await fs.readFile(logoSvgPath, 'utf8');
  const logoHtml = HTML.replace('@img@', logoSvg);

  const browser = await puppeteer.launch({
    headless: true,
    channel: 'chrome',
  });
  const page = await browser.newPage();
  await page.setContent(logoHtml, { waitUntil: 'domcontentloaded' });
  await page.setViewport({ width: 1024, height: 1024 });

  const svgElement = await page.$('svg');

  for (const dist of dists) {
    const dirname = path.dirname(dist);
    let filename = path.basename(dist);
    filename = path.extname(filename) ? filename : `${filename}.png`;
    const result = /^(\d+)x(\d+).png/.exec(filename);
    if (!result) {
      throw new Error(`Filename error - "${dist}", Should be like: "512x512.png"`);
    }

    await ensureDirExists(dirname);

    const width = parseInt(result[1], 10);
    const height = parseInt(result[2], 10);

    await page.$eval('svg', (node, _width, _height) => {
      node.setAttribute('width', `${_width}px`);
      node.setAttribute('height', `${_height}px`);
    }, width, height);


    await svgElement.screenshot({
      path: path.resolve(dirname, filename),
      type: 'png',
      omitBackground: true,
    });
  }

  await browser.close();
}