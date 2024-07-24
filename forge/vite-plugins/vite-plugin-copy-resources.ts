import type { Plugin, ResolvedConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

export function vitePluginCopyResources(files: string[]): Plugin {
  let config: ResolvedConfig;
  let output = false

  async function readdir(dir: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(dir, { recursive: true, encoding: 'utf8' }, (err, files) => {
        if (err) {
          return reject(err);
        }
        return resolve(files);
      });
    });
  }

  async function stat(file: string): Promise<fs.Stats> {
    return new Promise((resolve, reject) => {
      fs.stat(file, (err, stats) => {
        if (err) {
          return reject(err);
        }
        return resolve(stats);
      });
    });
  }

  async function exists(file: string): Promise<boolean> {
    return new Promise(resolve => {
      fs.access(file, fs.constants.R_OK, err => {
        if (err) {
          return resolve(false);
        }
        return resolve(true);
      });
    });
  }

  async function copy(src: string, dist: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.cp(src, dist, { force: true, recursive: false }, (err) => {
        if (err) {
          return reject(err)
        }
        resolve();
      });
    })
  }

  return {
    name: '@electron-forge/plugin-vite:copy',
    apply: 'build',
    configResolved(_config) {
      config = _config
    },
    buildEnd() {
      output = false
    },
    async writeBundle() {
      if (output) {
        return;
      }
      output = true

      const assetsPath = path.resolve(config.root, config.build.outDir, 'assets');

      for (const filePath of files) {
        const absFilePath = path.join(config.root, filePath);
        const fileStat = await stat(absFilePath);

        // If single file
        if (fileStat.isFile()) {
          const filename = path.basename(filePath);

          await copy(
            absFilePath, // Source
            path.resolve(assetsPath, filename),  // Destination
          );
        }
        // If directory
        else if (fileStat.isDirectory()) {
          const innerFiles = await readdir(absFilePath);

          for (const innerFile of innerFiles) {
            const absInnerFilePath = path.join(absFilePath, innerFile);
            const filename = path.basename(absInnerFilePath);

            await copy(
              absInnerFilePath, // Source
              path.resolve(assetsPath, filename),  // Destination
            );
          }
        }
      }
    }
  };
}