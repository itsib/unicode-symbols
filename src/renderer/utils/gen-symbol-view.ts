import { SymbolSkinColor } from '@app-types';

const SKIN_CODE: Record<SymbolSkinColor, number> = {
  [0]: 0,       //    Type 1 - Pale white
  [1]: 0x1F3FB, // 🏻 Type 2 - White
  [2]: 0x1F3FC, // 🏼 Type 3 - Light brown
  [3]: 0x1F3FD, // 🏽 Type 4 - Medium brown
  [4]: 0x1F3FE, // 🏾 Type 5 - Brown
  [5]: 0x1F3FF, // 🏿 Type 6 - Black
};

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

export function genSymbolCodes(code: number | number[], skin: SymbolSkinColor = 0): number[] {
  if (typeof code === 'number') {
    if (code > 0xFFFFFFFF) {
      const stringCode = code.toString(16);
      code = [
        parseInt(stringCode.slice(0, stringCode.length / 2), 16),
        parseInt(stringCode.slice(stringCode.length / 2), 16),
      ]
    } else {
      const hex = code.toString(16).toLowerCase();
      if (hex.length === 6 && hex.endsWith('20e3')) {
        code = [
          parseInt(hex.slice(0, 2), 16),
          parseInt(hex.slice(2), 16),
        ]
      }
    }
  }

  const set = typeof code === 'number' ? [code] : [...code];

  if (skin) {
    return [...set, SKIN_CODE[skin]];
  }

  return set;
}

export function genSymbolView(codesSet: number[], output: SymbolCodeOutput): string {
  return codesSet.map(code => codeConverter(code, output)).join('').trim();
}