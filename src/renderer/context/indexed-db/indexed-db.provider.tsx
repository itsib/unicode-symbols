import React, { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { IndexedDbContext } from './indexed-db.context';
import { Database } from '../../utils/database';
import initializationAnimation from '../../../assets/animations/initialization.json';

export const IndexedDbProvider: FC<PropsWithChildren> = ({ children }) => {
  const [database, setDatabase] = useState<Database | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const dropIndexedDb = useCallback(() => {
    Database.drop(window.appAPI.INDEXED_DB_NAME)
      .then(() => window.location.reload())
      .catch(console.error);
  }, []);

  // Create IndexedDB instance
  useEffect(() => {
    return window.appAPI.on('ready', () => {
      const db = Database.get({
        name: window.appAPI.INDEXED_DB_NAME,
        version: window.appAPI.INDEXED_DB_VERSION,
        onConnected() {
          setIsLoading(false);
        },
      });

      setDatabase(db);
    });
  }, []);

  // Delete database
  useEffect(() => {
    return window.appAPI.on<{ isLoading: boolean }>('drop-idb', () => {
      dropIndexedDb();
    });
  }, [database, dropIndexedDb]);

  return (
    <IndexedDbContext.Provider value={{ database, dropIndexedDb }}>
      {isLoading ? (
        <div className="layout-page">
          <div className="loading-backdrop">
            <DotLottieReact className="animation" data={initializationAnimation} loop autoplay/>
            <div className="message">Updating the Database</div>
          </div>
        </div>
      ) : children}
    </IndexedDbContext.Provider>
  );
};
