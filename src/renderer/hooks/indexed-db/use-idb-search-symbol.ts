import { useContext, useEffect, useState } from 'react';
import { IndexedDbContext, IndexedDbStore } from '@app-context';
import { IdbSymbol } from '@app-types';

export function useIdbSearchSymbol(search?: string): number[] {
  const { database } = useContext(IndexedDbContext);
  const [symbolCodes, setSymbolCodes] = useState<number[]>([]);

  useEffect(() => {
    if (!database || search == null || search === '0x' || search === '0') {
      return setSymbolCodes([]);
    }
    // Search by char code
    if (/^(?:0x)?[a-fA-F0-9]+$/.test(search)) {
      const base = !search.startsWith('0x') && /^[0-9]+$/.test(search) ? 10 : 16;
      const count = 300;
      let cursor = parseInt(search, base);

      const result = new Array(count);
      for (let i = 0; i < count; i++) {
        result[i] = cursor++;
      }
      return setSymbolCodes(result);
    }

    // Search by name
    {
      const transaction = database!.transaction([IndexedDbStore.Symbols], 'readonly');
      const bound = IDBKeyRange.lowerBound(search, true);

      const request = transaction.objectStore(IndexedDbStore.Symbols).index('name').openCursor(bound);

      const ids: number[] = [];
      request.onsuccess = (event) => {
        const cursor = (event.target as any).result;
        if (cursor) {
          const symbol = cursor.value as IdbSymbol;
          ids.push(symbol.i)

          cursor.continue();
        } else {
          setSymbolCodes(ids);
        }
      };

      transaction.onerror = error => console.error(error);
    }
  }, [search, database]);

  return symbolCodes;
}