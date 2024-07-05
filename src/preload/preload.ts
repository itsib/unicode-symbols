import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('appAPI', {
  copyText: (text: string) => ipcRenderer.send('copy-text', text),
  showContextMenu: (meta?: any) => ipcRenderer.send('show-context-menu', meta),
});

ipcRenderer.on('port',(e) => {
  e.ports[0].onmessage = (messageEvent) => {
    if (messageEvent.data.action === 'redirect') {
      location.href = `${location.origin}${location.pathname}#/${messageEvent.data.path}`;
    }
  }
});

