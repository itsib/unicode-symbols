import React, { FC, useEffect, useRef, useState } from 'react';
import { FixedSizeGrid as Grid, FixedSizeGridProps, GridChildComponentProps } from 'react-window';
import { FormCreateRange } from '../../components/form-create-range/form-create-range';
import { TSymbolRange } from '../../types';
import { useNavigate } from 'react-router-dom';
import { ModalCreateSymbol } from '../../components/modal-create-symbol/modal-create-symbol';
import { useSize } from '../../hooks/use-size';
import { ITEM_HEIGHT, MIN_ITEM_WIDTH, SCROLL_THUMB_WIDTH } from '../../constants/common';

interface ListRowParams extends Pick<TSymbolRange, 'begin' | 'end'> {
  onClick: (code: number) => void;
  columnCount: number;
}

export const CreatePage: FC = () => {
  const navigate = useNavigate();

  const size = useSize('create-page-grid-container');
  const [gridProps, setGridProps] = useState<Omit<FixedSizeGridProps, 'children'> | null>(null);
  const [range, setRange] = useState<Pick<TSymbolRange, 'begin' | 'end'> | null>(null);
  const [active, setActive] = useState<{ code: number } | null>(null);

  const itemDataRef = useRef<ListRowParams | null>({
    onClick: (code: number) => setActive({ code }),
    columnCount: 0,
    begin: 0,
    end: 0,
  });

  // Compute items count
  useEffect(() => {
    if (!range || !size || !size.height || !size.width) {
      return;
    }

    const offsetWidth = size.width - SCROLL_THUMB_WIDTH;
    const columnCount = Math.max(Math.floor(offsetWidth / MIN_ITEM_WIDTH), 1);
    const columnWidth = Math.floor((offsetWidth / columnCount) * 100) / 100;

    const rowCount = Math.ceil((range.end - range.begin) / columnCount);

    itemDataRef.current.columnCount = columnCount;
    itemDataRef.current.begin = range.begin;
    itemDataRef.current.end = range.end;

    setGridProps({
      columnCount,
      columnWidth,
      height: size.height,
      rowCount,
      rowHeight: ITEM_HEIGHT,
      width: size.width,
    });
  }, [size, range]);

  return (
    <div className="create-page">
      <div className="form-overlay">
        <FormCreateRange onChange={setRange} onGoBack={() => navigate('/')} />
      </div>

      <div className="page-content">
        <div id="create-page-grid-container" className="container">
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
  const { onClick, columnCount, begin } = data;
  const code = begin + (columnCount * rowIndex) + columnIndex;
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
