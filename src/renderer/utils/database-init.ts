import { IdbStoreName } from '@app-types';
import { extractError } from './extract-error';

interface EmojiChunk {
  codes: number[];
  name: string;
  qualification: string;
  menu: number;
}

/**
 * 0 - 1,2 Fitz Patrick
 * 1 - 3 Fitz Patrick
 * 2 - 4 Fitz Patrick
 * 3 - 5 Fitz Patrick
 * 4 - 6 Fitz Patrick
 *
 * @type {[ number, number, number, number, number ]}
 */
const EMOJI_SKIN_MODS = [
  0x1F3FB,
  0x1F3FC,
  0x1F3FD,
  0x1F3FE,
  0x1F3FF,
];

/**
 * 0 - Red hair
 * 1 - Curly Hair
 * 2 - Bald
 * 3 - White Hair
 *
 * @type {[number, number, number, number]}
 */
const EMOJI_HEAD_MODS = [
  0x1F9B0,
  0x1F9B1,
  0x1F9B2,
  0x1F9B3
];

/**
 * Zero Width Join
 * @type {number}
 */
const ZWJ = 0x200D;

/**
 * Variation Selector 16
 * @type {number}
 */
const VS16 = 0xFE0F;

const MALE = 0x2642;
const FEMALE = 0x2640;

const PARSE_NAME_IGNORE_KEYWORDS = ['SIGN', 'ONE', 'WITH', 'LETTER', 'MARK'];

const DEFAULT_ICON = 'star.svg'

const MENU_ICONS: Record<number, string> = [
  undefined,
  'smiles.svg',
  'people.svg',
  'brain.svg',
  'animals.svg',
  'food.svg',
  'airplane.svg',
  'activities.svg',
  'objects.svg',
  'letters.svg',
  'flags.svg',
];

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
  namesStore.createIndex('type', 't', { unique: false });
  namesStore.createIndex('search', 'k', { unique: false, multiEntry: true });

  // Create emoji store
  const emojiStore = db.createObjectStore(IdbStoreName.Emoji, { keyPath: 'c' });
  emojiStore.createIndex('code', 'c', { unique: false, multiEntry: true });
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
    if (!line) {
      continue;
    }

    const plane = line.split('@@')[1]?.trim();
    if (plane) {
      planeIndex += 1;
      planeStore.add(plane, planeIndex);
      continue;
    }
    const [range, name] = line.split(';');
    const [begin, end] = range.split('..');

    blockIndex += 1;
    blockStore.put({
      i: blockIndex,
      p: planeIndex,
      n: name.trim(),
      b: parseInt(begin.trim(), 16),
      e: parseInt(end.trim(), 16),
    });
  }

  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = error => reject(extractError(error));
    transaction.commit();
  })
}

async function initNames(db: IDBDatabase): Promise<void> {
  const names = await window.appAPI.fileRead('unicode.csv');
  const transaction = db!.transaction([IdbStoreName.Names], 'readwrite');
  const store = transaction.objectStore(IdbStoreName.Names);

  for (let line of names.split('\n')) {
    line = line.trim();
    if (!line) {
      continue;
    }

    const [codesRaw, typeRaw, nameRaw] = line.split(';');

    const code = parseInt(codesRaw.trim(), 16);
    const type = typeRaw.trim();
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


    const keywords = nameRaw
      .split(/[\s-_]+/)
      .filter((word: string) => {
        return word.length > 2 && !PARSE_NAME_IGNORE_KEYWORDS.includes(word.toUpperCase())
      });

    store.put({
      c: code,
      n: name,
      t: type,
      k: keywords,
    });
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

  function handleChunk(chunks: EmojiChunk[]) {
    const [s0, s1, ...ss] = chunks;
    if (s0 && !s1 && !ss.length) {
      emojiStore.add({
        c: s0.codes,
        n: s0.name,
        g: s0.menu,
        q: s0.qualification,
        o: 0b0000,
      });
      return
    }

    if (s0 && s1 && !ss.length) {
      if ((s0.codes.length === 1 && s1.codes.length === 2 && s1.codes[1] === VS16) || (s1.codes.length === 1 && s0.codes.length === 2 && s0.codes[1] === VS16)) {
        const s = s1.codes.length === 1 && s0.codes.length === 2 && s0.codes[1] === VS16 ? s0 : s1
        emojiStore.add({
          c: s.codes,
          n: s.name,
          g: s.menu,
          q: s.qualification,
          o: 0b0001,
        });
        return
      }
    }

    if (chunks.every(c => c.codes.length === 1 || (c.codes.length === 2 && EMOJI_SKIN_MODS.includes(c.codes[1])))) {
      emojiStore.add({
        c: [chunks[0].codes[0]],
        n: chunks[0].name,
        g: chunks[0].menu,
        q: chunks[0].qualification,
        o: 0b0010,
      });
      return
    }
  }

  let menuIndex = 0
  let chunks: EmojiChunk[] | null = null;
  const lines = emoji.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (!line) {
      continue;
    }

    // Menu item
    if (line.startsWith('@@')) {
      menuIndex++
      const name = line.replace('@@ ', '');
      const icon = MENU_ICONS[menuIndex] || DEFAULT_ICON;

      menuStore.add({
        i: menuIndex,
        n: name,
        icon: icon,
        o: menuIndex,
      });
      continue;
    }

    const { codes, name, qualification } = parseEmoji(line)
    const code = codes[0];

    if (chunks && chunks[0].codes[0] !== code) {
      handleChunk(chunks)
      chunks = null
    }

    // Handle flags
    if (code >= 0x1F1E6 && code <= 0x1F1FF) {
      emojiStore.add({
        c: codes,
        n: name,
        g: menuIndex,
        q: qualification,
        o: 0b0000,
      });
      continue;
    }

    if (!chunks) {
      chunks = [{ codes, name, qualification, menu: menuIndex }];
      continue;
    }

    if (chunks[0].codes[0] === code) {
      chunks.push({codes, name, qualification, menu: menuIndex });
    }
  }

  if (chunks) {
    handleChunk(chunks)
    chunks = null
  }

  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = error => reject(extractError(error));
    transaction.commit();
  })
}

function parseEmoji(line: string) {
  let [codesRaw, qualificationRaw, nameRaw] = line.split(';');
  const name = nameRaw.trim();
  const qualification = qualificationRaw.trim();
  const codes = codesRaw.trim().split(',').map(v => parseInt(v, 16));
  if (codes.length === 0 || codes.some(code => isNaN(code))) {
    throw new Error('NO_CODES');
  }

  return { codes, name, qualification };
}
