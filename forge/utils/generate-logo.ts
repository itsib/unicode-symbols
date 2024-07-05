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

export async function generateLogo(logoSvgPath: string, sizes: number[], logosPath: string) {
  await ensureDirExists(logosPath);

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

  for (const size of sizes) {
    await page.$eval('svg', (node, _width, _height) => {
      node.setAttribute('width', `${_width}px`);
      node.setAttribute('height', `${_height}px`);
    }, size, size);


    await svgElement.screenshot({
      path: path.resolve(logosPath, `${size}x${size}.png`),
      type: 'png',
      omitBackground: true,
    });
  }

  await browser.close();
}