import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron';
import path from 'path';
import { createMenu } from './utils/app-menu';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from './constants';
import { copyText, createContextmenu } from './utils/context-menu';
import { dbInitialisation } from './utils/db-initialisation';

if (require('electron-squirrel-startup')) {
  app.quit();
}

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'app.asar', '.vite/renderer', VITE_MAIN_WINDOW_NAME, 'assets')
  : path.join(__dirname, '../../src/assets');

function createWindow() {
  const window = new BrowserWindow({
    show: false,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    icon: path.join(RESOURCES_PATH, '/brand/96x96.png'),
    webPreferences: {
      sandbox: true,
      devTools: true,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
    },
  });

  window.setMinimumSize(WINDOW_WIDTH, WINDOW_HEIGHT);
  window.setMenuBarVisibility(true);
  window.maximize();

  // and load the index.html of the app.
  if (VITE_MAIN_WINDOW_SERVER_PORT) {
    window.loadURL(`http://localhost:${VITE_MAIN_WINDOW_SERVER_PORT}`).catch(console.error);
  } else {
    window.loadFile(path.join(__dirname, `../renderer/${VITE_MAIN_WINDOW_NAME}/index.html`)).catch(console.error);
  }

  createMenu(window);

  window.once('ready-to-show', () => {
    window.show();
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady()
  .then(() => {
    ipcMain.on('copy-text', (_: IpcMainEvent, text: string) => copyText(text));

    ipcMain.on('show-context-menu', (event: IpcMainEvent, meta?: any) => createContextmenu(event, meta));

    ipcMain.on('db-init', (event: IpcMainEvent) => {
      let filesDir: string;
      if (app.isPackaged) {
        filesDir = path.join(process.resourcesPath, 'app.asar/.vite/renderer', VITE_MAIN_WINDOW_NAME, 'assets');
      } else {
        filesDir = path.join(__dirname, '../../src/assets/data');
      }

      return dbInitialisation(event, filesDir);
    });

    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  })
  .catch(console.log);



