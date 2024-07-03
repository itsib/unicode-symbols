import type { ForgeConfig, ResolvedForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import * as process from 'node:process';

const config: ForgeConfig = {
  packagerConfig: {
    name: 'characters',
    asar: true,
    icon: 'src/assets/brand/96x96',
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    {
      // Path to a single image that will act as icon for the application
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          name: 'Characters',
          icon: 'src/assets/brand/512x512.png',
          categories: ['Graphics', 'Utility'],
          genericName: 'Characters',
          description: 'Browse and search for non-standard characters',
        }
      }
    },
    // new MakerDeb({
    //   options: {
    //     name: 'Characters',
    //     icon: 'src/assets/brand/512x512.png',
    //     categories: ['Graphics', 'Utility'],
    //     genericName: 'Characters',
    //     description: 'Browse and search for non-standard characters',
    //   }
    // })
  ],
  plugins: [
    new VitePlugin({
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
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  hooks: {
    async generateAssets(config: ResolvedForgeConfig, platform: string, arch: string) {
      console.log(process.cwd() + '\n\n\n\n\n');
    },
  },
};

export default config;
