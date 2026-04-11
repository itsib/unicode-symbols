import './index';

declare global {
  interface Window {
    appAPI: AppApi;
  }

  export interface AppApi {
    APP_VERSION: string;
    INDEXED_DB_NAME: string;
    INDEXED_DB_VERSION: number;
    on<TData = void>(eventName: string, callback: (data: TData) => void): () => void;
    copy(text: string): void;
    menu(meta?: any): void;
  }
}
