import React, { CSSProperties, FC, useEffect, useRef, useState } from 'react';
import { FixedSizeGrid as Grid, FixedSizeGridProps } from 'react-window';
import { FormCreateRange } from '../../components/form-create-range/form-create-range';
import { TSymbolRange } from '../../types';
import { useNavigate } from 'react-router-dom';
import { ModalCreateSymbol } from '../../components/modal-create-symbol/modal-create-symbol';
import { useSize } from '../../hooks/use-size';
import { SCROLL_THUMB_WIDTH, SYMBOL_ITEM_ASPECT_RATIO } from '../../constants/common';
import { ISymbolCell, SymbolGridCell } from '../../components/symbol-grid-cell/symbol-grid-cell';
import { getMinSymbolWidth } from '../../utils/get-min-symbol-width';
import { useAppConfig } from '../../hooks/use-app-config';
import { AppConfigKey } from '@app-context';

export const CreatePage: FC = () => {
  const navigate = useNavigate();

  const size = useSize('create-page-grid-container');
  const [iconSize] = useAppConfig(AppConfigKey.IconSize);
  const [gridProps, setGridProps] = useState<Omit<FixedSizeGridProps, 'children'> | null>(null);
  const [range, setRange] = useState<Pick<TSymbolRange, 'begin' | 'end'> | null>(null);
  const [active, setActive] = useState<{ code: number } | null>(null);

  const itemDataRef = useRef<ISymbolCell<{ columnCount: number, begin: number }>>({
    columnCount: 0,
    begin: range?.begin ?? 0,
    onClick: (code: number) => setActive({ code }),
    getSymbolCode: (_rowIndex: number, _columnIndex: number, _data) => {
      return _data.begin + (_data.columnCount * _rowIndex) + _columnIndex;
    },
  });

  // Compute items count
  useEffect(() => {
    if (!range || !size || !size.height || !size.width) {
      return;
    }
    const minItemWidth = getMinSymbolWidth(iconSize);
    const itemHeight = minItemWidth * SYMBOL_ITEM_ASPECT_RATIO;

    const offsetWidth = size.width - SCROLL_THUMB_WIDTH;
    const columnCount = Math.max(Math.floor(offsetWidth / minItemWidth), 1);
    const columnWidth = Math.floor((offsetWidth / columnCount) * 100) / 100;

    const rowCount = Math.ceil((range.end - range.begin) / columnCount);

    itemDataRef.current.columnCount = columnCount;
    itemDataRef.current.begin = range.begin;

    setGridProps({
      columnCount,
      columnWidth,
      height: size.height,
      rowCount,
      rowHeight: itemHeight,
      width: size.width,
    });
  }, [size, range, iconSize]);

  return (
    <div className="create-page">
      <div className="form-overlay">
        <FormCreateRange onChange={setRange} onGoBack={() => navigate('/')} />
      </div>

      <div className="page-content">
        <div id="create-page-grid-container" className="container" style={{ '--symbol-cell-size': `${iconSize}px` } as CSSProperties}>
          {size && gridProps ? (
            <Grid itemData={itemDataRef.current} {...gridProps}>{SymbolGridCell}</Grid>
          ) : null}
        </div>
      </div>

      <ModalCreateSymbol isOpen={!!active} code={active?.code} onDismiss={() => setActive(null)} />
    </div>
  );
};
