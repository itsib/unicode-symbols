import { useIdbInstance } from './use-idb-instance';
import { useEffect, useState } from 'react';
import { IndexedDbStore } from '@app-context';
import { IdbMenuItem, LeftMenuItem } from '@app-types';
import { useIdbReady } from './use-idb-ready';

export function useIdbLeftMenu(): LeftMenuItem[] {
  const database = useIdbInstance();
  const isReady = useIdbReady();
  const [menuItems, setMenuItems] = useState<LeftMenuItem[]>([]);

  useEffect(() => {
    if (!database || !isReady) {
      return setMenuItems([]);
    }

    const keyOnly = IDBKeyRange.lowerBound(0, false);
    const transaction = database.transaction([IndexedDbStore.Menu], 'readonly');
    const request = transaction.objectStore(IndexedDbStore.Menu).index('order').openCursor(keyOnly);

    const _menuItems: LeftMenuItem[] = [];
    let finished = false;

    request.onsuccess = (event) => {
      const cursor = (event.target as any).result;
      if (cursor && !finished) {
        const menuItem = cursor.value as IdbMenuItem;
        _menuItems.push({
          id: menuItem.i,
          name: menuItem.n,
          icon: menuItem.icon,
          order: menuItem.o,
        });
        cursor.continue();
      } else {

        finished = true;
        setMenuItems(_menuItems);
      }
    };

    transaction.onerror = error => {
      finished = true;
      if ((error.target as IDBRequest).error.name !== 'AbortError') {
        console.error((error.target as IDBRequest).error.message)
      }

    };

    return () => {
      if (!finished) {
        transaction.abort();
      }
    };
  }, [database, isReady]);

  return menuItems;
}