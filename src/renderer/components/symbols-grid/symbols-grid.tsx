import React, { CSSProperties, FC, useEffect, useRef, useState } from 'react';
import { FixedSizeGrid as Grid, FixedSizeGridProps } from 'react-window';
import { getMinSymbolWidth } from '../../utils/get-min-symbol-width';
import { SCROLL_THUMB_WIDTH, SYMBOL_ITEM_ASPECT_RATIO } from '../../constants/common';
import { useIdbReady } from '../../hooks/indexed-db/use-idb-ready';
import { useSize } from '../../hooks/use-size';
import { useAppConfig } from '../../hooks/use-app-config';
import { AppConfigKey } from '@app-context';
import { ModalManageSymbol } from '../modal-manage-symbol/modal-manage-symbol';
import { GridCellFactory, IGridCellFactory } from './_grid-cell-factory';

export interface ISymbolsGrid {
  codes?: (number | string)[];
}

export const SymbolsGrid: FC<ISymbolsGrid> = ({ codes }) => {
  const isReady = useIdbReady();
  const gridRef = useRef();
  const size = useSize('symbols-grid-container');
  const [iconSize] = useAppConfig(AppConfigKey.IconSize);
  const [numberBase] = useAppConfig(AppConfigKey.NumberBase);

  const [gridProps, setGridProps] = useState<Omit<FixedSizeGridProps, 'children'> | null>(null);
  const [active, setActive] = useState<{ code: number } | null>(null);

  const itemDataRef = useRef<IGridCellFactory<{ columnCount: number, codes: (number | string)[] }>>({
    columnCount: 0,
    numberBase,
    codes: [],
    onClick: (code: number) => setActive({ code }),
    getSymbolCode: (rowIndex: number, columnIndex: number, data: IGridCellFactory<{
      columnCount: number,
      codes: (number | string)[]
    }>) => {
      const index = (data.columnCount * rowIndex) + columnIndex;
      return data.codes[index];
    },
  });

  useEffect(() => {
    if (!isReady || !size || !size.height || !size.width) {
      return;
    }
    const minItemWidth = getMinSymbolWidth(iconSize);
    const itemHeight = minItemWidth * SYMBOL_ITEM_ASPECT_RATIO;

    const offsetWidth = size.width - SCROLL_THUMB_WIDTH;
    const columnCount = Math.max(Math.floor(offsetWidth / minItemWidth), 1);
    const columnWidth = Math.floor((offsetWidth / columnCount) * 100) / 100;

    const rowCount = Math.ceil((codes?.length ?? 0) / columnCount);

    itemDataRef.current.columnCount = columnCount;
    itemDataRef.current.codes = codes;
    itemDataRef.current.numberBase = numberBase;

    setGridProps({
      columnCount,
      columnWidth,
      height: size.height,
      rowCount,
      rowHeight: itemHeight,
      width: size.width,
      itemKey: ({ columnIndex, data, rowIndex }) => {
        const index = (data.columnCount * rowIndex) + columnIndex;
        const code = data.codes[index];
        return code ? code : `${columnIndex}-${rowIndex}`;
      },
    });
  }, [codes, size, iconSize, isReady, numberBase]);

  useEffect(() => {
    (gridRef.current as any)?.scrollTo?.({ scrollTop: 0 });
  }, [size, gridProps, codes]);

  return (
    <div id="symbols-grid-container" className="symbols-grid" style={{ '--symbol-cell-size': `${iconSize}px` } as CSSProperties}>
      {size && gridProps ? (
        <Grid ref={gridRef} itemData={itemDataRef.current} {...gridProps}>{GridCellFactory}</Grid>
      ) : null}

      <ModalManageSymbol isOpen={!!active} code={active?.code} onDismiss={() => setActive(null)} />
    </div>
  );
};
