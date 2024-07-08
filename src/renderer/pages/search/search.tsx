import React, { CSSProperties, FC, useEffect, useRef, useState } from 'react';
import { useSize } from '../../hooks/use-size';
import { FixedSizeGrid as Grid, FixedSizeGridProps } from 'react-window';
import { ISymbolCell, SymbolCell } from '../../components/symbol-cell/symbol-cell';
import { getMinSymbolWidth } from '../../utils/get-min-symbol-width';
import { SCROLL_THUMB_WIDTH, SYMBOL_ITEM_ASPECT_RATIO } from '../../constants/common';
import { ModalCreateSymbol } from '../../components/modal-create-symbol/modal-create-symbol';
import { FormControlInput, FormControlSelect } from '../../components/forms';
import SearchIcon from '../../../assets/images/search-book.svg';
import { useIdbSearchSymbol } from '../../hooks/indexed-db/use-idb-search-symbol';
import { useAppConfig } from '../../hooks/use-app-config';
import { AppConfigKey } from '@app-context';
import { useIdbBlockSelectorOptions } from '../../hooks/indexed-db/use-idb-block-selector-options';

export const SearchPage: FC = () => {
  const size = useSize('search-page-grid-container');
  const [iconSize] = useAppConfig(AppConfigKey.IconSize);

  const [search, setSearch] = useState('');
  const [block, setBlock] = useState<number | null>(1);

  const foundCodes = useIdbSearchSymbol(search);
  const options = useIdbBlockSelectorOptions();

  const [gridProps, setGridProps] = useState<Omit<FixedSizeGridProps, 'children'> | null>(null);
  const [active, setActive] = useState<{ code: number } | null>(null);

  const itemDataRef = useRef<ISymbolCell<{ columnCount: number, foundCodes: number[] }>>({
    columnCount: 0,
    foundCodes: [],
    onClick: (code: number) => setActive({ code }),
    getSymbolCode: (rowIndex: number, columnIndex: number, data: ISymbolCell<{
      columnCount: number,
      foundCodes: number[]
    }>) => {
      const index = (data.columnCount * rowIndex) + columnIndex;
      return data.foundCodes[index];
    },
  });

  // Compute items count
  useEffect(() => {
    if (!size || !size.height || !size.width) {
      return;
    }
    const minItemWidth = getMinSymbolWidth(iconSize);
    const itemHeight = minItemWidth * SYMBOL_ITEM_ASPECT_RATIO;

    const offsetWidth = size.width - SCROLL_THUMB_WIDTH;
    const columnCount = Math.max(Math.floor(offsetWidth / minItemWidth), 1);
    const columnWidth = Math.floor((offsetWidth / columnCount) * 100) / 100;

    const rowCount = Math.ceil((foundCodes?.length ?? 0) / columnCount);

    itemDataRef.current.columnCount = columnCount;
    itemDataRef.current.foundCodes = foundCodes;

    setGridProps({
      columnCount,
      columnWidth,
      height: size.height,
      rowCount,
      rowHeight: itemHeight,
      width: size.width,
      itemKey: ({ columnIndex, data, rowIndex }) => {
        const index = (data.columnCount * rowIndex) + columnIndex;
        const code = data.foundCodes[index];
        return code ? code : `${columnIndex}-${rowIndex}`;
      },
    });
  }, [size, foundCodes, iconSize]);

  return (
    <div className="search-page">
      <div className="form-overlay">
        <h4 className="caption">
          <span>What are you looking for?</span>
        </h4>

        <form className="form">
          <div className="form-control">
            <FormControlInput
              id="search-input"
              name="search"
              type="search"
              label="Search by name or code"
              value={search}
              onChange={setSearch}
            />
          </div>

          <div className="form-control">
            <FormControlSelect<number>
              id="block-selector"
              name="block"
              label="Choose the section of unicode"
              value={block}
              onChange={setBlock}
              options={options}
            />
          </div>

        </form>
      </div>

      <div className="page-content">
        <div
          id="search-page-grid-container"
          className="container"
          style={{ '--symbol-cell-size': `${iconSize}px` } as CSSProperties}
        >
          {size && gridProps ? (
            <Grid itemData={itemDataRef.current} {...gridProps}>{SymbolCell}</Grid>
          ) : null}
        </div>

        {!foundCodes?.length ? (
          <div className="search-placeholder">
            <img src={SearchIcon} alt="Search"/>

            <div className="title">
              <span>Start a search to see the results</span>
            </div>
          </div>
        ) : null}
      </div>

      <ModalCreateSymbol isOpen={!!active} code={active?.code} onDismiss={() => setActive(null)}/>
    </div>
  );
};
