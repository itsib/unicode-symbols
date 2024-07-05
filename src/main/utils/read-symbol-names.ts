import Electron, { IpcMainEvent, MessageChannelMain, ipcMain } from 'electron';
import path from 'path';
import fs from 'node:fs';
import * as readline from 'node:readline';

async function fsAccess(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.access(path, fs.constants.R_OK, (error) => {
      if (error) {
        return reject(error);
      }
      return resolve();
    })
  })
}

function lineToNameObj(line: string): { id: number; name: string } | null {
  line = line.trim();
  if (!line || line.startsWith('#')) {
    return null;
  }
  const [code, nameRaw] = line.split(';')
  const id = parseInt(code.trim(), 16);
  const name = nameRaw.split(/\s+/).map((word: string, index: number) => {
    if (word.length === 1) {
      return word;
    }
    if (index === 1) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    return word.toLowerCase();
  }).join(' ')

  return { id, name };
}

async function handleLine(symbolNames: { id: number; name: string }[], port: Electron.MessagePortMain): Promise<void> {
  return new Promise((resolve, reject) => {

    ipcMain.once('read-file-next', () => resolve());

    port.postMessage({ type: 'data', data: symbolNames });
  });
}

export async function readSymbolNames(event: IpcMainEvent, file: string): Promise<void> {
  console.log('\x1b[0;92m◼\x1b[0m Updating IndexedDB from file \x1b[0;33m%s\x1b[0m', file)

  const filePath = path.join(__dirname, '../..', 'src/assets', file);

  const { port1, port2 } = new MessageChannelMain();

  event.sender.postMessage('port', null, [port2]);

  try {
    await fsAccess(filePath);

    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });

    const buffer: { id: number; name: string }[] = [];
    let count = 0;

    const handleBatch = async () => {
      await handleLine(buffer, port1);

      count += buffer.length;
      buffer.length = 0;
    };

    for await (const line of rl) {
      const symbolName = lineToNameObj(line);
      if (!symbolName) {
        continue;
      }
      buffer.push(symbolName);

      if (buffer.length >= 10) {
        await handleBatch();
      }
    }
    if (buffer.length) {
      await handleBatch();
    }

    port1.postMessage({ type: 'close' });
    port1.close();
    rl.close();

    console.log('\x1b[0;92m✔\x1b[0m Sending data to IndexedDB is completed. Total records: %d', count)
  } catch (error) {
    port1.postMessage({ type: 'error', data: error.message });
    port1.close();
    console.error(error);
  }
}