import { type Codepoint, SymbolSkinColor } from '@app-types';
import { SKIN_CODE, UNICODE_ZWJ, UNICODE_VS16 } from '../constants/unicode';

export enum SymbolCodeOutput {
  DEC,
  HTML,
  CSS,
  HEX,
}

function codeConverter(code: number, output: SymbolCodeOutput): string {
  switch (output) {
    case SymbolCodeOutput.DEC:
      return `0x${code.toString(10)} `;
    case SymbolCodeOutput.HEX:
      return `0x${code.toString(16).toUpperCase()} `;
    case SymbolCodeOutput.HTML:
      return `&#${code.toString(10)};`
    case SymbolCodeOutput.CSS:
      return `\\${code.toString(16)}`;
  }
}

export function genSymbolCodes(code: Codepoint, skin: SymbolSkinColor = 0, variant?: boolean): number[] {
  const set = typeof code === 'number' ? [code] : [...code];

  if (set.includes(UNICODE_VS16) && !variant) {
    return set.filter(i => i !== UNICODE_VS16);
  }

  if (skin) {
    return [...set, UNICODE_ZWJ, SKIN_CODE[skin]];
  }

  return set;
}

export function genSymbolView(codesSet: number[], output: SymbolCodeOutput): string {
  return codesSet.map(code => codeConverter(code, output)).join('').trim();
}
