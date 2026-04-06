import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { IndexedDbContext } from './indexed-db.context';
import { Database } from '../../utils/database';
import { initDatabaseData } from '../../utils/database-init';

let DATABASE: Database | null = null

export const IndexedDbProvider: FC<PropsWithChildren> = ({ children }) => {
  const [database, setDatabase] = useState<Database | null>(null);
  const [isReady, setIsReady] = useState(false);

  const dropIndexedDb = useCallback(() => {
    Database.drop(window.appAPI.INDEXED_DB_NAME)
      .then(() => window.location.reload())
      .catch(console.error);
  }, []);

  // Create IndexedDB instance
  useEffect(() => {
    if (!DATABASE) {
      DATABASE = Database.get({
        name: window.appAPI.INDEXED_DB_NAME,
        version: window.appAPI.INDEXED_DB_VERSION,
        async onInit(db: IDBDatabase) {
          try {
            await initDatabaseData(db)
          } catch (error: unknown) {
            console.error(error)
          }
        },
        onReady() {
          setIsReady(true)
        }
      })
    }
    setDatabase(DATABASE)
  }, []);

  // Delete database
  useEffect(() => {
    return window.appAPI.on<{ isLoading: boolean }>('drop-idb', () => {
      dropIndexedDb();
    });
  }, [database, dropIndexedDb]);

  return (
    <IndexedDbContext.Provider value={{ isReady, database, dropIndexedDb }}>
      {children}
    </IndexedDbContext.Provider>
  )
};
