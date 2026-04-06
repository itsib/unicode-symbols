import { useEffect, useState } from 'react';
import { IndexedDbStore } from '@app-context';
import { LeftMenuItem } from '@app-types';
import { useDatabase } from './use-database';

export function useLeftMenu(): LeftMenuItem[] {
  const database = useDatabase();
  const [menuItems, setMenuItems] = useState<LeftMenuItem[]>([]);

  useEffect(() => {
    if (!database) return;

    async function fillMenu() {
      const key = IDBKeyRange.lowerBound(0, false)
      const tx = await database.transaction(IndexedDbStore.Menu, 'readwrite')
      const index = tx.store.index('order')

      const menuItems: LeftMenuItem[] = [];
      for await (const cursor of index.iterate(key)) {
        menuItems.push({
          id: cursor.value.i,
          name: cursor.value.n,
          icon: cursor.value.icon,
          order: cursor.value.o,
        })
      }

      return menuItems
    }

    fillMenu().then(setMenuItems).catch(console.error);
  }, [database]);

  return menuItems;
}
