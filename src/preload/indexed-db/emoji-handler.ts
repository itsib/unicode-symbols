const MOD_SKIN = 0x1F3FF; // 0x1F3FB, 0x1F3FC, 0x1F3FD, 0x1F3FE, 0x1F3FF

const JOINER = 0x200D;

const RESTYLE = 0xFE0F;

export class EmojiHandler {
  /**
   * Max store size
   * @private
   */
  private readonly _max: number;
  /**
   * Char codes store
   * @private
   */
  private readonly _store = new Set<number>();

  private _skin = new Set<number>();

  private _join = new Map<number, number[]>();

  constructor(maxSize: number) {
    this._max = maxSize;
  }

  push(codes: number[]): void {
    if (isNaN(codes[0])) {
      return console.error('Invalid codes: %o', codes);
    }

    if (this._store.has(codes[0])) {
      return;
    }

    if (this._store.size >= this._max) {
      throw new Error('OVERFLOW');
    }

    const [code, ...mods] = codes;
    this._store.add(code);

    if (!mods || !mods.length) {
      return;
    }

    for (let i = 0; i < mods.length; i++) {
      const mod = mods[i];

      // Supports skin color
      if ((MOD_SKIN^mod) <= 4) {
        this._skin.add(code);
        break;
      } else if (JOINER === mod) {

      }
    }

  }

  refund(): number[] {
    if (this._store.size === 0) {
      return [];
    }

    const result = Array.from(this._store);
    this._store.clear();

    result.sort((a, b) => b - a);

    return result;
  }

  getSkinSupport(): Set<number> | undefined {
    if (this._skin.size) {
      const skin = this._skin;
      this._skin = new Set<number>();
      return skin;
    }
  }

  get isFull(): boolean {
    return this._store.size === this._max;
  }
}