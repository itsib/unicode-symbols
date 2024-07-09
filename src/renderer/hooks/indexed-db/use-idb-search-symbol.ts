import { useContext, useEffect, useState } from 'react';
import { IndexedDbContext, IndexedDbStore } from '@app-context';
import { IdbSymbol } from '@app-types';
import { showIdbError } from '../../utils/indexed-db';

const MAX_RESULT_ITEMS = 300;

export function useIdbSearchSymbol(search?: string): number[] {
  const { database } = useContext(IndexedDbContext);
  const [symbolCodes, setSymbolCodes] = useState<number[]>([]);

  useEffect(() => {
    if (!database || !search || search === '0x' || search === '0') {
      return setSymbolCodes([]);
    }
    // Search by char code
    if (/^[0-9]+$/.test(search) || /^0x[a-fA-F0-9]+$/.test(search)) {
      let cursor = parseInt(search, /^[0-9]+$/.test(search) ? 10 : 16);
      const result = new Array(MAX_RESULT_ITEMS);
      for (let i = 0; i < MAX_RESULT_ITEMS; i++) {
        result[i] = cursor++;
      }
      return setSymbolCodes(result);
    }

    // Search by name
    const offset = 1;
    const lower = search.toUpperCase();
    let query: IDBKeyRange;
    if (lower.length > offset) {
      const upper = lower.substring(0, lower.length - offset) + 'Z'.repeat(offset);
      query = IDBKeyRange.bound(lower, upper, false, true);
    } else {
      query = IDBKeyRange.lowerBound(lower, false);
    }

    const transaction = database!.transaction([IndexedDbStore.Symbols], 'readonly');
    const request = transaction.objectStore(IndexedDbStore.Symbols).index('search').openCursor(query);

    const ids: number[] = [];
    let finished = false;

    request.onsuccess = (event) => {
      const cursor = (event.target as any).result;
      if (cursor && ids.length < MAX_RESULT_ITEMS) {
        const symbol = cursor.value as IdbSymbol;
        ids.push(symbol.i)

        cursor.continue();
      } else {
        finished = true;
        setSymbolCodes(ids);
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
  }, [search, database]);

  return symbolCodes;
}