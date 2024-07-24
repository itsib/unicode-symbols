import { builtinModules } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';

export interface IAppPackageInfo {
  version: string;
  idbName: string;
  idbVersion: number;
  packages: string[];
}

export async function getAppPackageInfo(): Promise<IAppPackageInfo> {
  const pkg = await fs.readFile(path.resolve(process.cwd(), 'package.json'), 'utf8');
  const { version, config, dependencies } = JSON.parse(pkg);

  const builtins = ['electron', ...builtinModules.map((m) => [m, `node:${m}`]).flat()];
  const packages = [...builtins, ...Object.keys(dependencies || {})];

  return {
    version,
    idbName: config.idbName,
    idbVersion: config.idbVersion,
    packages,
  }
}