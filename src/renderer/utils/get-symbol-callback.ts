import { TSymbol } from '../types';

export interface SymbolCallback {
  (rowIndex: number, columnIndex: number): null | number;
}

export function getSymbolCallback(columnCount: number, symbols: (TSymbol & { idxFrom: number; idxTo: number })[]): SymbolCallback {
  return (rowIndex: number, columnIndex: number): null | number => {
    const index = (columnCount * rowIndex) + columnIndex;

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