import React, { memo } from 'react';
import { genSymbolCodes } from '../../utils/gen-symbol-view';
import { SymbolSkinColor } from '@app-types';

export interface IImgSymbol extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  size?: number | string;
  code?: number | number[];
  skin?: SymbolSkinColor;
}

export const ImgSymbol = memo(function IImgSymbol({ size = 42, code, skin, ...props }: IImgSymbol) {
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
      {Array.isArray(code) ? (
        <>{String.fromCodePoint(...code)}</>
      ) : code ? (
        <>{String.fromCodePoint(...genSymbolCodes(code, skin))}</>
      ) : null}
    </div>
  );
});
