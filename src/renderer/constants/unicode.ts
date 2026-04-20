import type { SymbolSkinColor } from '@app-types';

export const SKIN_CODE: Record<SymbolSkinColor, number> = {
  [0]: 0,       //    Type 1 - Pale white
  [1]: 0x1F3FB, // 🏻 Type 2 - White
  [2]: 0x1F3FC, // 🏼 Type 3 - Light brown
  [3]: 0x1F3FD, // 🏽 Type 4 - Medium brown
  [4]: 0x1F3FE, // 🏾 Type 5 - Brown
  [5]: 0x1F3FF, // 🏿 Type 6 - Black
};

/**
 * Zero Width Join
 * @type {number}
 */
export const UNICODE_ZWJ = 0x200D;

/**
 * Variation Selector 16
 * @type {number}
 */
export const UNICODE_VS16 = 0xFE0F;
