import './index';

declare global {
  interface Window {
    appAPI: AppApi;
  }

  export interface AppApi {
    INDEXED_DB_NAME: string,
    INDEXED_DB_VERSION: number,
    on<TData = void>(eventName: string, callback: (data: TData) => void): () => void;
    copyText(text: string): void;
    showContextMenu(meta?: any): void;
    getSymbolName(id: number): Promise<string>;
  }
}