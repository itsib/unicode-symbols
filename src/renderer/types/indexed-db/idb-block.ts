export interface IdbBlock {
  /**
   * Block ID
   */
  i: number,
  /**
   * Plane name index (reference to the primary key of store 'planes')
   */
  p: number
  /**
   * Block Name of Unicode space
   */
  n: string;
  /**
   * Symbol key for begin range
   */
  b: number;
  /**
   * Symbol key for end range
   */
  e: number;
}
