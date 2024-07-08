import { createContext } from 'react';

export enum IndexedDbStore {
  Planes = 'planes',
  Symbols = 'symbols',
  Blocks = 'blocks',
  Config = 'config',
}

export interface IIndexedDbContext {
  database: IDBDatabase | null;
}

export const INDEXED_DB_CONTEXT_DEFAULT: IIndexedDbContext = {
  database: null,
};

export const IndexedDbContext = createContext(INDEXED_DB_CONTEXT_DEFAULT);

