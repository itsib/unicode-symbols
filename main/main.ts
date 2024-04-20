import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron';
import path from 'path';
import { createMenu } from './app-menu';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from './constants';
import { copyText, createContextmenu } from './context-menu';

if (require('electron-squirrel-startup')) {
  app.quit();
}

const RESOURCES_PATH = app.isPackaged ? path.join(process.resourcesPath, 'assets') : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => path.join(RESOURCES_PATH, ...paths);

function createWindow() {
  const window = new BrowserWindow({
    show: false,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    icon: getAssetPath('brand/96x96.png'),
    webPreferences: {
      preload: app.isPackaged ? path.join(__dirname, 'preload.js') : path.join(__dirname, './preload.js'),
      nodeIntegration: true,
    },
  });

  window.setMinimumSize(WINDOW_WIDTH, WINDOW_HEIGHT)

  window.setMenuBarVisibility(false);

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL).catch(console.error);
  } else {
    window.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)).catch(console.error);
  }

  createMenu(window, getAssetPath);

  window.once('ready-to-show', () => window.show());
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady()
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



