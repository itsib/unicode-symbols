import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { AppConfig, AppConfigKey, APPLICATION_CONTEXT_DEFAULT, ApplicationContext } from './application.context';
import { useIdbInstance } from '../../hooks/indexed-db/use-idb-instance';
import { IndexedDbStore } from '../indexed-db/indexed-db.context';

export const ApplicationProvider: FC<PropsWithChildren> = ({ children }) => {
  const database = useIdbInstance();
  const [configValue, setConfigValue] = useState<{ [ Key in AppConfigKey ]: AppConfig<Key> }>(APPLICATION_CONTEXT_DEFAULT.config);

  const setConfig = useCallback(function <K extends AppConfigKey, T extends AppConfig<K>>(key: K, value: T) {
    if (!database) {
      throw new Error('IndexedDB unavailable')
    }
    const transaction = database.transaction(IndexedDbStore.Config, 'readwrite');
    const store = transaction.objectStore(IndexedDbStore.Config);

    const request = store.put(value, key);

    request.onsuccess = () => {
      setConfigValue(config => ({ ...config, [key]: value }));
    }

    transaction.onerror = error => console.error(error);
  }, [database]);

  // Restore app configuration
  useEffect(() => {
    if (!database) {
      return;
    }
    const transaction = database.transaction([IndexedDbStore.Config], 'readonly');
    const request = transaction.objectStore(IndexedDbStore.Config).openCursor();

    const _config: any = {};
    request.onsuccess = event => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        _config[cursor.key] = cursor.value;
        cursor.continue();
      } else {
        setConfigValue(_config);
      }
    };

    transaction.onerror = error => console.error(error);
  }, [database]);

  return (
    <ApplicationContext.Provider value={{ config: configValue, setConfig }}>
      {children}
    </ApplicationContext.Provider>
  );
};