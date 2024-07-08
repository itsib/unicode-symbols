import { BrowserWindow, Menu, MessageChannelMain } from 'electron';
import { DEVTOOLS_WIDTH, WINDOW_WIDTH } from '../constants';

export function createMenu(mainWindow: BrowserWindow) {
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Create',
          registerAccelerator: true,
          acceleratorWorksWhenHidden: true,
          accelerator: 'Ctrl+N',
          click: async () => {
            mainWindow.webContents.send('redirect', { path: 'create' });
          },
        },
        {
          label: 'Settings',
          click: async () => {
            mainWindow.webContents.send('redirect', { path: 'settings' });
          },
        },
        {
          label: 'Search',
          registerAccelerator: true,
          acceleratorWorksWhenHidden: true,
          accelerator: 'Ctrl+F',
          click: async () => {
            mainWindow.webContents.send('redirect', { path: 'search' });
          },
        },
        { type: 'separator' },
        {
          label: 'Delete DB',
          click: async () => {
            mainWindow.webContents.send('drop-idb');
            mainWindow.webContents.reload();
          },
        },
        { type: 'separator' },
        {
          label: 'Exit',
          registerAccelerator: true,
          acceleratorWorksWhenHidden: true,
          accelerator: 'Alt+F4',
          click: async () => {
            mainWindow.close();
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          // icon: path.resolve('src/assets/icons/reload.png'),
          registerAccelerator: true,
          acceleratorWorksWhenHidden: true,
          accelerator: 'F5',
          click: async () => {
            mainWindow.webContents.reload();
          },
        },
        {
          label: 'Hide Menu    ',
          // icon: path.resolve('src/assets/icons/hide-menu.png'),
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
          // icon: path.resolve('src/assets/icons/code.png'),
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
    }
  ]);

  Menu.setApplicationMenu(menu);
}