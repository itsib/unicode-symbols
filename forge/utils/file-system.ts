import fs from 'node:fs/promises';

export async function ensureDirExists(path: string): Promise<void> {
  try {
    await fs.access(path, fs.constants.F_OK | fs.constants.W_OK)
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.mkdir(path, { recursive: true });
      return;
    }
    throw err
  }
}