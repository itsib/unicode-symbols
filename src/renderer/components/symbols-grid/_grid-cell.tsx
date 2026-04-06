import { ImgSymbol } from '../images/img-symbol';
import { FormatSymbolCode } from '../formatters/format-symbol-code';
import React, { ReactElement } from 'react';
import type { CellComponentProps } from 'react-window'
import { genSymbolCodes } from '../../utils/gen-symbol-view';
import './_cell-component.css'

export interface GridCellProps {
  data: number[];
  onClick: (code: number) => void;
  numberBase: number;
  columnCount: number;
}

export function GridCell(props: CellComponentProps<GridCellProps>): ReactElement | null {
  const { style, data, rowIndex, columnIndex, numberBase, onClick, ariaAttributes, columnCount } = props
  const index = (columnCount * rowIndex) + columnIndex;
  const code = data[index];

  if (code == null) return null;

  let codes: number[] | null = null;
  if (typeof code === 'number' && code > 0xffffffff) {
    codes = genSymbolCodes(code);
  }

  return (
    <div style={style} className="grid-cell" data-code={code} onClick={() => onClick(code)} {...ariaAttributes}>
      <div className="inner-container">
        <ImgSymbol className="symbol" size="1.3em" code={codes || code} />
        <div className="separator"/>
        <div className="subscribe">
          {codes ? (
            <>
              {codes.map((_code, i) => (<FormatSymbolCode key={i} code={_code} base={numberBase} />))}
            </>
          ) : (
            <FormatSymbolCode code={code} base={numberBase} />
          )}
        </div>
      </div>
    </div>
  )
}
