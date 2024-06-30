import { BrowserWindow, Menu, IpcMainEvent, clipboard } from 'electron';

export function copyText(text: string) {
  clipboard.writeText(text);
  console.log(`\x1b[32m✓\x1b[0m \x1b[36mClipboard write:\x1b[0m ${text}`);
}

export function createCharacterContextmenu(_: IpcMainEvent, code: number, getPath?: (path: string) => string) {
  return Menu.buildFromTemplate([
    {
      label: 'Copy',
      icon: getPath?.('icons/copy.png'),
      click: () => copyText(String.fromCodePoint(code)),
    },
    {
      label: 'Copy for HTML',
      icon: getPath?.('icons/html.png'),
      click: () => copyText(`&#${code};`),
    },
    {
      label: 'Copy for CSS',
      icon: getPath?.('icons/css.png'),
      click: () => copyText(`\\${code.toString(16)}`),
    }
  ]);
}

export function createContextmenu(event: IpcMainEvent, meta?: any, getPath?: (path: string) => string) {
  let menu: Menu | null = null;
  if (typeof meta === 'number') {
    menu = createCharacterContextmenu(event, meta, getPath);
  }


  menu?.popup({ window: BrowserWindow.fromWebContents(event.sender)});
}