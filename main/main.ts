import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';

if (require('electron-squirrel-startup')) {
  app.quit();
}

const DEVTOOLS_WIDTH = 500;
const WINDOW_WIDTH = 900;
const WINDOW_HEIGHT = 600;

const RESOURCES_PATH = app.isPackaged ? path.join(process.resourcesPath, 'assets') : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => path.join(RESOURCES_PATH, ...paths);

function createMenu(mainWindow: BrowserWindow) {
  if (!(process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true')) {
    return;
  }

  const menu = Menu.buildFromTemplate([{
    label: 'Develop',
    submenu: [
      {
        label: 'Reload',
        icon: getAssetPath('icons/reload.png'),
        registerAccelerator: true,
        acceleratorWorksWhenHidden: true,
        accelerator: 'F5',
        click: async () => {
          mainWindow.webContents.reload();
        },
      },
      {
        label: 'Hide Menu',
        icon: getAssetPath('icons/hide-menu.png'),
        registerAccelerator: true,
        acceleratorWorksWhenHidden: true,
        accelerator: 'Ctrl+M',
        click: async () => {
          mainWindow.setMenuBarVisibility(!mainWindow.menuBarVisible);
        },
      },
      { type: 'separator' },
      {
        label: 'Dev Tools',
        icon: getAssetPath('icons/code.png'),
        registerAccelerator: true,
        acceleratorWorksWhenHidden: true,
        accelerator: 'F12',
        click: async () => {
          const [_, height] = mainWindow.getSize();

          if (mainWindow.webContents.isDevToolsOpened()) {
            mainWindow.setSize(WINDOW_WIDTH, height);
            mainWindow.webContents.closeDevTools();
          } else {
            mainWindow.setSize(WINDOW_WIDTH + DEVTOOLS_WIDTH, height);
            mainWindow.webContents.toggleDevTools();
          }
        },
      },
    ],
  }]);

  Menu.setApplicationMenu(menu);
}

function createWindow() {
  const window = new BrowserWindow({
    show: false,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    icon: getAssetPath('brand/64x64.png'),
    webPreferences: {
      preload: app.isPackaged ? path.join(__dirname, 'preload.js') : path.join(__dirname, './preload.js'),
      nodeIntegration: true,
      // contextIsolation: true,

    },
  });

  window.setMinimumSize(WINDOW_WIDTH, WINDOW_HEIGHT)

  window.setMenuBarVisibility(false);

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    window.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  createMenu(window);

  window.once('ready-to-show', () => window.show());
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady()
  .then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  })
  .catch(console.log);



