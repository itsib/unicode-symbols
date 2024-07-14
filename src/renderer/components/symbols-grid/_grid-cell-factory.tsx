import React from 'react';
import { GridChildComponentProps } from 'react-window';
import { ImgSymbol } from '../images/img-symbol';

export type ExtendData = Record<string, any>;

export type IGridCellFactory<T extends ExtendData> = T & {
  onClick: (code: number) => void;
  getSymbolCode: (rowIndex: number, columnIndex: number, data: IGridCellFactory<T>) => number | null;
}

export function GridCellFactory<T extends ExtendData = ExtendData>({ style, rowIndex, columnIndex, data }: GridChildComponentProps<IGridCellFactory<T>>) {
  const { onClick, getSymbolCode } = data;
  const code = getSymbolCode(rowIndex, columnIndex, data);

  return code == null ? null : (
    <div style={style} className="grid-cell" data-code={code} onClick={() => onClick(code)}>
      <div className="inner-container">
        <ImgSymbol className="symbol" size="1.3em" code={code} />
        <div className="separator"/>
        <div className="subscribe">
          <span>0x{code.toString(16).toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
