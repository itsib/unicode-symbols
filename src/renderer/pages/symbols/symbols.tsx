import React, { CSSProperties, FC, useEffect, useMemo, useRef, useState } from 'react';
import { LeftMenu } from '../../components/left-menu/left-menu';
import { useAppConfig } from '../../hooks/use-app-config';
import { SYMBOLS } from '../../constants/symbols';
import { useSize } from '../../hooks/use-size';
import { FixedSizeGrid as Grid, FixedSizeGridProps } from 'react-window';
import { SCROLL_THUMB_WIDTH, SYMBOL_ITEM_ASPECT_RATIO } from '../../constants/common';
import { sortSymbols } from '../../utils/sort-symbols';
import { ModalCreateSymbol } from '../../components/modal-create-symbol/modal-create-symbol';
import { ISymbolCell, SymbolCell } from '../../components/symbol-cell/symbol-cell';
import { getMinSymbolWidth } from '../../utils/get-min-symbol-width';
import { AppConfigKey } from '@app-context';
import { TSymbol } from '../../types';

export const SymbolsPage: FC = () => {
  const [activeCategory] = useAppConfig(AppConfigKey.ActiveCategory);
  const [iconSize] = useAppConfig(AppConfigKey.IconSize);
  const size = useSize('symbols-page-grid-container');

  const [gridProps, setGridProps] = useState<Omit<FixedSizeGridProps, 'children'> | null>(null);
  const [active, setActive] = useState<{ code: number } | null>(null);
  const symbols = useMemo(() => {
    const category = SYMBOLS.find(({ id }) => id === activeCategory);
    if (!category) {
      return;
    }
    return sortSymbols(category);
  }, [activeCategory]);

  const itemDataRef = useRef<ISymbolCell<{ columnCount: number; symbols: (TSymbol & { idxFrom: number; idxTo: number })[] }>>({
    columnCount: 0,
    symbols: symbols,
    onClick: (code: number) => setActive({ code }),
    getSymbolCode: (_rowIndex: number, _columnIndex: number, _data): null | number => {
      const index = (_data.columnCount * _rowIndex) + _columnIndex;

      const found = _data.symbols.find(_item => {
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
    },
  });

  useEffect(() => {
    if (!symbols || !size.height || !size.width) {
      return;
    }
    const minItemWidth = getMinSymbolWidth(iconSize);
    const itemHeight = minItemWidth * SYMBOL_ITEM_ASPECT_RATIO;
    const offsetWidth = size.width - SCROLL_THUMB_WIDTH;
    const columnCount = Math.max(Math.floor(offsetWidth / minItemWidth), 1);
    const columnWidth = Math.floor((offsetWidth / columnCount) * 100) / 100;

    const rowCount = Math.ceil((symbols[symbols.length - 1].idxTo) / columnCount);

    itemDataRef.current.columnCount = columnCount;
    itemDataRef.current.symbols = symbols;

    setGridProps({
      columnCount,
      columnWidth,
      height: size.height,
      rowCount,
      rowHeight: itemHeight,
      width: size.width,
    });
  }, [symbols, size, iconSize]);

  return (
    <div className="symbols-page">
      <div className="menu-overlay">
        <LeftMenu />
      </div>

      <div className="page-content">
        <div id="symbols-page-grid-container" className="container" style={{ '--symbol-cell-size': `${iconSize}px` } as CSSProperties}>
          {size && gridProps ? (
            <Grid itemData={itemDataRef.current} {...gridProps}>{SymbolCell}</Grid>
          ) : null}
        </div>
      </div>

      <ModalCreateSymbol isOpen={!!active} code={active?.code} onDismiss={() => setActive(null)} />
    </div>
  );
};
