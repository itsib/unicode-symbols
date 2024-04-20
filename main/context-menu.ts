import { BrowserWindow, Menu, IpcMainEvent, clipboard } from 'electron';

export function copyText(text: string) {
  clipboard.writeText(text);
  console.log(`\x1b[32m✓\x1b[0m \x1b[36mClipboard write:\x1b[0m ${text}`);
}

export function createCharacterContextmenu(_: IpcMainEvent, code: number) {
  return Menu.buildFromTemplate([
    {
      label: 'Copy',
      click: () => copyText(String.fromCodePoint(code)),
    },
    {
      label: 'Copy for HTML',
      click: () => copyText(`&#${code};`),
    },
    {
      label: 'Copy for CSS',
      click: () => copyText(`\\${code.toString(16)}`),
    }
  ]);
}

export function createContextmenu(event: IpcMainEvent, meta?: any) {
  let menu: Menu | null = null;
  if (typeof meta === 'number') {
    menu = createCharacterContextmenu(event, meta);
  }


  menu?.popup({ window: BrowserWindow.fromWebContents(event.sender)});
}