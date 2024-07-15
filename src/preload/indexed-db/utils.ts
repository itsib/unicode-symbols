const SKIN_MOD = 0x1F3FF; // 0x1F3FB, 0x1F3FC, 0x1F3FD, 0x1F3FE, 0x1F3FF

const HAIR_MOD = 0x1F9B3; // 0x1F9B0, 0x1F9B1, 0x1F9B2, 0x1F9B3

const JOINER = 0x200D;

const RESTYLE = 0xFE0F;

const IGNORE_KEYWORDS = ['SIGN', 'ONE', 'WITH', 'LETTER', 'MARK'];

const DEFAULT_ICON = 'star.svg'

const MENU_ICONS: Record<number, string> = {
  [1]: 'smiles.svg',
  [2]: 'brain.svg',
  [3]: 'animals.svg',
  [4]: 'food.svg',
  [5]: 'airplane.svg',
  [6]: 'activities.svg',
  [7]: 'objects.svg',
  [8]: 'letters.svg',
  [9]: 'flags.svg',
};

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

export interface IdbBlock {
  /**
   * Block ID
   */
  i: number;
  /**
   * Plane id
   */
  p: number;
  /**
   * Block Name
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

export interface IdbName {
  /**
   * Symbol code or end code if range
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

export interface IdbEmoji {
  /**
   * Code
   */
  c: number;
  /**
   * Emoji name
   */
  n: string;
  /**
   * Emoji group
   */
  g: number;
  /**
   * Skin supports
   */
  s: boolean;
}

export function parseCode(raw: string): number | null {
  if (!raw) {
    return null;
  }
  const parsed = parseInt(raw, 16);
  if (parsed == null || isNaN(parsed)) {
    console.warn(`Parse error`, raw);
    return null;
  }
  return parsed;
}

export function parseBlock(id: number, planeIndex: number, line: string): IdbBlock {
  const [range, name] = line.split(';');
  const [beginStr, end] = range.split('..');
  const begin = parseInt(beginStr.trim(), 16);

  return {
    i: id,
    p: planeIndex,
    n: name.trim(),
    b: begin,
    e: parseInt(end.trim(), 16),
  } as IdbBlock;
}

export function parseName(line: string): IdbName | null {
  const [codesRaw, nameRaw] = line.split(';');
  const [codeRaw, endRaw] = codesRaw.split('..');
  const name = nameRaw
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      if (word.length > 1) {
        return word.toLowerCase();
      }
      return word;
    })
    .join(' ');


  const code = parseInt((endRaw ? endRaw : codeRaw).trim(), 16);
  const start = endRaw ? parseInt(codeRaw.trim(), 16) : undefined;
  const keywords = nameRaw
    .split(/[\s-_]+/)
    .filter((word: string) => {
      return word.length > 2 && !IGNORE_KEYWORDS.includes(word.toUpperCase())
    });

  const idbName: IdbName = {
    c: code,
    n: name,
    k: keywords,
  };

  if (start) {
    idbName.s = start;
  }

  return idbName;
}

export function parseMenuItem(line: string, id: number): IdbMenuItem {
  const name = line.replace('# group:', '').trim();
  const icon = MENU_ICONS[id] || DEFAULT_ICON;

  return {
    i: id,
    n: name,
    icon: icon,
    o: id,
  }
}

export function parseEmoji(line: string, menuId: number): IdbEmoji | null {
  let [codesRaw, skinRaw, name] = line.split(';');
  codesRaw = codesRaw.trim();
  if (!codesRaw)  {
    return null;
  }
  const skin = JSON.parse(skinRaw) as boolean;

  // Parse codes
  const splitCodes = codesRaw.split(',');
  const code = splitCodes.length === 1 ? parseInt(splitCodes[0], 16) : parseInt(splitCodes.join(''), 16);

  return {
    c: code,
    n: name,
    g: menuId,
    s: skin,
  }
}

export function extractError(error: any): Error {
  return new Error((error?.target as any)?.error);
}