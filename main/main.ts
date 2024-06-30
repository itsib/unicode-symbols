import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron';
import path from 'path';
import { createMenu } from './menu/app-menu';
import { ASSETS_PATH, WINDOW_HEIGHT, WINDOW_WIDTH } from './constants';
import { copyText, createContextmenu } from './menu/context-menu';


if (require('electron-squirrel-startup')) {
  app.quit();
}

const getAssetPath = (...paths: string[]): string => path.join(ASSETS_PATH, ...paths);

function createWindow() {
  const window = new BrowserWindow({
    show: false,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    icon: getAssetPath('logos/96x96.png'),
    webPreferences: {
      sandbox: true,
      preload: app.isPackaged ? path.join(__dirname, 'preload.js') : path.join(__dirname, './preload.js'),
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

  createMenu(window, getAssetPath);

  window.once('ready-to-show', () => window.show());
}

async function createConfig() {
  path.resolve(app.getPath('userData'), '')

  // console.log('Config path',  ));
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
    ipcMain.on('show-context-menu', (event: IpcMainEvent, meta?: any) => createContextmenu(event, meta, getAssetPath));

    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  })
  .catch(console.log);



