import fs from 'node:fs/promises'
import path from 'node:path';
import { optimize } from 'svgo';

export async function normalizeSvg(assets: string): Promise<void> {
  const allFiles = await fs.readdir(assets, { recursive: true, encoding: 'utf8' });

  const svgPaths = allFiles.filter(file => file.endsWith('.svg') && !file.includes('font') && !file.includes('fixed-'));

  for (const svgPath of svgPaths) {
    const dirname = path.resolve(assets, path.dirname(svgPath));
    const filename = path.basename(svgPath);

    const fullPath = path.resolve(dirname, filename);

    const svgRaw = await fs.readFile(fullPath, 'utf8');

    const { data } = optimize(svgRaw, {
      js2svg: {
        pretty: true,
        indent: 2,
      },
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              removeViewBox: false,
            },
          },
        },
        {
          name: "removeAttrs",
          params: {
            attrs: ['data-original'],
            elemSeparator: ":",
            preserveCurrentColor: false
          }
        },
        {
          name: 'convertPathData',
          params: {
            applyTransforms: true,
            applyTransformsStroked: true,
            convertToQ: true,
          },
        },
      ],
    });

    await fs.writeFile(path.resolve(dirname, filename), data, 'utf8');
  }
}