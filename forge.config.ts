import type { ForgeConfig, ResolvedForgeConfig } from '@electron-forge/shared-types';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import * as process from 'node:process';

const config: ForgeConfig = {
  packagerConfig: {
    name: 'unicode-symbols',
    asar: true,
    icon: 'src/assets/brand/96x96',
    extraResource: 'src/assets/'
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          name: 'unicode-symbols',
          icon: 'src/assets/brand/512x512.png',
          categories: ['Graphics', 'Utility'],
          genericName: 'Unicode Symbols',
          description: 'Browse and search for non-standard unicode symbols',
        }
      }
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          {
            entry: 'src/main/main.ts',
            config: 'vite.main.config.ts',
          },
          {
            entry: 'src/renderer/preload.ts',
            config: 'vite.preload.config.ts',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.ts',
          },
        ],
      }
    },
    {
      name: '@electron-forge/plugin-fuses',
      config: {
        version: FuseVersion.V1,
        [FuseV1Options.RunAsNode]: false,
        [FuseV1Options.EnableCookieEncryption]: true,
        [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
        [FuseV1Options.EnableNodeCliInspectArguments]: false,
        [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
        [FuseV1Options.OnlyLoadAppFromAsar]: true,
      }
    },
  ],
  hooks: {
    async generateAssets(config: ResolvedForgeConfig, platform: string, arch: string) {
      // cwd = "/home/sergey/projects/characters"
      console.log(process.cwd() + '\n\n\n\n\n');
    },
  },
};

export default config;
