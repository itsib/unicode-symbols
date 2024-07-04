import { ResolvedForgeConfig } from '@electron-forge/shared-types';
import { generateLogo } from '../utils/generate-logo';
import { normalizeSvg } from '../utils/normalize-svg';

export interface GenerateAssetsHookConfig {
  logoSvg: string;
  assets: string;
}

export function getGenerateAssetsHook({ logoSvg, assets }: GenerateAssetsHookConfig) {
  return async function generateAssets(config: ResolvedForgeConfig) {
    const icons = new Set(config.packagerConfig?.icon ? [config.packagerConfig.icon] : []);

    for(const maker of config.makers) {
      const icon = (maker as any)?.config?.options?.icon;
      if (icon) {
        icons.add(icon);
      }
    }

    await normalizeSvg(assets);

    await generateLogo(logoSvg, Array.from(icons));
  }
}