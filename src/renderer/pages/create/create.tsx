import React, { CSSProperties, FC, useEffect, useRef, useState } from 'react';
import { FixedSizeGrid as Grid, FixedSizeGridProps } from 'react-window';
import { FormCreateRange } from '../../components/form-create-range/form-create-range';
import { TSymbolRange } from '../../types';
import { useNavigate } from 'react-router-dom';
import { ModalCreateSymbol } from '../../components/modal-create-symbol/modal-create-symbol';
import { useSize } from '../../hooks/use-size';
import { SCROLL_THUMB_WIDTH, SYMBOL_ITEM_ASPECT_RATIO } from '../../constants/common';
import { ISymbolCell, SymbolCell } from '../../components/symbol-cell/symbol-cell';
import { useIconSize } from '../../hooks/use-icon-size';
import { getMinSymbolWidth } from '../../utils/get-min-symbol-width';

export const CreatePage: FC = () => {
  const navigate = useNavigate();

  const size = useSize('create-page-grid-container');
  const [iconSize] = useIconSize();
  const [gridProps, setGridProps] = useState<Omit<FixedSizeGridProps, 'children'> | null>(null);
  const [range, setRange] = useState<Pick<TSymbolRange, 'begin' | 'end'> | null>(null);
  const [active, setActive] = useState<{ code: number } | null>(null);

  const itemDataRef = useRef<ISymbolCell>({
    onClick: (code: number) => setActive({ code }),
    getSymbolCode: () => null,
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

    itemDataRef.current.getSymbolCode = ((_columnCount: number, _begin: number) => (_rowIndex: number, _columnIndex: number) => {
      return _begin + (_columnCount * _rowIndex) + _columnIndex;
    })(columnCount, range.begin);

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
            <Grid itemData={itemDataRef.current} {...gridProps}>{SymbolCell}</Grid>
          ) : null}
        </div>
      </div>

      <ModalCreateSymbol isOpen={!!active} code={active?.code} onDismiss={() => setActive(null)} />
    </div>
  );
};
