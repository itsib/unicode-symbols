import React, { FC, useEffect, useRef, useState } from 'react';
import { FixedSizeGrid as Grid, GridChildComponentProps } from 'react-window';
import { FormCreateRange } from '../../components/form-create-range/form-create-range';
import { SymbolsRange } from '../../types';
import { useNavigate } from 'react-router-dom';

const SCROLL_THUMB_WIDTH = 4;
const ITEM_HEIGHT = 100;
const MIN_ITEM_WIDTH = 80;

interface ListRowParams extends SymbolsRange {
  onClick: (code: number) => void;
  columnCount: number;
}

interface GridParams {
  columnCount: number;
  columnWidth: number;
  rowCount: number;
}

export const CreatePage: FC = () => {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>();
  const itemDataRef = useRef<ListRowParams | null>({
    onClick: (code: number) => {
      console.log(`code: %s`, code);
    },
    columnCount: 0,
    begin: 0,
    end: 0,
  });

  const [size, setSize] = useState<{ width: number; height: number }>();
  const [gridParams, setGridParams] = useState<GridParams | null>(null);
  const [range, setRange] = useState<SymbolsRange | null>(null);
  const [active, setActive] = useState<{ code: number, mnemonic?: string; name?: string } | undefined>();

  // Window resize handler
  useEffect(() => {
    const div = pageRef.current;
    const updateSize = () => {
      setSize({ width: div.offsetWidth, height: div.offsetHeight });
    };
    updateSize();

    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Compute items count
  useEffect(() => {
    if (!size) {
      return;
    }

    const offsetWidth = size.width - SCROLL_THUMB_WIDTH;

    const columnCount = Math.max(Math.floor(offsetWidth / MIN_ITEM_WIDTH), 1);
    const columnWidth = Math.floor((offsetWidth / columnCount) * 100) / 100;

    const rowCount = Math.ceil((range.end - range.begin) / columnCount);

    itemDataRef.current.columnCount = columnCount;
    itemDataRef.current.begin = range.begin;
    itemDataRef.current.end = range.end;

    setGridParams({ columnCount, rowCount, columnWidth });
  }, [size, range]);

  return (
    <div className="create-page">
      <div className="form-overlay">
        <FormCreateRange onChange={setRange} onGoBack={() => navigate('/')} />
      </div>

      <div className="page-content">
        <div className="container" ref={pageRef}>
          {size && gridParams ? (
            <Grid
              columnCount={gridParams.columnCount}
              columnWidth={gridParams.columnWidth}
              height={size.height}
              rowCount={gridParams.rowCount}
              rowHeight={ITEM_HEIGHT}
              width={size.width}
              itemData={itemDataRef.current}
            >
              {Cell}
            </Grid>
          ) : null}
        </div>
      </div>

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
