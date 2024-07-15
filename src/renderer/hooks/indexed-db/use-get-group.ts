import { useContext, useEffect, useState } from 'react';
import { IndexedDbContext, IndexedDbStore } from '@app-context';
import { IdbEmoji } from '@app-types';
import { useIdbReady } from './use-idb-ready';
import { showIdbError } from '../../utils/indexed-db';

export function useGetGroup(groupId?: number): number[] {
  const isReady = useIdbReady();
  const { database } = useContext(IndexedDbContext);
  const [codes, setCodes] = useState<number[]>([]);

  useEffect(() => {
    if (!isReady || !database || groupId == null) {
      return setCodes([]);
    }

    let finished = false;
    const _codes: number[] = [];
    const transaction = database!.transaction([IndexedDbStore.Emoji], 'readonly');
    const request = transaction.objectStore(IndexedDbStore.Emoji).index('group').openCursor(groupId);

    request.onsuccess = (event) => {
      const cursor = (event.target as any).result;
      if (cursor) {
        const symbol = cursor.value as IdbEmoji;
        _codes.push(symbol.c)

        cursor.continue();
      } else {
        finished = true;
        setCodes(_codes);
      }
    };

    transaction.onerror = error => {
      finished = true;
      showIdbError(error);
    };

    return () => {
      if (!finished) {
        transaction.abort();
      }
    };
  }, [groupId, isReady, database]);

  return codes;
}