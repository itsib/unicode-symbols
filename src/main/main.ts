import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron';
import path from 'path';
import fs from 'fs';
import { createMenu } from './menu/app-menu';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from './constants';
import { copyText, createContextmenu } from './menu/context-menu';


if (require('electron-squirrel-startup')) {
  app.quit();
}

function createWindow() {
  const window = new BrowserWindow({
    show: false,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    icon: path.join(__dirname, '..', 'src/assets/brand/96x96.png'),
    webPreferences: {
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
    },
  });

  window.setMinimumSize(WINDOW_WIDTH, WINDOW_HEIGHT);
  window.setMenuBarVisibility(true);

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL).catch(console.error);
  } else {
    window.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)).catch(console.error);
  }

  createMenu(window);

  window.once('ready-to-show', () => window.show());
}

async function createConfig() {
  const configPath = app.getPath('userData');

  fs.existsSync(path.join(configPath, 'config.json'));

  console.log('Config path',  );
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady()
  .then(() => createConfig())
  .then(() => {
    ipcMain.on('copy-text', (_: IpcMainEvent, text: string) => copyText(text));
    ipcMain.on('show-context-menu', (event: IpcMainEvent, meta?: any) => createContextmenu(event, meta));

    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  })
  .catch(console.log);



