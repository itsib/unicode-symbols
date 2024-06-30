import { BrowserWindow, Menu } from 'electron';
import { DEVTOOLS_WIDTH, WINDOW_WIDTH } from '../constants';

export function createMenu(mainWindow: BrowserWindow, getPath: (path: string) => string) {
  if (!(process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true')) {
    return;
  }

  const menu = Menu.buildFromTemplate([{
    label: 'Develop',
    submenu: [
      {
        label: 'Reload',
        icon: getPath('icons/reload.png'),
        registerAccelerator: true,
        acceleratorWorksWhenHidden: true,
        accelerator: 'F5',
        click: async () => {
          mainWindow.webContents.reload();
        },
      },
      {
        label: 'Hide Menu',
        icon: getPath('icons/hide-menu.png'),
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
        icon: getPath('icons/code.png'),
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