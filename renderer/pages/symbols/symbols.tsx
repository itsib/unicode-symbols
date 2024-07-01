import React, { FC, useEffect, useRef, useState } from 'react';
import { LeftMenu } from '../../components/left-menu/left-menu';
import { useIconCategory } from '../../hooks/use-icon-category';
import { SYMBOLS } from '../../constants/symbols';
import { CategoryIcons, SymbolsRange } from '../../types';
import { useSize } from '../../hooks/use-size';
import { FixedSizeGrid as Grid, FixedSizeGridProps, GridChildComponentProps } from 'react-window';
import { ITEM_HEIGHT, MIN_ITEM_WIDTH, SCROLL_THUMB_WIDTH } from '../../constants/common';

interface ListRowParams extends SymbolsRange {
  onClick: (code: number) => void;
  columnCount: number;
  config: CategoryIcons;
}

export const SymbolsPage: FC = () => {
  const [activeCategory] = useIconCategory();
  const size = useSize('symbols-page-grid-container');

  const [gridProps, setGridProps] = useState<Omit<FixedSizeGridProps, 'children'> | null>(null);
  const [active, setActive] = useState<{ code: number } | null>(null);

  const itemDataRef = useRef<ListRowParams | null>({
    onClick: (code: number) => setActive({ code }),
    columnCount: 0,
    begin: 0,
    end: 0,
    config: SYMBOLS[0],
  });

  useEffect(() => {
    const config = SYMBOLS.find(({ id }) => id === activeCategory);
    if (!config) {
      return;
    }
    const offsetWidth = size.width - SCROLL_THUMB_WIDTH;

    const columnCount = Math.max(Math.floor(offsetWidth / MIN_ITEM_WIDTH), 1);
    const columnWidth = Math.floor((offsetWidth / columnCount) * 100) / 100;

    let rowCount = 0;
    let begin: number | undefined = undefined;
    let end: number | undefined = undefined;
    for (const item of config.chars) {
      if (item.type === 'single') {
        rowCount += 1;
        begin = begin == null ? item.code : Math.min(begin, item.code);
        end = end == null ? item.code : Math.max(end, item.code);

      } else if (item.type === 'range') {
        rowCount += (Math.max(item.end, item.start) - Math.min(item.end, item.start));

        begin = begin == null ? Math.min(item.end, item.start) : Math.min(item.end, item.start, begin);
        end = end == null ? Math.max(item.end, item.start) : Math.max(item.end, item.start, begin);
      }
    }

    itemDataRef.current.columnCount = columnCount;
    itemDataRef.current.begin = begin ?? 0;
    itemDataRef.current.end = end ?? (begin ?? 0);
    itemDataRef.current.config = config;

    setGridProps({
      columnCount,
      columnWidth,
      height: size.height,
      rowCount,
      rowHeight: ITEM_HEIGHT,
      width: size.width,
    });
  }, [activeCategory, size]);

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
    </div>
  );
};

const Cell: FC<GridChildComponentProps<ListRowParams>> = ({ columnIndex, rowIndex, style, data }) => {
  const { onClick, columnCount, config } = data;
  config.chars

  const code = (columnCount * rowIndex) + columnIndex;
  return (
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