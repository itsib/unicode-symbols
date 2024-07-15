import React, { memo } from 'react';
import { genSymbolCodes, genSymbolView, SymbolCodeOutput } from '../../utils/gen-symbol-view';

export interface IImgSymbol extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  size?: number | string;
  code?: string | number;
}

export const ImgSymbol = memo(function IImgSymbol({ size = 42, code, ...props }: IImgSymbol) {
  let html: string;
  if (typeof code === 'number') {
    html = genSymbolView(genSymbolCodes(code), SymbolCodeOutput.HTML);
  } else {
    html = code;
  }

  return (
    <div
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        aspectRatio: '1',
        fontSize: typeof size === 'number' ? `${Math.round(size * 0.8)}px` : 'inherit',
        lineHeight: typeof size === 'number' ? `${size}px` : size,
        textAlign: 'center'
      }}
      {...props}
    >
      {code ? <span dangerouslySetInnerHTML={{ __html: html }}/> : null}
    </div>
  );
});
