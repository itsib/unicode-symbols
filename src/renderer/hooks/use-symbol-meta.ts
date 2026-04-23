import { useEffect, useMemo, useState } from 'react';
import { type Codepoint, IdbBlock, IdbEmoji, IdbName, SymbolMeta, type WithLoading } from '@app-types';
import { IndexedDbStore } from '@app-context';
import { useDatabase } from './use-database';
import { isBitOn } from '../utils/binary-utils';

export function useSymbolMeta(code?: Codepoint): WithLoading<SymbolMeta> {
  const database = useDatabase();

  const [idbBlock, setIdbBlock] = useState<WithLoading<IdbBlock>>(null);
  const [idbName, setIdbName] = useState<WithLoading<IdbName>>(null);
  const [idbEmoji, setIdbEmoji] = useState<WithLoading<IdbEmoji>>(null);

  // Get symbol info by code
  useEffect(() => {
    if (!database || code == null) return;

    async function getEmoji(_code: number | number[]) {
      try {
        const key = Array.isArray(_code) ? _code[0] : _code
        const tx = await database.transaction(IndexedDbStore.Emoji, 'readonly')

        return (await tx.store.index('code').get(key)) as IdbEmoji | null
      } catch (e) {
        console.error(e)
        return undefined;
      }
    }

    getEmoji(code).then(setIdbEmoji);
  }, [database, code]);

  // Try to find symbol name
  useEffect(() => {
    if (!database || code == null) return;

    async function getSymbolName(_code: number | number[]) {
      const key = IDBKeyRange.lowerBound(_code, false)
      const tx = await database.transaction(IndexedDbStore.Names, 'readonly');
      const index = tx.store.index('code')

      for await (const cursor of index.iterate(key)) {
        const idbName = cursor.value as IdbName;
        // Exact found
        if (idbName && idbName.s == null && ((typeof code === 'number' && idbName.c === code) || Array.isArray(code) && code.includes(idbName.c))) {
          return idbName
        }
        // Found in range
        else if (idbName && idbName.s != null && typeof code === 'number' && idbName.c >= code && code >= idbName.s) {
          return idbName
        }
      }

      return undefined
    }

    getSymbolName(code).then(setIdbName).catch(console.error);
  }, [database, code]);

  // Get symbol block scope
  useEffect(() => {
    if (!database || code == null) return;

    async function getBlock(_code: number | number[]) {
      const key = IDBKeyRange.upperBound(_code, false)
      const tx = await database.transaction(IndexedDbStore.Blocks, 'readonly');
      const index = tx.store.index('begin')

      for await (const cursor of index.iterate(key, 'prev')) {
        const block = cursor.value as IdbBlock;
        const c = Array.isArray(_code) ? _code[0] : _code
        if (block.b <= c && block.e >= c) {
          return block
        }
      }

      return undefined
    }

    getBlock(code).then(setIdbBlock).catch(console.error);
  }, [database, code]);

  return useMemo(() => {
    if (code == null) {
      return undefined
    }

    if (idbBlock === null || idbName === null || idbEmoji === null) {
      return null;
    }

    return {
      code: idbEmoji ? idbEmoji.c : code,
      name: idbEmoji ? idbEmoji?.n : idbName?.n,
      block: idbBlock?.n,
      isSupportSkin: idbEmoji == null ? false : isBitOn(idbEmoji.o, 1),
      isSupportVariants: idbEmoji == null ? false : isBitOn(idbEmoji.o, 0),
    }
  }, [code, idbBlock, idbName, idbEmoji]);
}
