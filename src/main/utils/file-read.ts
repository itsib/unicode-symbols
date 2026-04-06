import { app, type IpcMainEvent } from 'electron';
import { createReadStream } from 'node:fs';
import { resolve, join } from 'node:path';

function getResourcesRoot() {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'app.asar/.vite/renderer', MAIN_WINDOW_VITE_NAME, 'assets');
  } else {
    return resolve(__dirname, '../../src/assets/data');
  }
}

export function fileRead(event: IpcMainEvent, filename: string) {
  const reader = createReadStream(join(getResourcesRoot(), filename), {
    encoding: 'utf8',
    highWaterMark: 64 * 1024
  })

  reader.on('data', (chunk: string) => {
    event.sender.send('file:read:chunk', chunk);
  })

  reader.on('end', () => {
    event.sender.send('file:read:end');
  })

  reader.on('error', (err: Error) => {
    event.sender.send('file:read:error', err);
  })
}
