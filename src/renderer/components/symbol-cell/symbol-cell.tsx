import React, { FC } from 'react';
import { GridChildComponentProps } from 'react-window';

export interface ISymbolCell {
  onClick: (code: number) => void;
  getSymbolCode: (rowIndex: number, columnIndex: number) => number | null;
}

export const SymbolCell: FC<GridChildComponentProps<ISymbolCell>> = ({ style, rowIndex, columnIndex, data }) => {
  const { onClick, getSymbolCode } = data;
  const code = getSymbolCode(rowIndex, columnIndex);

  return code == null ? null : (
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
