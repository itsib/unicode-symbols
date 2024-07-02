import { TSymbol } from '../types';

export function getSymbolCallback(symbols: (TSymbol & { idxFrom: number; idxTo: number })[]): (index: number) => null | number {
  return (index: number): null | number => {
    const found = symbols.find(_item => {
      if (_item.type === 'range') {
        return _item.idxFrom <= index && _item.idxTo >= index;
      } else {
        return _item.idxTo === index
      }
    });
    if (!found) {
      return null;
    }

    if (found.type === 'range') {
      return found.begin + (index - found.idxFrom);
    } else {
      return found.code;
    }
  };
}