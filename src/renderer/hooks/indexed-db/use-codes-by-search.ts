import { useEffect, useMemo, useState } from 'react';
import { AppConfigKey, IndexedDbStore } from '@app-context';
import { IdbName } from '@app-types';
import { showIdbError } from '../../utils/show-idb-error';
import { useAppConfig } from '../use-app-config';
import { useIdbInstance } from './use-idb-instance';
import { useDatabase } from '../use-database';

const MAX_RESULT_ITEMS = 0x1000;

export function useCodesBySearch(search?: string): number[] {
  const database = useDatabase();
  const [numberBase] = useAppConfig(AppConfigKey.NumberBase);

  const [symbolCodes, setSymbolCodes] = useState<number[]>([]);

  const foundByNumbers: number[] | null = useMemo(() => {
    if (!search) {
      return null;
    }

    // Handle emoji in search field
    if (search.length <= 2 && /^[^a-zA-Z0-9\s]+$/.test(search)) {
      const code = search.codePointAt(0);
      if (code > 0x1000 && code < 0x1FFFF) {
        return [code];
      }
    }

    // Handle digit input
    const regExp = numberBase === 16 ? /^(?:0x)?[a-fA-F0-9]+$/ : /^[0-9]+$/;
    if (regExp.test(search)) {
      let code = parseInt(search, numberBase);
      if (code > 0x10FFFF) {
        return null;
      }

      const _codes = new Array(MAX_RESULT_ITEMS);
      for (let i = 0; i < MAX_RESULT_ITEMS; i++) {
        _codes[i] = code;
        code += 1;
        if (code > 0x10FFFF) {
          break;
        }
      }
      return _codes;
    }

    return null;
  }, [search, numberBase]);

  // Try to find in database
  useEffect(() => {
    if (!database || !search || !/^[A-Za-z0-9\s]+$/.test(search) || foundByNumbers) {
      return setSymbolCodes([]);
    }

    function getKey(_search: string) {
      const offset = 1;
      const lower = _search.toUpperCase();
      if (lower.length > offset) {
        const upper = lower.substring(0, lower.length - offset) + 'Z'.repeat(offset);
        return IDBKeyRange.bound(lower, upper, false, true);
      } else {
        return IDBKeyRange.lowerBound(lower, false);
      }
    }

    async function searchSymbol(_search: string) {
      try {
        const codes: number[] = [];
        const key = getKey(_search);
        const tx = await database.transaction(IndexedDbStore.Names, 'readonly');
        const index =  tx.store.index('search');

        for await (const cursor of index.iterate(key)) {
          if (codes.length >= MAX_RESULT_ITEMS) {
            break;
          }
          codes.push(cursor.value.c);
        }

        return codes
      } catch (e) {
        console.error(e)
        return [] as number[];
      }
    }

    searchSymbol(search).then(setSymbolCodes);
  }, [foundByNumbers, database, search]);

  return foundByNumbers || symbolCodes;
}
