import { generateLogo } from '../utils/generate-logo';
import { normalizeSvg } from '../utils/normalize-svg';

export interface GenerateAssetsHookConfig {
  logoSvg: string;
  sizes: number[];
  logosPath: string;
  assetsPath: string;
}

export function getGenerateAssetsHook({ logoSvg, sizes, logosPath, assetsPath }: GenerateAssetsHookConfig) {
  return async function generateAssets() {
    await normalizeSvg(assetsPath);

    await generateLogo(logoSvg, sizes, logosPath);
  }
}