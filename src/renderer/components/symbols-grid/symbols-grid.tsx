import React, { CSSProperties, FC, useEffect, useMemo, useRef, useState } from 'react';
import { Grid, useGridRef, type GridProps } from 'react-window';
import { getMinSymbolWidth } from '../../utils/get-min-symbol-width';
import { SCROLL_THUMB_WIDTH, SYMBOL_ITEM_ASPECT_RATIO } from '../../constants/common';
import { useAppConfig } from '../../hooks/use-app-config';
import { AppConfigKey } from '@app-context';
import { ModalManageSymbol } from '../modal-manage-symbol/modal-manage-symbol';
import { GridCell, type GridCellProps } from './_grid-cell';
import type { Codepoint } from '@app-types';

export interface ISymbolsGrid {
  codes: Codepoint[];
}

export const SymbolsGrid: FC<ISymbolsGrid> = ({ codes }) => {
  const [iconSize] = useAppConfig(AppConfigKey.IconSize);
  const [numberBase] = useAppConfig(AppConfigKey.NumberBase);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useGridRef(null);

  const [active, setActive] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(window.innerWidth - 260 - SCROLL_THUMB_WIDTH);

  const gridProps: Omit<GridProps<GridCellProps>, 'cellComponent'> | null = useMemo(() => {
    if (!codes.length) return null;

    const minItemWidth = getMinSymbolWidth(iconSize);
    const itemHeight = minItemWidth * SYMBOL_ITEM_ASPECT_RATIO;

    const columnCount = Math.max(Math.floor(containerWidth / minItemWidth), 1);
    const columnWidth = Math.floor(containerWidth / columnCount);
    const rowCount = Math.ceil(codes.length / columnCount);

    return {
      columnCount: columnCount,
      columnWidth: columnWidth,
      rowCount: rowCount,
      rowHeight: itemHeight,
      defaultWidth: columnWidth,

      cellProps: {
        data: codes,
        numberBase: numberBase,
        columnCount: columnCount,
        onClick: (code: number) => setActive(code)
      }
    }
  }, [codes, containerWidth, iconSize, numberBase]);

  useEffect(() => {
    (gridRef.current as any)?.scrollToRow?.({ index: 0 });
  }, [containerWidth, gridProps, codes]);

  useEffect(() => {
    function onResize() {
      setContainerWidth(window.innerWidth - 260 - SCROLL_THUMB_WIDTH)
    }

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    }
  }, []);

  return (
    <div id="symbols-grid-container" ref={containerRef} className="symbols-grid" style={{ '--symbol-cell-size': `${iconSize}px` } as CSSProperties}>
      {gridProps ? (
        <Grid
          gridRef={gridRef}
          columnCount={gridProps.columnCount}
          columnWidth={gridProps.columnWidth}
          rowCount={gridProps.rowCount}
          rowHeight={gridProps.rowHeight}
          cellComponent={GridCell}
          cellProps={gridProps.cellProps}
        />
      ) : null}

      <ModalManageSymbol isOpen={active != null} code={active} onDismiss={() => setActive(null)} />
    </div>
  );
};
