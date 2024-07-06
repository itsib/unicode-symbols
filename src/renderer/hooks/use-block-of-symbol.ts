import { useContext, useEffect, useState } from 'react';
import { SymbolBlock } from '@app-types';
import { IndexedDbContext } from '@app-context';

export function useBlockOfSymbol(id?: number): SymbolBlock | null {
  const { getSymbolsBlock } = useContext(IndexedDbContext);
  const [block, setBlock] = useState<SymbolBlock | null>();

  useEffect(() => {
    if (id == null) {
      return;
    }
    getSymbolsBlock(id)
      .then(symbol => setBlock(symbol))
      .catch(console.error);
  }, []);

  return block;
}