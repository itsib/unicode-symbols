import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { IndexedDbContext } from './indexed-db.context';
import { IdbSymbol, SymbolMeta } from '@app-types';
import { IDBExtractError } from '../../utils/indexed-db';

enum Store {
  Symbols = 'symbols'
}

/**
 * Source size 8.7MB
 * @param children
 * @constructor
 */
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

      const index = store.index('id');
      const request = index.get([id]);

      request.onsuccess = () => {
        const idbSymbol = request.result as IdbSymbol | null;
        if (!idbSymbol) {
          return resolve({
            code: id,
            name: undefined,
            group: undefined,
          });
        }
        resolve({
          code: idbSymbol.i,
          name: idbSymbol.n,
          group: idbSymbol.g === 0 ? undefined : idbSymbol.g,
        })
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
    <IndexedDbContext.Provider value={{ getSymbolById }}>
      {children}
    </IndexedDbContext.Provider>
  )
};