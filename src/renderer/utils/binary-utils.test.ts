import { expect, describe, it, onTestFailed } from 'vitest';
import { isAllBitsOn, isBitOn, bitToggle, validateIndex, bitSet, bitOn, bitOff } from "./binary-utils";

describe('renderer/utils/binary-utils.ts', () => {
  describe('#validateIndex', () => {
    it('Should works if index in range 0-31', () => {
      for (let i = 0; i < 32; i++) {
        expect(() => validateIndex(i)).not.toThrow();
      }
    })
    describe ('Should throw if out of bounds', () => {
      it('Should throw if index -1', () => {
        expect(() => validateIndex(-1)).toThrow('Invalid bit number value');
      })
      it('Should throw if index 32', () => {
        expect(() => validateIndex(32)).toThrow('Invalid bit number value');
      })
      it('Should throw if index NaN', () => {
        expect(() => validateIndex(NaN)).toThrow('Invalid bit number value');
      })
      it('Should throw if index Infinity', () => {
        expect(() => validateIndex(Infinity)).toThrow('Invalid bit number value');
      })
      it('Should throw if index -Infinity', () => {
        expect(() => validateIndex(-Infinity)).toThrow('Invalid bit number value');
      })
    })
  });

  it('#bitOff', () => {
    expect(bitOff(0b0101, 2)).toEqual(0b0001);
    expect(bitOff(0b0101, 1)).toEqual(0b0101);
    expect(bitOff(0b0101, 0)).toEqual(0b0100);
  });

  it('#bitOn', () => {
    expect(bitOn(0b0101, 2)).toEqual(0b0101);
    expect(bitOn(0b0101, 1)).toEqual(0b0111);
    expect(bitOn(0b0101, 0)).toEqual(0b0101);
  });

  it('#bitSet', () => {
    expect(bitSet(0b0101, 1, true)).toEqual(0b0111);
    expect(bitSet(0b0111, 1, false)).toEqual(0b0101);
    expect(bitSet(0b0101, 3, true)).toEqual(0b1101);
    expect(bitSet(0b1101, 3, false)).toEqual(0b0101);
  });

  it('#bitToggle', () => {
    expect(bitToggle(0b0101, 1)).toEqual(0b0111);
    expect(bitToggle(0b0111, 1)).toEqual(0b0101);
    expect(bitToggle(0b0101, 3)).toEqual(0b1101);
    expect(bitToggle(0b1101, 3)).toEqual(0b0101);
    expect(bitToggle(bitToggle(0b1101, 3), 3)).toEqual(0b1101);
  });

  it('#isBitOn', () => {
    expect(isBitOn(0b0101, 1)).toBeFalsy();
    expect(isBitOn(0b0111, 1)).toBeTruthy();
    expect(isBitOn(0b0101, 3)).toBeFalsy();
    expect(isBitOn(0b1101, 3)).toBeTruthy();
  });

  it('#isAllBitsOn', () => {
    expect(isAllBitsOn(0b0101, 4)).toBeFalsy();
    expect(isAllBitsOn(0b0111, 4)).toBeFalsy();
    expect(isAllBitsOn(0b0101, 4)).toBeFalsy();
    expect(isAllBitsOn(0b1111, 4)).toBeTruthy();
    expect(isAllBitsOn(0b1111, 5)).toBeFalsy();
  });
})


