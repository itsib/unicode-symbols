import { useEffect, useMemo, useState } from 'react';
import { IdbBlock, IdbEmoji, IdbName, SymbolMeta } from '@app-types';
import { IndexedDbStore } from '@app-context';
import { useIdbInstance } from './use-idb-instance';
import { showIdbError } from '../../utils/indexed-db';

export function useIdbGetSymbolMeta(code?: number): SymbolMeta | null {
  const database = useIdbInstance();
  const [idbBlock, setIdbBlock] = useState<IdbBlock | null | undefined>(undefined);
  const [idbName, setIdbName] = useState<IdbName | null | undefined>(undefined);
  const [idbEmoji, setIdbEmoji] = useState<IdbEmoji | null | undefined>(undefined);

  useEffect(() => {
    if (code == null || !database) {
      return;
    }
    const transaction = database.transaction([IndexedDbStore.Emoji], 'readonly');
    const store = transaction.objectStore(IndexedDbStore.Emoji);

    const request = store.index('code').get(code);

    request.onsuccess = event => {
      const emoji = (event.target as IDBRequest).result as IdbEmoji;
      setIdbEmoji(emoji || null);
    }

    transaction.onerror = error => showIdbError(error);
  }, [database, code]);

  useEffect(() => {
    if (code == null || !database) {
      return;
    }
    const key = IDBKeyRange.lowerBound(code, false);
    const transaction = database.transaction([IndexedDbStore.Names], 'readonly');
    const store = transaction.objectStore(IndexedDbStore.Names);

    const request = store.index('code').openCursor(key);

    request.onsuccess = event => {
      const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
      if (cursor) {
        const idbName = cursor.value as IdbName;
        // Exact found
        if (idbName && idbName.s == null && idbName.c === code) {
          setIdbName(idbName);
        }
        // Found in range
        else if (idbName && idbName.s != null && idbName.c >= code && code >= idbName.s) {
          setIdbName(idbName);
        }
        // Nothing found
        else {
          setIdbName(null);
        }
      } else {
        setIdbName(null);
      }

    }

    transaction.onerror = error => showIdbError(error);
  }, [database, code]);

  useEffect(() => {
    if (code == null || !database) {
      return;
    }
    const transaction = database.transaction([IndexedDbStore.Blocks], 'readonly');
    const request = transaction
      .objectStore(IndexedDbStore.Blocks)
      .index('begin')
      .openCursor(IDBKeyRange.upperBound(code, false), 'prev');

    request.onsuccess = event => {
      const cursor = (event.target as IDBRequest).result as IDBCursorWithValue | undefined;
      if (cursor && cursor.value) {
        const block = cursor.value as IdbBlock;
        if (block.b <= code && block.e >= code) {
          return setIdbBlock(block);
        }
      }
      return setIdbBlock(null);
    };

    transaction.onerror = error => showIdbError(error);
  }, [database, code]);

  return useMemo(() => {
    if (code == null || idbBlock === undefined || idbName === undefined || idbEmoji === undefined) {
      return null;
    }
    return {
      code,
      name: idbEmoji ? idbEmoji?.n : idbName?.n,
      block: idbBlock?.n,
      skin: !!idbEmoji?.s
    }
  }, [code, idbBlock, idbName, idbEmoji]);
}