import { useEffect, useState } from 'react';
import { IdbBlock, IdbSymbol, SymbolMeta } from '@app-types';
import { IndexedDbStore } from '@app-context';
import { useIdbInstance } from './use-idb-instance';

export function useIdbGetSymbol(id?: number): SymbolMeta | null {
  const database = useIdbInstance();
  const [symbol, setSymbol] = useState<SymbolMeta | null>();

  useEffect(() => {
    if (id == null || !database) {
      return;
    }
    const transaction = database.transaction([IndexedDbStore.Symbols, IndexedDbStore.Blocks], 'readonly');

    const symbolsReq = transaction
      .objectStore(IndexedDbStore.Symbols)
      .index('id')
      .get(id);

    const blocksReq = transaction
      .objectStore(IndexedDbStore.Blocks)
      .index('begin')
      .openCursor(IDBKeyRange.upperBound(id, false), 'prev');

    let _symbol: IdbSymbol | null = null;
    let _block: IdbBlock | null = null;
    symbolsReq.onsuccess = event => {
      _symbol = (event.target as IDBRequest).result;
    };

    blocksReq.onsuccess = event => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        _block = cursor.value;
      }
    };

    transaction.oncomplete = () => {
      if (!_symbol) {
        return setSymbol({
          code: id,
          name: undefined,
          block: undefined,
        });
      }
      setSymbol({
        code: _symbol.i,
        name: _symbol.n,
        block: _symbol.b === _block.i ? _block.n : undefined,
      });
    };

    transaction.onerror = error => console.error(error);
  }, [database, id]);

  return symbol;
}