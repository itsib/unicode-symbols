import { IdbBlock, IdbName, IdbEmoji, IdbMenuItem, IdbStoreName } from '@app-types';
import { extractError } from './extract-error';

const SKIN_MOD = 0x1F3FF; // 0x1F3FB, 0x1F3FC, 0x1F3FD, 0x1F3FE, 0x1F3FF

const HAIR_MOD = 0x1F9B3; // 0x1F9B0, 0x1F9B1, 0x1F9B2, 0x1F9B3

const JOINER = 0x200D;

const RESTYLE = 0xFE0F;

const PARSE_NAME_IGNORE_KEYWORDS = ['SIGN', 'ONE', 'WITH', 'LETTER', 'MARK'];

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

/**
 * Creates database stores and indexes
 * @param db
 */
export function initDatabaseStores(db: IDBDatabase) {
  // Delete all static stores
  if (db.objectStoreNames.contains(IdbStoreName.Names)) db.deleteObjectStore(IdbStoreName.Names);
  if (db.objectStoreNames.contains(IdbStoreName.Blocks)) db.deleteObjectStore(IdbStoreName.Blocks);
  if (db.objectStoreNames.contains(IdbStoreName.Menu)) db.deleteObjectStore(IdbStoreName.Menu);
  if (db.objectStoreNames.contains(IdbStoreName.Planes)) db.deleteObjectStore(IdbStoreName.Planes);
  if (db.objectStoreNames.contains(IdbStoreName.Emoji)) db.deleteObjectStore(IdbStoreName.Emoji);

  // Create planes store
  db.createObjectStore(IdbStoreName.Planes, { autoIncrement: true });

  // Create blocks store
  const blocksStore = db.createObjectStore(IdbStoreName.Blocks, { keyPath: 'i' });
  blocksStore.createIndex('id', 'i', { unique: true });
  blocksStore.createIndex('plane', 'p', { unique: false });
  blocksStore.createIndex('begin', 'b', { unique: true });
  blocksStore.createIndex('end', 'e', { unique: true });

  // Create names store
  const namesStore = db.createObjectStore(IdbStoreName.Names, { keyPath: 'c' });
  namesStore.createIndex('code', 'c', { unique: true });
  namesStore.createIndex('start', 's', { unique: false });
  namesStore.createIndex('search', 'k', { unique: false, multiEntry: true });

  // Create emoji store
  const emojiStore = db.createObjectStore(IdbStoreName.Emoji, { keyPath: 'c' });
  emojiStore.createIndex('code', 'c', { unique: false });
  emojiStore.createIndex('group', 'g', { unique: false });

  // Create menu store
  const menuStore = db.createObjectStore(IdbStoreName.Menu, { keyPath: 'i' });
  menuStore.createIndex('order', 'o', { unique: true });
}

/**
 *
 * @param db
 */
export async function initDatabaseData(db: IDBDatabase): Promise<void> {
  await initBlocks(db)
  await initNames(db)
  await initEmoji(db)
}

/**
 * Create indexes for blocks store
 * @param db
 */
async function initBlocks(db: IDBDatabase): Promise<void> {
  const blocks = await window.appAPI.fileRead('blocks.csv');
  const transaction = db!.transaction([IdbStoreName.Blocks, IdbStoreName.Planes], 'readwrite');
  const blockStore = transaction.objectStore(IdbStoreName.Blocks);
  const planeStore = transaction.objectStore(IdbStoreName.Planes);

  let planeIndex = 0
  let blockIndex = 0
  for (let line of blocks.split('\n')) {
    line = line?.trim()


    const plane = line.split('# plane:')[1]?.trim();
    if (plane) {
      planeIndex += 1;
      planeStore.add(plane, planeIndex);
      continue;
    }
    blockIndex += 1;
    const block = parseBlock(blockIndex, planeIndex, line);
    if (block) {
      blockStore.put(block);
    } else {
      blockIndex -= 1;
    }
  }

  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = error => reject(extractError(error));
    transaction.commit();
  })
}

async function initNames(db: IDBDatabase): Promise<void> {
  const names = await window.appAPI.fileRead('names.csv');
  const transaction = db!.transaction([IdbStoreName.Names], 'readwrite');
  const store = transaction.objectStore(IdbStoreName.Names);

  for (let line of names.split('\n')) {
    line = line.trim();
    const name = parseName(line);
    if (name) {
      store.put(name);
    }
  }

  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = error => reject(extractError(error));
    transaction.commit();
  })
}

async function initEmoji(db: IDBDatabase): Promise<void> {
  const emoji = await window.appAPI.fileRead('emoji.csv');
  const transaction = db!.transaction([IdbStoreName.Menu, IdbStoreName.Emoji], 'readwrite');
  const menuStore = transaction.objectStore(IdbStoreName.Menu);
  const emojiStore = transaction.objectStore(IdbStoreName.Emoji);

  let processedMenu = 0
  for (let line of emoji.split('\n')) {
    line = line?.trim();
    if (!line) {
      continue;
    }
    if (line.startsWith('# group:')) {
      processedMenu += 1;
      const menuItem = parseMenuItem(line, processedMenu);
      menuStore.add(menuItem);
    } else {
      const emoji = parseEmoji(line, processedMenu);
      if (emoji) {
        emojiStore.add(emoji);
      }
    }
  }

  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = error => reject(extractError(error));
    transaction.commit();
  })
}

function parseBlock(id: number, planeIndex: number, line: string): IdbBlock | null {
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

function parseName(line: string): IdbName | null {
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
      return word.length > 2 && !PARSE_NAME_IGNORE_KEYWORDS.includes(word.toUpperCase())
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

function parseMenuItem(line: string, id: number): IdbMenuItem {
  const name = line.replace('# group:', '').trim();
  const icon = MENU_ICONS[id] || DEFAULT_ICON;

  return {
    i: id,
    n: name,
    icon: icon,
    o: id,
  }
}

function parseEmoji(line: string, menuId: number): IdbEmoji | null {
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

function parseCode(raw: string): number | null {
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
