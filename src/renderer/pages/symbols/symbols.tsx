import React, { CSSProperties, FC, useEffect, useMemo, useRef, useState } from 'react';
import { LeftMenu } from '../../components/left-menu/left-menu';
import { useIconCategory } from '../../hooks/use-icon-category';
import { SYMBOLS } from '../../constants/symbols';
import { useSize } from '../../hooks/use-size';
import { FixedSizeGrid as Grid, FixedSizeGridProps } from 'react-window';
import { SCROLL_THUMB_WIDTH, SYMBOL_ITEM_ASPECT_RATIO } from '../../constants/common';
import { sortSymbols } from '../../utils/sort-symbols';
import { getSymbolCallback } from '../../utils/get-symbol-callback';
import { ModalCreateSymbol } from '../../components/modal-create-symbol/modal-create-symbol';
import { ISymbolCell, SymbolCell } from '../../components/symbol-cell/symbol-cell';
import { useIconSize } from '../../hooks/use-icon-size';
import { getMinSymbolWidth } from '../../utils/get-min-symbol-width';

export const SymbolsPage: FC = () => {
  const [activeCategory] = useIconCategory();
  const [iconSize] = useIconSize();
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

  const itemDataRef = useRef<ISymbolCell>({
    onClick: (code: number) => setActive({ code }),
    getSymbolCode: () => null,
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

    itemDataRef.current.getSymbolCode = getSymbolCallback(columnCount, symbols);

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
