import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

declare global {
  const VITE_APP_VERSION: string;
  const VITE_INDEXED_DB_NAME: string;
  const VITE_INDEXED_DB_VERSION: number;
}

contextBridge.exposeInMainWorld('appAPI', {
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
   * Read data file for database init
   * @param filename
   */
  fileRead(filename: string) {
    return new Promise<string>((resolve, reject) => {
      let data = ''

      const disconnect = () => {
        ipcRenderer.off('file:read:chunk', onChunk);
        ipcRenderer.off('file:read:end', onEnd);
        ipcRenderer.off('file:read:error', onError);
      }

      const onChunk = (_event: IpcRendererEvent, chunk: string) => {
        data += chunk
      }

      const onEnd = (_event: IpcRendererEvent) => {
        disconnect()
        resolve(data)
      }

      const onError = (_event: IpcRendererEvent, error: any) => {
        disconnect()
        reject(error)
      }

      ipcRenderer.on('file:read:chunk', onChunk)
      ipcRenderer.on('file:read:end', onEnd);
      ipcRenderer.on('file:read:error', onError);

      ipcRenderer.send('file:read', filename);
    })
  },
  /**
   * Add main process event listener
   * @param eventName
   * @param callback
   */
  on<TData = void>(eventName: string, callback: (data: TData) => void) {
    const listener = (_: IpcRendererEvent, ...args: [TData]) => callback(args[0]);
    ipcRenderer.on(eventName, listener);

    return () => {
      ipcRenderer.off(eventName, listener);
    };
  },
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
});
