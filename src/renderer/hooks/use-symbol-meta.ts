import { useContext, useEffect, useState } from 'react';
import { SymbolMeta } from '@app-types';
import { IndexedDbContext } from '@app-context';

export function useSymbolMeta(code?: number): SymbolMeta | null {
  const { getSymbolById } = useContext(IndexedDbContext);
  const [symbolMeta, setSymbolMeta] = useState<SymbolMeta | null>();

  useEffect(() => {
    if (code == null) {
      return;
    }
    getSymbolById(code)
      .then(symbol => setSymbolMeta(symbol))
      .catch(console.error);
  }, []);

  return symbolMeta;
}