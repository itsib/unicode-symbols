import { app, BrowserWindow, ipcMain, session } from 'electron';
import { createMenu } from './utils/app-menu';
import { onContextmenu, onCopyText } from './utils/context-menu';
import started from 'electron-squirrel-startup';
import { resolve } from 'node:path';
import { fileRead } from './utils/file-read';

export const DEVTOOLS_WIDTH = 500;
export const WINDOW_WIDTH = 900;
export const WINDOW_HEIGHT = 600;

if (started) {
  app.quit();
}

function createWindow() {
  const window = new BrowserWindow({
    show: false,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    icon: 'resources/icon.png',
    webPreferences: {
      sandbox: true,
      devTools: true,
      preload: resolve(__dirname, 'preload.js'),
      nodeIntegration: false,
    },
  });

  // window.webContents.openDevTools();
  window.setMinimumSize(WINDOW_WIDTH, WINDOW_HEIGHT);
  window.setMenuBarVisibility(true);
  window.maximize();

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL).catch(console.error);
  } else {
    window.loadFile(resolve(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)).catch(console.error);
  }

  session.defaultSession.setPermissionCheckHandler((wc, permission: string, callback) => {
    if (permission === 'local-fonts' || permission === 'background-sync') {
      return true;
    }
    return false;
  });

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

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('ready', () => {
  ipcMain.on('copy', onCopyText);
  ipcMain.on('menu', onContextmenu);
  ipcMain.on('file:read', fileRead);

  createWindow();
});



