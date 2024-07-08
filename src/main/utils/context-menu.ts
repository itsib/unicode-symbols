import { BrowserWindow, Menu, IpcMainEvent, clipboard } from 'electron';

export function copyText(text: string) {
  clipboard.writeText(text);
  console.log(`\x1b[32m✔\x1b[0m \x1b[36mClipboard write:\x1b[0m ${text}`);
}

export function createContextmenu(event: IpcMainEvent, meta?: any) {
  console.log(meta);
  const template = [];
  if (meta.code != null && typeof meta.code === 'number') {
    template.push(
      {
        label: 'Copy',
        click: () => copyText(String.fromCodePoint(meta.code)),
      },
      {
        label: 'Copy for HTML',
        click: () => copyText(`&#${meta.code};`),
      },
      {
        label: 'Copy for CSS',
        click: () => copyText(`\\${meta.code.toString(16)}`),
      }
    );
  }

  if (meta.position) {
    template.push({
      label: 'Inspect Element',
      click: () => {
        event.sender.inspectElement(meta.position.x, meta.position.y);
      },
    })
  }

  if (!template.length) {
    return;
  }

  const menu = Menu.buildFromTemplate(template);
  menu.popup({ window: BrowserWindow.fromWebContents(event.sender)});
}