import { createContext } from 'react';
import { IdbSymbol, SymbolMeta } from '@app-types';

export interface IIndexedDbContext {
  getSymbolById: (id: number) => Promise<SymbolMeta>;
}

export const INDEXED_DB_CONTEXT_DEFAULT: IIndexedDbContext = {
  getSymbolById() { throw new Error('Not implemented'); },
};

export const IndexedDbContext = createContext(INDEXED_DB_CONTEXT_DEFAULT);

