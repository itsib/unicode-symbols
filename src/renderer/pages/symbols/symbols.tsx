import React, { CSSProperties, FC, useEffect, useRef, useState } from 'react';
import { LeftMenu } from '../../components/left-menu/left-menu';
import { useAppConfig } from '../../hooks/use-app-config';
import { useSize } from '../../hooks/use-size';
import { FixedSizeGrid as Grid, FixedSizeGridProps } from 'react-window';
import { SCROLL_THUMB_WIDTH, SYMBOL_ITEM_ASPECT_RATIO } from '../../constants/common';
import { ModalCreateSymbol } from '../../components/modal-create-symbol/modal-create-symbol';
import { ISymbolCell, SymbolCell } from '../../components/symbol-cell/symbol-cell';
import { getMinSymbolWidth } from '../../utils/get-min-symbol-width';
import { AppConfigKey } from '@app-context';
import { useGetSymbolsByMenu } from '../../hooks/indexed-db/use-get-symbols-by-menu';
import { useIdbReady } from '../../hooks/indexed-db/use-idb-ready';

export const SymbolsPage: FC = () => {
  const isReady = useIdbReady();
  const [activeCategory] = useAppConfig(AppConfigKey.ActiveCategory);
  const [iconSize] = useAppConfig(AppConfigKey.IconSize);
  const size = useSize('symbols-page-grid-container');

  const codes = useGetSymbolsByMenu(activeCategory);

  const [gridProps, setGridProps] = useState<Omit<FixedSizeGridProps, 'children'> | null>(null);
  const [active, setActive] = useState<{ code: number } | null>(null);

  const itemDataRef = useRef<ISymbolCell<{ columnCount: number, codes: number[] }>>({
    columnCount: 0,
    codes: [],
    onClick: (code: number) => setActive({ code }),
    getSymbolCode: (rowIndex: number, columnIndex: number, data: ISymbolCell<{
      columnCount: number,
      codes: number[]
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
  }, [codes, size, iconSize, isReady]);

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
