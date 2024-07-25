import { FC } from 'react';

export interface IFormatSymbolCode {
  code: number;
  base: number;
}

export const FormatSymbolCode: FC<IFormatSymbolCode> = ({ code, base }) => {
  return (
    <div>
      {base === 16 ? '0x' : base === 2 ? 'b' : ''}
      {code.toString(base).toUpperCase()}
    </div>
  );
};