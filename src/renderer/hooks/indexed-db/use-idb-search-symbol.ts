import { useContext, useEffect, useMemo, useState } from 'react';
import { AppConfigKey, IndexedDbContext, IndexedDbStore } from '@app-context';
import { IdbName } from '@app-types';
import { showIdbError } from '../../utils/indexed-db';
import { useAppConfig } from '../use-app-config';

const MAX_RESULT_ITEMS = 0x1000;

export function useIdbSearchSymbol(search?: string): number[] {
  const { database } = useContext(IndexedDbContext);
  const [numberBase] = useAppConfig(AppConfigKey.NumberBase);
  const [symbolCodes, setSymbolCodes] = useState<number[]>([]);

  const foundByNumbers = useMemo(() => {
    if (!search) {
      return null;
    }
    if (search.length <= 2 && /^[^a-zA-Z0-9\s]+$/.test(search)) {
      const code = search.codePointAt(0);
      if (code > 0x1000 && code < 0x1FFFF) {
        return [code];
      }
    }

    const regExp = numberBase === 16 ? /^(?:0x)?[a-fA-F0-9]+$/ : /^[0-9]+$/;
    if (regExp.test(search)) {
      let cursor = parseInt(search, numberBase);
      if (cursor > 0x10FFFF) {
        return null;
      }
      const result = new Array(MAX_RESULT_ITEMS);
      for (let i = 0; i < MAX_RESULT_ITEMS; i++) {
        result[i] = cursor;
        cursor += 1;
        if (cursor > 0x10FFFF) {
          break;
        }
      }
      return result;
    }
    return null;
  }, [search, numberBase]);

  useEffect(() => {
    if (!database || !search || !/^[A-Za-z0-9\s]+$/.test(search) || foundByNumbers?.length) {
      return setSymbolCodes([]);
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

    const transaction = database!.transaction([IndexedDbStore.Names], 'readonly');
    const request = transaction.objectStore(IndexedDbStore.Names).index('search').openCursor(query);

    const ids: number[] = [];
    let finished = false;

    request.onsuccess = (event) => {
      const cursor = (event.target as any).result;
      if (cursor && ids.length < MAX_RESULT_ITEMS) {
        const symbol = cursor.value as IdbName;
        ids.push(symbol.c)

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
  }, [search, database, foundByNumbers]);

  return foundByNumbers?.length ? foundByNumbers : symbolCodes;
}