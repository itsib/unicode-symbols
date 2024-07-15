import { createContext } from 'react';

export enum IndexedDbStore {
  Planes = 'planes',
  Blocks = 'blocks',
  Names = 'names',
  Emoji = 'emoji',
  Config = 'config',
  Menu = 'menu',
}

export interface IIndexedDbContext {
  isReady: boolean;
  database: IDBDatabase | null;
  dropIndexedDb: () => void;
}

export const INDEXED_DB_CONTEXT_DEFAULT: IIndexedDbContext = {
  isReady: true,
  database: null,
  dropIndexedDb: () => { throw new Error('Not implemented') },
};

export const IndexedDbContext = createContext(INDEXED_DB_CONTEXT_DEFAULT);

