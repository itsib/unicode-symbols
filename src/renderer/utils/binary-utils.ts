/**
 * ℹ️ We used Big-endian (BE) bytes order. It means,
 * that the bit number is counted from the right and starts
 * from zero.
 *
 * @example
 * A bit index:   3210
 * Flags:       0b1001
 */

/**
 * Check bit number. (0 <= bitNum && bitNum < 32)
 * @param bitNumber
 */
export function validateIndex(bitNumber: number): void {
  if (bitNumber >= 0 && bitNumber < 32) {
    return
  }
  throw new Error(`Invalid bit number value: ${bitNumber}`);
}

/**
 * Sets the selected bit to 0
 * @param flags
 * @param index
 */
export function bitOff(flags: number, index: number): number {
  validateIndex(index);
  return flags & ~(1 << index);
}

/**
 * Sets the selected bit to 1
 * @param flags
 * @param index
 */
export function bitOn(flags: number, index: number): number {
  validateIndex(index);
  return flags | (1 << index);
}

/**
 * Sets the selected bit, if turnOn is true, then bit turn on
 * @param flags
 * @param index
 * @param value
 */
export function bitSet(flags: number, index: number, value: boolean): number {
  validateIndex(index);
  return value ? bitOn(flags, index) : bitOff(flags, index);
}

/**
 * Flip the selected bit to the opposite position
 * @param flags
 * @param index
 */
export function bitToggle(flags: number, index: number): number {
  validateIndex(index);
  return flags ^ (1 << index);
}

/**
 * Checking the status of the bit. Returns true if the bit is 1
 * @param flags
 * @param index
 */
export function isBitOn(flags: number, index: number): boolean {
  validateIndex(index);
  return !!(flags & (1 << index));
}

/**
 * Check for all bits status is true
 * @param flags
 * @param length bits count in flags
 */
export function isAllBitsOn(flags: number, length: number): boolean {
  validateIndex(length - 1);
  const mask = -1 >>> (32 - length);
  return !(flags ^ mask);
}
