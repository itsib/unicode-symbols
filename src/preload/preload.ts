import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { IndexedDb } from './indexed-db/indexed-db';

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
  copyText: (text: string) => ipcRenderer.send('copy-text', text),
  /**
   * Show native context menu
   * @param meta
   */
  showContextMenu: (meta?: any) => ipcRenderer.send('show-context-menu', meta),
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

(async function init() {
  const dataBase = IndexedDb.get(VITE_INDEXED_DB_NAME, VITE_INDEXED_DB_VERSION);
  if (await dataBase.checkInit()) {
    await dataBase.close();
    return;
  }

  ipcRenderer.emit('db-state', null, { state: 'init-start' });

  ipcRenderer.once('port', event => {
    const port = event.ports[0] as MessagePort;
    let disabled = false;
    let lastContext: string = null;

    port.onmessageerror = (error) => {
      console.log(error);
      ipcRenderer.emit('db-state', null, { state: 'init-error', data: error });
    }

    port.onmessage = (messageEvent) => {
      const type = messageEvent.data.type;
      const context = messageEvent.data.context;
      const data = messageEvent.data.data;

      switch (type) {
        case 'error':
          disabled = true;
          dataBase.close();
          ipcRenderer.emit('db-state', null, { state: 'init-error', data });
          console.error(data);
          break;
        case 'close':
          disabled = true;
          dataBase.close();
          ipcRenderer.emit('db-state', null, { state: 'init-complete' });
          break;
        case 'data':
          if (!disabled) {
            if (!lastContext || context !== lastContext) {
              ipcRenderer.emit('db-state', null, { state: 'init-process', data: context });
              lastContext = context;
            }

            dataBase.parseAndSave(context, data).then(() => ipcRenderer.send('read-next-line'));
          }
          break;
      }
    };

    ipcRenderer.send('db-ready-transmit');
  });

  ipcRenderer.send('db-init');
})();