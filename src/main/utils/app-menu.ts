import { BrowserWindow, Menu } from 'electron';

export function createMenu(mainWindow: BrowserWindow) {
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Settings',
          click: async () => {
            mainWindow.webContents.send('settings');
          },
        },
        {
          label: 'Search',
          registerAccelerator: true,
          acceleratorWorksWhenHidden: true,
          accelerator: 'Ctrl+F',
          click: async () => {
            mainWindow.webContents.send('search');
          },
        },
        { type: 'separator' },
        {
          label: 'Reload DB',
          click: async () => {
            mainWindow.webContents.send('drop-idb');
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
          registerAccelerator: true,
          acceleratorWorksWhenHidden: true,
          accelerator: 'F5',
          click: async () => {
            mainWindow.webContents.reload();
          },
        },
        {
          label: 'Hide Menu    ',
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
          registerAccelerator: true,
          acceleratorWorksWhenHidden: true,
          accelerator: 'F12',
          click: async () => {
            if (mainWindow.webContents.isDevToolsOpened()) {
              mainWindow.webContents.closeDevTools();
            } else {
              mainWindow.webContents.toggleDevTools();
            }
          },
        },
      ],
    }
  ]);

  Menu.setApplicationMenu(menu);
}