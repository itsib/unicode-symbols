import { FC, PropsWithChildren, useEffect, useState } from 'react';
import { IndexedDbContext } from './indexed-db.context';
import { IDBExtractError } from '../../utils/indexed-db';

export const IndexedDbProvider: FC<PropsWithChildren> = ({ children }) => {
  const [database, setDatabase] = useState<IDBDatabase | null>(null);

  // Create IndexedDB instance
  useEffect(() => {
    const { name, version } = window.appAPI.INDEXED_DB_CONFIG
    const request = indexedDB.open(name, version);

    request.onerror = error => {
      console.error(IDBExtractError(error));
    };
    request.onsuccess = () => setDatabase(request.result);
  }, []);

  // Delete database
  useEffect(() => {
    return window.appAPI.on<{ isLoading: boolean }>('drop-idb', () => {
      indexedDB.deleteDatabase(window.appAPI.INDEXED_DB_CONFIG.name);
    });
  }, [database]);

  return (
    <IndexedDbContext.Provider value={{ database }}>
      {children}
    </IndexedDbContext.Provider>
  )
};