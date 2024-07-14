const MOD_SKIN = 0x1F3FF; // 0x1F3FB, 0x1F3FC, 0x1F3FD, 0x1F3FE, 0x1F3FF

const JOINER = 0x200D;

const RESTYLE = 0xFE0F;

const IGNORE_KEYWORDS = ['SIGN', 'ONE', 'WITH', 'LETTER', 'MARK'];

const DEFAULT_ICON = 'star.svg'

const MENU_ICONS: Record<number, string> = {
  [1]: 'smiles.svg',
  [2]: 'brain.svg',
  [3]: 'component.svg',
  [4]: 'animals.svg',
  [5]: 'food.svg',
  [6]: 'airplane.svg',
  [7]: 'activities.svg',
  [8]: 'objects.svg',
  [9]: 'letters.svg',
  [10]: 'flags.svg',
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
   * Plane id
   */
  p: number;
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
   * Restyle support
   */
  r: boolean;
  /**
   * Keywords for search by name
   */
  k: string[];
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

export function parseSymbol(line: string): IdbSymbol {
  line = line.trim();
  const [code, nameRaw] = line.split(';');
  const name = nameRaw.trim();

  const id = parseInt(code.trim(), 16);
  const keywords = name
    .split(/[\s-_]+/)
    .filter((word: string) => {
      return word.length > 2 && !IGNORE_KEYWORDS.includes(word.toUpperCase())
    });

  return {
    i: id,
    n: name,
    p: undefined,
    b: undefined,
    l: undefined,
    s: false,
    r: false,
    k: keywords,
  };
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

export function parseEmoji(line: string): { code: number; skin: boolean; restyle: boolean; } | null {
  const clean = line.split('#')[0].trim();
  const [codesRaw, supports] = clean.split(';');
  if (!codesRaw || !supports)  {
    return null;
  }
  const codesSplit = codesRaw.split(/\s+/);
  let code: number | null = null;
  let joined: number | null = null;
  let skin = false;
  let restyle = false;

  while (codesSplit.length > 0) {
    const codeRaw = codesSplit.shift();
    const parsed = parseCode(codeRaw);
    if (!parsed) {
      continue;
    }
    // First should be code
    if (code === null) {
      code = parsed;
      continue;
    }

    // Found joiner code
    if (parsed === JOINER) {
      const _code = parseCode(codesSplit.shift());
      if (!_code) {
        console.warn('No code after join')
        continue;
      }
      joined = _code;
      continue;
    }

    // Check support skin color select
    if (joined === null && (MOD_SKIN^parsed) <= 4) {
      skin = true;
      continue;
    }

    // Style switch support
    if (joined === null && parsed === RESTYLE) {
      restyle = true;
    }
  }

  return {
    code,
    skin,
    restyle,
  }
}

export function extractError(error: any): Error {
  return new Error((error?.target as any)?.error);
}