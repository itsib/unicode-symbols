import { ImgSymbol } from '../images/img-symbol';
import { FormatSymbolCode } from '../formatters/format-symbol-code';
import React, { ReactElement } from 'react';
import type { CellComponentProps } from 'react-window'
import { genSymbolCodes } from '../../utils/gen-symbol-view';
import './_cell-component.css'
import type { Codepoint } from '@app-types';

export interface GridCellProps {
  data: Codepoint[];
  onClick: (code: Codepoint) => void;
  numberBase: number;
  columnCount: number;
}

export function GridCell(props: CellComponentProps<GridCellProps>): ReactElement | null {
  const { style, data, rowIndex, columnIndex, numberBase, onClick, ariaAttributes, columnCount } = props
  const index = (columnCount * rowIndex) + columnIndex;
  const code = data[index];

  if (code == null) return null;

  return (
    <div style={style} className="grid-cell" onClick={() => onClick(code)} {...ariaAttributes}>
      <div className="inner-container">
        <ImgSymbol className="symbol" size="1.3em" code={code} />
        <div className="separator"/>
        <div className="subscribe">
          {Array.isArray(code) ? (
            <>
              {code.map((_code, i) => (<FormatSymbolCode key={i} code={_code} base={numberBase} />))}
            </>
          ) : (
            <FormatSymbolCode code={code} base={numberBase} />
          )}
        </div>
      </div>
    </div>
  )
}
