import React from 'react';
import { GridChildComponentProps } from 'react-window';
import { ImgSymbol } from '../images/img-symbol';
import { genSymbolCodes } from '../../utils/gen-symbol-view';

export type ExtendData = Record<string, any>;

export type IGridCellFactory<T extends ExtendData> = T & {
  onClick: (code: number | string) => void;
  getSymbolCode: (rowIndex: number, columnIndex: number, data: IGridCellFactory<T>) => number | string | null;
}

export function GridCellFactory<T extends ExtendData = ExtendData>({ style, rowIndex, columnIndex, data }: GridChildComponentProps<IGridCellFactory<T>>) {
  const { onClick, getSymbolCode } = data;
  let code = getSymbolCode(rowIndex, columnIndex, data);
  let codes: number[] | null = null;

  if(typeof code === 'number' && code > 0xffffffff) {
    codes = genSymbolCodes(code);
  }

  return code == null ? null : (
    <div style={style} className="grid-cell" data-code={code} onClick={() => onClick(code)}>
      <div className="inner-container">
        <ImgSymbol className="symbol" size="1.3em" code={code} />
        <div className="separator"/>
        <div className="subscribe">
          {codes ? (
            <>
              {codes.map((_code, i) => (<div key={i}>0x{_code.toString(16).toUpperCase()}</div>))}
            </>
          ) : (
            <div>0x{code.toString(16).toUpperCase()}</div>
          )}
        </div>
      </div>
    </div>
  );
}
