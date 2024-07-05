import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { IndexedDb } from './indexed-db/indexed-db';

const dataBase = IndexedDb.get();

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

  getSymbolName: async (id: number): Promise<string> => {
    return dataBase.getSymbolName(id);
  }
});

(async function init() {
  if (await dataBase.checkInit()) {
    return;
  }

  ipcRenderer.emit('main-loading', null, { isLoading: true });

  ipcRenderer.once('port', (event, data) => {
    const port = event.ports[0] as MessagePort;
    let disabled = false;

    port.onmessageerror = (error) => {
      console.log(error);
      ipcRenderer.emit('main-loading', null, { isLoading: false });
    }

    port.onmessage = (messageEvent) => {
      const type = messageEvent.data.type;
      const data = messageEvent.data.data;

      switch (type) {
        case 'error':
          disabled = true;
          ipcRenderer.emit('main-loading', null, { isLoading: false });
          console.error(data);
          break;
        case 'close':
          disabled = true;
          ipcRenderer.emit('main-loading', null, { isLoading: false });
          break;
        case 'data':
          if (!disabled) {
            ipcRenderer.emit('main-loading', null, { isLoading: true });
            dataBase.insertNames(...data).then(() => ipcRenderer.send('read-file-next'));
          }
          break;
      }
    };
  });

  ipcRenderer.send('read-file', 'data/symbol-names.csv');
})();