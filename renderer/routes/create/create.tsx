import React, { FC, useEffect, useRef, useState } from 'react';
import { FixedSizeGrid as Grid, GridChildComponentProps } from 'react-window';
import './create.css';

const ITEM_HEIGHT = 100;
const ITEM_WIDTH = 80;

type ListRowData = { callback: (code: number) => void; totalColumns: number };

export const CreatePage: FC = ({}) => {
  const pageRef = useRef<HTMLDivElement>();
  const itemDataRef = useRef<ListRowData | null>({
    callback: (code: number) => {
      console.log(`code: %s`, code);
    },
    totalColumns: 0,
  });

  const [size, setSize] = useState<{ width: number; height: number }>();
  const [counts, setCounts] = useState<{ columnCount: number; rowCount: number }>();
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

    const begin = 0x2700;
    const finish = 0x27BF;
    let columnCount = Math.floor((size.width - 4) / ITEM_WIDTH);
    columnCount = Math.max(columnCount, 1);
    columnCount = Math.min(columnCount, 10);
    const rowCount = Math.ceil((finish - begin) / columnCount);

    itemDataRef.current.totalColumns = columnCount;

    setCounts(old => {
      if (!old || (old && (old.columnCount !== columnCount || old.rowCount !== rowCount))) {
        return { columnCount, rowCount };
      }
      return old;
    });
  }, [size]);

  return (
    <div className="create-page">
      <div className="container" ref={pageRef}>
        {size && counts ? (
          <Grid
            columnCount={counts.columnCount}
            columnWidth={ITEM_WIDTH}
            height={size.height}
            rowCount={counts.rowCount}
            rowHeight={ITEM_HEIGHT}
            width={size.width}
            itemData={itemDataRef.current}
          >
            {Cell}
          </Grid>
        ) : null}
      </div>
    </div>
  );
};

const Cell: FC<GridChildComponentProps<ListRowData>> = ({ columnIndex, rowIndex, style, data: { callback, totalColumns } }) => {
  const code = (totalColumns * rowIndex) + columnIndex;
  return (
    <div style={style} className="cell" onClick={() => callback(code)}>
      <div className="symbol">
        <span dangerouslySetInnerHTML={{ __html: `&#${code};` }}/>
      </div>
      <div className="separator"/>
      <div className="subscribe">
        <span>0x{code.toString(16).toUpperCase()}</span>
      </div>
    </div>
  )
};
