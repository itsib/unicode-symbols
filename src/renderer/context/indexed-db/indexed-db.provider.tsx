import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { IndexedDbContext } from './indexed-db.context';
import { IDBExtractError } from '../../utils/indexed-db';

export const IndexedDbProvider: FC<PropsWithChildren> = ({ children }) => {
  const [database, setDatabase] = useState<IDBDatabase | null>(null);
  const [isReady, setIsReady] = useState(true);

  const dropIndexedDb = useCallback(() => {
    indexedDB.deleteDatabase(window.appAPI.INDEXED_DB_NAME);
    window.location.reload();
  }, []);

  // Create IndexedDB instance
  useEffect(() => {
    const request = indexedDB.open(window.appAPI.INDEXED_DB_NAME, window.appAPI.INDEXED_DB_VERSION);

    request.onerror = error => {
      console.error(IDBExtractError(error));
    };
    request.onsuccess = () => setDatabase(request.result);
  }, []);

  // Delete database
  useEffect(() => {
    return window.appAPI.on<{ isLoading: boolean }>('drop-idb', () => {
      dropIndexedDb();
    });
  }, [database, dropIndexedDb]);

  // Delete database
  useEffect(() => {
    return window.appAPI.on<{ state: string, data: any }>('db-state', event => {
      if (['init-start', 'init-process'].includes(event.state)) {
        setIsReady(false);
      } else if (event.state === 'init-complete') {
        setIsReady(true);
      }
      console.log(event);
    });
  }, [database, dropIndexedDb]);

  return (
    <IndexedDbContext.Provider value={{ isReady, database, dropIndexedDb }}>
      {children}
    </IndexedDbContext.Provider>
  )
};