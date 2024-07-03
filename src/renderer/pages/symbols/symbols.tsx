import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { LeftMenu } from '../../components/left-menu/left-menu';
import { useIconCategory } from '../../hooks/use-icon-category';
import { SYMBOLS } from '../../constants/symbols';
import { TSymbolRange } from '../../types';
import { useSize } from '../../hooks/use-size';
import { FixedSizeGrid as Grid, FixedSizeGridProps, GridChildComponentProps } from 'react-window';
import { ITEM_HEIGHT, MIN_ITEM_WIDTH, SCROLL_THUMB_WIDTH } from '../../constants/common';
import { sortSymbols } from '../../utils/sort-symbols';
import { getSymbolCallback } from '../../utils/get-symbol-callback';
import { ModalCreateSymbol } from '../../components/modal-create-symbol/modal-create-symbol';

interface ListRowParams extends Pick<TSymbolRange, 'begin' | 'end'> {
  onClick: (code: number) => void;
  getSymbolInfo: (index: number) => any;
  columnCount: number;
}

export const SymbolsPage: FC = () => {
  const [activeCategory] = useIconCategory();
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

  const itemDataRef = useRef<ListRowParams | null>({
    onClick: (code: number) => setActive({ code }),
    getSymbolInfo: getSymbolCallback(symbols),
    columnCount: 0,
    begin: 0,
    end: 0,
  });

  useEffect(() => {
    if (!symbols || !size.height || !size.width) {
      return;
    }
    const offsetWidth = size.width - SCROLL_THUMB_WIDTH;
    const columnCount = Math.max(Math.floor(offsetWidth / MIN_ITEM_WIDTH), 1);
    const columnWidth = Math.floor((offsetWidth / columnCount) * 100) / 100;

    const rowCount = Math.ceil((symbols[symbols.length - 1].idxTo) / columnCount);
    let begin: number | undefined = undefined;
    let end: number | undefined = undefined;

    itemDataRef.current.columnCount = columnCount;
    itemDataRef.current.begin = begin ?? 0;
    itemDataRef.current.end = end ?? (begin ?? 0);
    itemDataRef.current.getSymbolInfo = getSymbolCallback(symbols);

    setGridProps({
      columnCount,
      columnWidth,
      height: size.height,
      rowCount,
      rowHeight: ITEM_HEIGHT,
      width: size.width,
    });
  }, [symbols, size]);

  return (
    <div className="symbols-page">
      <div className="menu-overlay">
        <LeftMenu />
      </div>

      <div className="page-content">
        <div id="symbols-page-grid-container" className="container">
          {size && gridProps ? (
            <Grid itemData={itemDataRef.current} {...gridProps}>{Cell}</Grid>
          ) : null}
        </div>
      </div>

      <ModalCreateSymbol isOpen={!!active} code={active?.code} onDismiss={() => setActive(null)} />
    </div>
  );
};

const Cell: FC<GridChildComponentProps<ListRowParams>> = ({ columnIndex, rowIndex, style, data }) => {
  const { onClick, columnCount, getSymbolInfo } = data;
  const index = (columnCount * rowIndex) + columnIndex;
  const code = getSymbolInfo(index);
  return code == null ? null : (
    <div style={style} className="symbol-cell" onClick={() => onClick(code)}>
      <div className="inner-container">
        <div className="symbol">
          <span dangerouslySetInnerHTML={{ __html: `&#${code};` }}/>
        </div>
        <div className="separator"/>
        <div className="subscribe">
          <span>0x{code.toString(16).toUpperCase()}</span>
        </div>
      </div>
    </div>
  )
};
