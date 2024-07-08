import React from 'react';
import { GridChildComponentProps } from 'react-window';

export type ExtendData = Record<string, any>;

export type ISymbolCell<T extends ExtendData> = T & {
  onClick: (code: number) => void;
  getSymbolCode: (rowIndex: number, columnIndex: number, data: ISymbolCell<T>) => number | null;
}

export function SymbolCell<T extends ExtendData = ExtendData>({ style, rowIndex, columnIndex, data }: GridChildComponentProps<ISymbolCell<T>>) {
  const { onClick, getSymbolCode } = data;
  const code = getSymbolCode(rowIndex, columnIndex, data);

  return code == null ? null : (
    <div style={style} className="symbol-cell" onClick={() => onClick(code)} onContextMenu={() => window.appAPI.showContextMenu(code)}>
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
}