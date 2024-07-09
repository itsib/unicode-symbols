import { builtinModules } from 'node:module';
import type { AddressInfo } from 'node:net';
import type { ConfigEnv, Plugin, ResolvedConfig, UserConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import pkg from './package.json';

export const builtins = ['electron', ...builtinModules.map((m) => [m, `node:${m}`]).flat()];

export const external = [...builtins, ...Object.keys('dependencies' in pkg ? (pkg.dependencies as Record<string, unknown>) : {})];

export function getBuildConfig(env: ConfigEnv<'build'>): UserConfig {
  const { root, mode, command } = env;

  return {
    root,
    mode,
    build: {
      // target: 'esnext',
      // Prevent multiple builds from interfering with each other.
      emptyOutDir: false,
      // 🚧 Multiple builds may conflict.
      outDir: '.vite/build',
      watch: command === 'serve' ? {} : null,
      minify: command === 'build',
    },
    clearScreen: false,
  };
}

export function getDefineKeys(names: string[]) {
  const define: { [name: string]: VitePluginRuntimeKeys } = {};

  return names.reduce((acc, name) => {
    const NAME = name.toUpperCase();
    const keys: VitePluginRuntimeKeys = {
      VITE_DEV_SERVER_URL: `${NAME}_VITE_DEV_SERVER_URL`,
      VITE_NAME: `${NAME}_VITE_NAME`,
    };

    return { ...acc, [name]: keys };
  }, define);
}

export function getBuildDefine(env: ConfigEnv<'build'>) {
  const { command, forgeConfig } = env;
  const names = forgeConfig.renderer.filter(({ name }) => name != null).map(({ name }) => name!);
  const defineKeys = getDefineKeys(names);

  return Object.entries(defineKeys).reduce((acc, [name, keys]) => {
    const { VITE_DEV_SERVER_URL, VITE_NAME } = keys;

    const def = {
      [VITE_DEV_SERVER_URL]: command === 'serve' ? JSON.stringify(process.env[VITE_DEV_SERVER_URL]) : undefined,
      [VITE_NAME]: JSON.stringify(name),
    };

    return { ...acc, ...def };
  }, {} as Record<string, any>);
}

export function pluginExposeRenderer(name: string): Plugin {
  const { VITE_DEV_SERVER_URL } = getDefineKeys([name])[name];

  return {
    name: '@electron-forge/plugin-vite:expose-renderer',
    configureServer(server) {
      process.viteDevServers ??= {};
      // Expose server for preload scripts hot reload.
      process.viteDevServers[name] = server;

      server.httpServer?.once('listening', () => {
        const addressInfo = server.httpServer!.address() as AddressInfo;
        // Expose env constant for main process use.
        process.env[VITE_DEV_SERVER_URL] = `http://localhost:${addressInfo?.port}`;
      });
    },
  };
}

export function pluginHotRestart(command: 'reload' | 'restart'): Plugin {
  return {
    name: '@electron-forge/plugin-vite:hot-restart',
    closeBundle() {
      if (command === 'reload') {
        for (const server of Object.values(process.viteDevServers)) {

          const ws = server.hot.channels.find(({ name }) => name === 'ws');
          if (ws) {
            ws.send({ type: 'full-reload' });
          }
        }
      } else {
        process.stdin.emit('data', 'rs');
      }
    },
  };
}

export function pluginAttachToAssets(files: string[]): Plugin {
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
