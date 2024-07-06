import Electron, { ipcMain, IpcMainEvent, MessageChannelMain } from 'electron';
import fs from 'node:fs';
import events from 'node:events';
import * as readline from 'node:readline';
import { data } from 'autoprefixer';
import path from 'node:path';

const LINES_IN_CHUNK = 10;

type SymbolMeta = { i: number; n: string; g: number };

async function canRead(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.access(path, fs.constants.R_OK, error => (error ? reject(error) : resolve()))
  })
}

function decodeSymbol(line: string): SymbolMeta | null {
  line = line.trim();
  if (!line || line.startsWith('#')) {
    return null;
  }
  const [code, nameRaw] = line.split(';')
  const id = parseInt(code.trim(), 16);
  const name = nameRaw
    .split(/\s+/)
    .map((word: string, index: number) => {
      if (word.length === 1) {
        return word;
      }
      if (index === 1) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word.toLowerCase();
    })
    .join(' ')
    .trim();

  return { i: id, n: name, g: 0 };
}

async function handleLine(symbolNames: SymbolMeta[], port: Electron.MessagePortMain): Promise<void> {
  return new Promise(resolve => {
    ipcMain.once('read-names-next', () => resolve());

    port.postMessage({ type: 'data', data: symbolNames });
  });
}

async function sendLineByLine(filepath: string, context: string, port: Electron.MessagePortMain): Promise<void> {
  console.log('\x1b[0;37m›\x1b[0m Starting to send the file \x1b[0;33m%s\x1b[0m', path.basename(filepath));

  await canRead(filepath);

  const rl = readline.createInterface({
    input: fs.createReadStream(filepath, { encoding: 'utf8' }),
    historySize: 10,
    terminal: false,
    crlfDelay: Infinity,
  });

  let count = 0;
  const lines: string[] = [];

  const sendLines = async () => new Promise<void>(resolve => {
    if (lines.length === 0) {
      return resolve();
    }

    ipcMain.once('read-next-line', () => {
      count += lines.length;
      lines.length = 0;
      resolve();
    });

    port.postMessage({ type: 'data', context,  data: lines });
  });

  const handleLine = async (line: string) => {
    line = line.trim();
    if (!line || line.startsWith('#')) {
      return;
    }
    lines.push(line);
    if (lines.length >= LINES_IN_CHUNK) {
      await sendLines();
    }
  };

  for await (const line of rl) {
    await handleLine(line);
  }
  await sendLines();

  port.postMessage({ type: 'end', context });

  rl.close();

  console.log('\x1b[0;92m✔\x1b[0m File has been sent succefully. Total lines in %s: \x1b[0;33m%d\x1b[0m', context, count);
}

export async function readSymbolNames(event: IpcMainEvent, filesDir: string): Promise<void> {
  const { port1, port2 } = new MessageChannelMain();

  event.sender.postMessage('port', null, [port2]);

  await events.once(ipcMain, 'db-ready');

  try {
    await sendLineByLine(path.join(filesDir, 'blocks.csv'), 'blocks', port1);

    await sendLineByLine(path.join(filesDir, 'symbol-names.csv'), 'symbols', port1);

    port1.postMessage({ type: 'close' });
    port1.close();


  } catch (error) {
    port1.postMessage({ type: 'error', data: error.message });
    port1.close();
    console.error(error);
  }
}