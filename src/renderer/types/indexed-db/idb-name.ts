export interface IdbName {
  /**
   * Symbol code
   * c = code
   */
  c: number;
  /**
   * Start code if name of symbols range
   */
  s?: number;
  /**
   * Symbol name, en
   * n = name
   */
  n: string;
  /**
   * Keywords for search by name
   */
  k: string[];
}