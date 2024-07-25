import React from 'react';
import { GridChildComponentProps } from 'react-window';
import { ImgSymbol } from '../images/img-symbol';
import { genSymbolCodes } from '../../utils/gen-symbol-view';
import { FormatSymbolCode } from '../formatters/format-symbol-code';

export type ExtendData = Record<string, any>;

export type IGridCellFactory<T extends ExtendData> = T & {
  numberBase: number;
  onClick: (code: number | string) => void;
  getSymbolCode: (rowIndex: number, columnIndex: number, data: IGridCellFactory<T>) => number | string | null;
}

export function GridCellFactory<T extends ExtendData = ExtendData>({ style, rowIndex, columnIndex, data }: GridChildComponentProps<IGridCellFactory<T>>) {
  const { onClick, getSymbolCode, numberBase } = data;
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
              {codes.map((_code, i) => (<FormatSymbolCode key={i} code={_code} base={numberBase} />))}
            </>
          ) : typeof code === 'number' ? (
            <FormatSymbolCode code={code} base={numberBase} />
          ) : (
            <>{code}</>
          )}
        </div>
      </div>
    </div>
  );
}
