import Electron, { ipcMain, IpcMainEvent, MessageChannelMain } from 'electron';
import fs from 'node:fs';
import events from 'node:events';
import * as readline from 'node:readline';
import path from 'node:path';

interface SendOptions {
  context: string;
  skipComments?: boolean;
  port: Electron.MessagePortMain;
}

const LINES_IN_CHUNK = 10;

async function canRead(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.access(path, fs.constants.R_OK, error => (error ? reject(error) : resolve()))
  })
}

async function sendLineByLine(filepath: string, opts: SendOptions): Promise<void> {
  const { context, port, skipComments = true } = opts

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
    if (!line || (skipComments && line.startsWith('#'))) {
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

export async function dbInitialisation(event: IpcMainEvent, filesDir: string): Promise<void> {
  const { port1, port2 } = new MessageChannelMain();

  event.sender.postMessage('port', null, [port2]);

  await events.once(ipcMain, 'db-ready-transmit');

  try {
    await sendLineByLine(path.join(filesDir, 'planes.csv'), { context: 'planes', port: port1 });

    await sendLineByLine(path.join(filesDir, 'blocks.csv'), { context: 'blocks', port: port1 });

    await sendLineByLine(path.join(filesDir, 'symbol-names.csv'), { context: 'symbols', port: port1 });

    port1.postMessage({ type: 'close' });
    port1.close();
  } catch (error) {
    port1.postMessage({ type: 'error', data: error.message });
    port1.close();
    console.error(error);
  }
}