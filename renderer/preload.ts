import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('appAPI', {
  copyText: (text: string) => ipcRenderer.send('copy-text', text),
  showContextMenu: (meta?: any) => ipcRenderer.send('show-context-menu', meta),
});
