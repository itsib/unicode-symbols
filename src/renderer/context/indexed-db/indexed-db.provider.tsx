import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { IndexedDbContext } from './indexed-db.context';
import { IdbBlock, IdbSymbol, SymbolBlock, SymbolMeta } from '@app-types';
import { IDBExtractError } from '../../utils/indexed-db';

enum Store {
  Symbols = 'symbols',
  Blocks = 'blocks',
}

export const IndexedDbProvider: FC<PropsWithChildren> = ({ children }) => {
  const [database, setDatabase] = useState<IDBDatabase | null>(null);

  // Find symbol by ID (code)
  const getSymbolById = useCallback(async (id: number): Promise<SymbolMeta> => {
    if (!database) {
      return null;
    }

    return new Promise(async (resolve, reject) => {
      const transaction = database!.transaction([Store.Symbols], 'readonly');
      const store = transaction.objectStore(Store.Symbols);
      const request = store.index('id').get(id);

      request.onsuccess = () => {
        const idbSymbol = request.result as IdbSymbol | null;
        if (!idbSymbol) {
          return resolve({
            code: id,
            name: undefined,
            block: undefined,
          });
        }
        resolve({
          code: idbSymbol.i,
          name: idbSymbol.n,
          block: idbSymbol.b === 0 ? undefined : idbSymbol.b,
        })
      };

      transaction.onerror = error => reject(IDBExtractError(error));
    });
  }, [database]);

  // Find block of symbol range
  const getSymbolsBlock = useCallback(async (id: number): Promise<SymbolBlock> => {
    if (!database) {
      return null;
    }

    return new Promise(async (resolve, reject) => {
      const transaction = database!.transaction([Store.Blocks], 'readonly');
      const store = transaction.objectStore(Store.Blocks);

      const bound = IDBKeyRange.upperBound(id, false);

      let idbBlock: IdbBlock | null = null;
      const request = store.index('begin').openCursor(bound, 'prev');

      request.onsuccess = (event) => {
        const cursor = (event.target as any).result;
        if (cursor) {
          idbBlock = cursor.value as IdbBlock;
          if (idbBlock && idbBlock.e > id) {
            resolve({
              id: idbBlock.i,
              name: idbBlock.n,
              begin: idbBlock.b,
              end: idbBlock.e,
            });
          }
        }
        resolve(null);
      };

      transaction.onerror = error => reject(IDBExtractError(error));
    });
  }, [database]);

  // Create IndexedDB instance
  useEffect(() => {
    const { name, version } = window.appAPI.INDEXED_DB_CONFIG
    const request = indexedDB.open(name, version);

    request.onerror = error => {
      console.error(IDBExtractError(error));
    };
    request.onsuccess = () => setDatabase(request.result);
  }, []);

  return (
    <IndexedDbContext.Provider value={{ getSymbolById, getSymbolsBlock }}>
      {children}
    </IndexedDbContext.Provider>
  )
};