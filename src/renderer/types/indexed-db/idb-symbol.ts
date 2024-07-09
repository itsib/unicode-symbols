/**
 * Field names have been shortened
 * to save space in the database.
 */
export interface IdbSymbol {
  /**
   * Symbol code in unicode.
   * i = id
   */
  i: number;
  /**
   * Symbol name in en
   * n = name
   */
  n: string;
  /**
   * Block id includes symbol
   */
  b: number;
  /**
   * Left menu link
   */
  l: number | undefined;
  /**
   * Skin color support
   */
  s: boolean;
  /**
   * Keywords for search by name
   */
  k: string[];
}