export interface IdbMenuItem {
  /**
   * Menu item ID
   */
  i: number;
  /**
   * Menu item label
   */
  n: string;
  /**
   * Menu icon Base64 encoded string or icon url
   */
  icon: string;
  /**
   * Sort order index
   */
  o: number;
}