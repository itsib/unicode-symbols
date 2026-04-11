import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { initDatabase } from './utils/init-database';

declare global {
  const VITE_APP_VERSION: string;
  const VITE_INDEXED_DB_NAME: string;
  const VITE_INDEXED_DB_VERSION: number;
}

let initialized = false;
contextBridge.exposeInMainWorld('appAPI', {
  /**
   * App version from package json file.
   */
  APP_VERSION: VITE_APP_VERSION,
  /**
   * IndexedDB store name
   */
  INDEXED_DB_NAME: VITE_INDEXED_DB_NAME,
  /**
   * IndexedDB model version
   */
  INDEXED_DB_VERSION: VITE_INDEXED_DB_VERSION,
  /**
   * Insert string to clip board
   * @param text
   */
  copy: (text: string) => ipcRenderer.send('copy', text),
  /**
   * Show native context menu
   * @param meta
   */
  menu: (meta?: any) => ipcRenderer.send('menu', meta),
  /**
   * Add main process event listener
   * @param eventName
   * @param callback
   */
  on<TData = void>(eventName: string, callback: (data: TData) => void) {
    const listener = (_: IpcRendererEvent, ...args: [TData]) => callback(args[0]);
    ipcRenderer.on(eventName, listener);

    if (initialized && eventName === 'ready') {
      ipcRenderer.emit('ready');
    }

    return () => {
      ipcRenderer.off(eventName, listener);
    };
  },
});

(async function init(){
  await initDatabase(VITE_INDEXED_DB_NAME, VITE_INDEXED_DB_VERSION)

  window.dispatchEvent(new CustomEvent('ready'));

  initialized = true;
  ipcRenderer.emit('ready');
})()
