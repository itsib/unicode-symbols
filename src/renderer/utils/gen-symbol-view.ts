import { type Codepoint, type SymbolMeta, SymbolSkinColor } from '@app-types';
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

export function genSymbolCodes(code: Codepoint, meta?: SymbolMeta | null, opts?: { skin?: SymbolSkinColor; isSecondVariant?: boolean }): number[] {
  const { isSecondVariant, skin = 0 } = opts || {}
  const mainCode = typeof code === 'number' ? code : code[0]

  if (meta?.isSupportSkin && skin) {
    return [mainCode, SKIN_CODE[skin]];
  }

  if (meta?.isSupportVariants && !isSecondVariant) {
    return [mainCode, UNICODE_VS16]
  } else {
    return [mainCode];
  }
}

export function genSymbolView(codesSet: number[], output: SymbolCodeOutput): string {
  return codesSet.map(code => codeConverter(code, output)).join('').trim();
}
