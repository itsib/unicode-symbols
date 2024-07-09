import { useContext, useEffect, useState } from 'react';
import { IndexedDbContext, IndexedDbStore } from '@app-context';
import { IdbSymbol } from '@app-types';
import { useIdbReady } from './use-idb-ready';

export function useGetSymbolsByMenu(link?: number) {
  const isReady = useIdbReady();
  const { database } = useContext(IndexedDbContext);
  const [codes, setCodes] = useState<number[]>([]);

  useEffect(() => {
    if (!isReady || !database || link == null) {
      return setCodes([]);
    }

    let finished = false;
    const _codes: number[] = [];
    const transaction = database!.transaction([IndexedDbStore.Symbols], 'readonly');
    const request = transaction.objectStore(IndexedDbStore.Symbols).index('link').openCursor(link);

    request.onsuccess = (event) => {
      const cursor = (event.target as any).result;
      if (cursor) {
        const symbol = cursor.value as IdbSymbol;
        _codes.push(symbol.i)

        cursor.continue();
      } else {
        finished = true;
        setCodes(_codes);
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
  }, [link, isReady, database]);

  return codes;
}