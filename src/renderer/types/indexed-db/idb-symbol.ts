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
   * Group id includes symbol
   */
  g: number;
}