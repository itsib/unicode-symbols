import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { IndexedDb } from './indexed-db/indexed-db';

const INDEXED_DB_CONFIG = {
  name: 'UnicodeSymbols',
  version: 2,
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
   * IndexedDB configuration
   */
  INDEXED_DB_CONFIG,
});

(async function init() {
  const dataBase = IndexedDb.get(INDEXED_DB_CONFIG.name, INDEXED_DB_CONFIG.version);
  if (await dataBase.checkInit()) {
    await dataBase.close();
    return;
  }

  ipcRenderer.emit('main-loading', null, { isLoading: true });

  ipcRenderer.once('port', event => {
    const port = event.ports[0] as MessagePort;
    let disabled = false;

    port.onmessageerror = (error) => {
      console.log(error);
      ipcRenderer.emit('main-loading', null, { isLoading: false });
    }

    port.onmessage = (messageEvent) => {
      const type = messageEvent.data.type;
      const context = messageEvent.data.context;
      const data = messageEvent.data.data;

      switch (type) {
        case 'error':
          disabled = true;
          dataBase.close();
          ipcRenderer.emit('main-loading', null, { isLoading: false });
          console.error(data);
          break;
        case 'close':
          disabled = true;
          dataBase.close();
          ipcRenderer.emit('main-loading', null, { isLoading: false });
          break;
        case 'data':
          if (!disabled) {
            ipcRenderer.emit('main-loading', null, { isLoading: true });

            dataBase.parseAndSave(context, data).then(() => ipcRenderer.send('read-next-line'));
          }
          break;
      }
    };

    ipcRenderer.send('db-ready-transmit');
  });

  ipcRenderer.send('db-init');
})();