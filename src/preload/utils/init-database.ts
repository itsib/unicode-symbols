import { type IDBPDatabase, openDB, unwrap } from 'idb';
import { IdbStoreName } from '@app-types';
import { fileRead } from './file-read';
import { bitOn, isBitOn } from '../../renderer/utils/binary-utils';

interface EmojiChunk {
  codes: number[];
  name: string;
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

enum OptsBit {
  Modifier = 0,
  SkinColor,
}

async function initBlocks(dbp: IDBPDatabase) {
  const db = unwrap(dbp)
  const blocks = await fileRead('blocks.csv');
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

async function initNames(dbp: IDBPDatabase) {
  const db = unwrap(dbp)
  const names = await fileRead('unicode.csv');
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

async function initEmoji(dbp: IDBPDatabase): Promise<void> {
  const db = unwrap(dbp)
  const emoji = await fileRead('emoji.csv');
  const transaction = db!.transaction([IdbStoreName.Menu, IdbStoreName.Emoji], 'readwrite');
  const menuStore = transaction.objectStore(IdbStoreName.Menu);
  const emojiStore = transaction.objectStore(IdbStoreName.Emoji);

  function handleChunk(chunks: EmojiChunk[]) {
    // Simple emoji
    if (chunks.length === 1) {
      const [s0] = chunks
      emojiStore.add({
        c: s0.codes,
        n: s0.name,
        g: s0.menu,
        e: 1,
        o: 0,
      });
    }

    // One simple emoji with skin and variant
    else if (chunks.every(chunk => chunk.codes.length <= 2)) {
      let options = 0
      let name = chunks[0].name
      const codes: number[] = [chunks[0].codes[0]]

      for (let i = 0; i < chunks.length; i++) {
        const s = chunks[i];

        if (s.codes.length === 2 && s.codes[1] === VS16) {
          name = s.name
          options = bitOn(options, OptsBit.Modifier)
          codes.push(VS16)
        } else if (s.codes.length === 2 && !isBitOn(options, OptsBit.SkinColor) && EMOJI_SKIN_MODS.includes(s.codes[1])) {
          options = bitOn(options, OptsBit.SkinColor)
        }
      }

      emojiStore.add({
        c: codes,
        n: name,
        g: chunks[0].menu,
        e: 1,
        o: options,
      });
    }

    else {
      let name: string = ''
      let options = 0
      let entities = 1
      let codes: number[] = [...chunks[0].codes]
      const group = chunks[0].menu

      for (let i = 0; i < chunks.length; i++) {
        const _chunk = chunks[i];

        if (!name) {
          name = _chunk.name;
        }

        const _codes: number[] = []
        let _entities = 1
        for (let j = 0; j < _chunk.codes.length; j++) {
          const _code = _chunk.codes[j]

          if (_code === ZWJ) {
            _entities += 1
            _codes.push(_code)
          }

          const bitOffset = entities * 3

          if (_code === VS16) {
            _codes.push(VS16)
            options = bitOn(options, bitOffset + OptsBit.Modifier)
          } else if (!isBitOn(options, bitOffset + OptsBit.SkinColor) && EMOJI_SKIN_MODS.includes(_code)) {
            options = bitOn(options, bitOffset + OptsBit.SkinColor)
          }
        }

        codes = _codes.length > codes.length ? _codes : codes
        entities = Math.max(entities, _entities)
      }

      emojiStore.add({
        c: codes,
        n: name,
        g: group,
        e: entities,
        o: options,
      });
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

    const { codes, name } = parseEmoji(line)

    // Close chunk if next codepoint
    if (chunks && !isSameCodepoint(chunks[0].codes, codes)) {
      handleChunk(chunks)
      chunks = null
    }

    // Handle flags
    if (codes[0] >= 0x1F1E6 && codes[0] <= 0x1F1FF) {
      emojiStore.add({
        c: codes,
        n: name,
        g: menuIndex,
        o: 0,
      });
      continue;
    }

    // Start collect chunks - create first chink
    if (!chunks) {
      chunks = [{ codes, name, menu: menuIndex }];
      continue;
    }

    // Collect same codepoints in chunks
    if (isSameCodepoint(chunks[0].codes, codes)) {
      chunks.push({codes, name, menu: menuIndex });
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
  let [codesRaw, _qualificationRaw, nameRaw] = line.split(';');
  const name = nameRaw.trim();
  const codes = codesRaw.trim().split(',').map(v => parseInt(v, 16));
  if (codes.length === 0 || codes.some(code => isNaN(code))) {
    throw new Error('NO_CODES');
  }

  return { codes, name };
}

function extractError(error: any): Error {
  return new Error((error?.target as any)?.error);
}

function isSameCodepoint(codesA: number[], codesB: number[]): boolean {
  if (codesA[0] !== codesB[0]) return false

  const idsA = codesA.filter(code => !EMOJI_SKIN_MODS.includes(code) && code !== VS16 && code !== ZWJ);
  const idsB = codesB.filter(code => !EMOJI_SKIN_MODS.includes(code) && code !== VS16 && code !== ZWJ);

  if (idsA.length === idsB.length && idsA.every((code, index) => idsB[index] === code)) {
    return true;
  }
  // console.log([idsA.map(id => id.toString(16).toUpperCase()).join(','), idsB.map(id => id.toString(16).toUpperCase()).join(',')])

  return false

}

export async function initDatabase(name: string, version?: number): Promise<void> {
  const dbp = await openDB(name, version, {
    upgrade(db: IDBPDatabase) {
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
    },
  });

  try {
    const blocksCount = await dbp.count(IdbStoreName.Blocks)
    if (blocksCount === 0) {
      await initBlocks(dbp);
    }
  } catch (error) {
    console.error('initBlocks', error);
  }

  try {
    const namesCount = await dbp.count(IdbStoreName.Names);
    if (namesCount === 0) {
      await initNames(dbp);
    }
  } catch (error) {
    console.error('initNames', error);
  }

  try {
    const emojiCount = await dbp.count(IdbStoreName.Emoji);
    if (emojiCount === 0) {
      await initEmoji(dbp);
    }
  } catch (error) {
    console.error('initEmoji', error);
  }
}
