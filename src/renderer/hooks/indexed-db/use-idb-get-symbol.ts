import { useEffect, useState } from 'react';
import { IdbBlock, IdbSymbol, SymbolMeta } from '@app-types';
import { IndexedDbStore } from '@app-context';
import { useIdbInstance } from './use-idb-instance';
import { formatSymbolName } from '../../utils/format-symbol-name';
import { showIdbError } from '../../utils/indexed-db';

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
          skinSupport: false,
          restyleSupport: false,
        });
      }
      setSymbol({
        code: _symbol.i,
        name: formatSymbolName(_symbol.n),
        block: _symbol.b === _block.i ? _block.n : undefined,
        skinSupport: _symbol.s,
        restyleSupport: _symbol.r,
      });
    };

    transaction.onerror = error => showIdbError(error);
  }, [database, id]);

  return symbol;
}