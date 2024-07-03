import { BrowserWindow, Menu, MessageChannelMain, nativeImage } from 'electron';
import { DEVTOOLS_WIDTH, WINDOW_WIDTH } from '../constants';
import path from 'node:path';
import * as process from 'node:process';

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
            const channel = new MessageChannelMain()
            mainWindow.webContents.postMessage('port', null, [channel.port2])
            channel.port1.postMessage({ action: 'redirect', path: 'create' });
          },
        },
        { type: 'separator' },
        {
          label: 'Settings',
          // icon: nativeImage.createFromNamedImage('emblem-system-symbolic'),
          click: async () => {
            const channel = new MessageChannelMain()
            mainWindow.webContents.postMessage('port', null, [channel.port2])
            channel.port1.postMessage({ action: 'redirect', path: 'settings' });
          },
        },
        { type: 'separator' },
        {
          label: 'Exit',
          registerAccelerator: true,
          acceleratorWorksWhenHidden: true,
          accelerator: 'Alt+F4',
          click: async () => {
            mainWindow.destroy();
          },
        },
      ],
    },
    {
      label: 'Develop',
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
          label: 'Hide Menu',
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