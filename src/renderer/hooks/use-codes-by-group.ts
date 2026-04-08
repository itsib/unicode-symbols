import { useEffect, useState } from 'react';
import { AppConfigKey, IndexedDbStore } from '@app-context';
import { useAppConfig } from './use-app-config';
import { useDatabase } from './use-database';
import type { Codepoint } from '@app-types';

export function useCodesByGroup(groupId?: number): Codepoint[] {
  const database = useDatabase();
  const [favorites] = useAppConfig(AppConfigKey.Favorites);

  const [codes, setCodes] = useState<Codepoint[]>([]);

  useEffect(() => {
    if (!database || !groupId) return;

    setCodes([])

    async function getCodes(_id: number) {
      const _codes: Codepoint[] = [];

      try {
        const tx = await database.transaction(IndexedDbStore.Emoji, 'readonly');
        const index =  tx.store.index('group');

        for await (const cursor of index.iterate(_id)) {
          _codes.push(cursor.value.c);
        }
      } catch (e) {
        console.error(e)
        return undefined;
      }

      return _codes
    }

    getCodes(groupId).then(setCodes);
  }, [database, groupId]);

  return groupId === 0 ? favorites : codes;
}
