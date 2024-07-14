import { EmojiHandler } from './emoji-handler';

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

export interface IdbPlane {
  /**
   * Plane ID
   */
  i: number;
  /**
   * Plane Name
   */
  n: string;
  /**
   * Plane name abbr.
   */
  a: string;
  /**
   * Symbol key for begin range
   */
  b: number;
  /**
   * Symbol key for end range
   */
  e: number;
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
   * Keywords for search by name
   */
  k: string[];
}

export enum IdbStoreName {
  Symbols = 'symbols',
  Blocks = 'blocks',
  Planes = 'planes',
  Config = 'config',
  Favorites = 'favorites',
  Menu = 'menu',
}

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

export class IndexedDb {

  private readonly _name: string;

  private readonly _version: number;

  private _range: { count: number; values: number[] } = {
    count: 0,
    values: [],
  };

  private _processedMenu = 0;

  private _emojis = new EmojiHandler(30);

  private _db: Promise<IDBDatabase>;

  static get(name: string, version: number) {
    return new IndexedDb(name, version);
  }

  private constructor(name: string, version: number) {
    this._name = name;
    this._version = version;
  }

  async parseAndSave(context: string, lines: string[]): Promise<void> {
    // Parse planes
    if (context === 'planes') {
      await this.handlePlanes(lines);
    }
    // Parse blocks
    else if (context === 'blocks') {
      await this.handleBlocks(lines);
    }
    // Parse symbols
    else if (context === 'symbols') {
      await this.handleSymbols(lines);
    }
    // Parse emoji
    else if (context === 'emoji') {
      await this.handleEmoji(lines);
    }
  }

  async handlePlanes(lines: string[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const db = await this._database();
      const transaction = db!.transaction([IdbStoreName.Planes], 'readwrite');
      const store = transaction.objectStore(IdbStoreName.Planes);

      for (const line of lines) {
        const plane = this._parsePlane(line);
        store.put(plane);
      }

      transaction.oncomplete = event => resolve((event.target as any)?.result);
      transaction.onerror = error => reject(this._extract(error));
      transaction.commit();
    });
  }

  async handleBlocks(lines: string[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const db = await this._database();
      const transaction = db!.transaction([IdbStoreName.Blocks], 'readwrite');
      const store = transaction.objectStore(IdbStoreName.Blocks);

      for (const line of lines) {
        const block = this._parseBlock(line);
        store.put(block);
      }

      transaction.oncomplete = event => resolve((event.target as any)?.result);
      transaction.onerror = error => reject(this._extract(error));
    });
  }

  async handleSymbols(lines: string[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const db = await this._database();
      const transaction = db!.transaction([IdbStoreName.Symbols], 'readwrite');
      const store = transaction.objectStore(IdbStoreName.Symbols);

      for (const line of lines) {
        const symbol  = this._parseSymbol(line)
        store.put(symbol);
      }

      transaction.oncomplete = event => resolve((event.target as any)?.result);
      transaction.onerror = error => reject(this._extract(error));
    });
  }

  async handleEmoji(lines: string[]): Promise<any> {
    for (let line of lines) {
      line = line.trim();
      if (!line) {
        continue;
      }
      if (line.startsWith('# group:')) {
        if (this._processedMenu > 0) {
          await this._linkMenuToSymbols(this._processedMenu, this._emojis.refund(), this._emojis.getSkinSupport());
        }

        this._processedMenu += 1;

        const menuItem = await this._parseMenuItem(line, this._processedMenu);
        await this._saveMenuItem(menuItem);
      } else {
        const clean = line.split('#')[0].trim();
        const codesString = clean.split(';')[0].trim();
        if (!codesString)  {
          continue;
        }

        const codes = codesString.split(/\s+/).map(code => parseInt(code.trim(), 16));
        if (codes) {
          this._emojis.push(codes);
          if (this._emojis.isFull && this._processedMenu > 0) {
            await this._linkMenuToSymbols(this._processedMenu, this._emojis.refund(), this._emojis.getSkinSupport());
          }
        }
      }
    }
  }

  async checkInit(): Promise<boolean> {
    const symbolsCount = await this._getCount(IdbStoreName.Symbols);
    const blocksCount = await this._getCount(IdbStoreName.Blocks);

    return symbolsCount > 0 && blocksCount > 0;
  }

  async close(): Promise<void> {
    const db = await this._database();
    db.close();
    this._db = null;
  }

  async clear(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this._database();
        this._clear(db);
        return resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  private async _database(): Promise<IDBDatabase> {
    if (!this._db) {
      this._db = new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(this._name, this._version);

        request.onerror = error => reject(new Error(this._extract(error)));

        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = event => this._upgrade(event);
      });
    }

    return this._db;
  }

  /**
   * Callback for onupgradeneeded. Remove old db and create new indexes
   * @private
   */
  private _upgrade(event: IDBVersionChangeEvent) {
    const db = (event.target as any)!.result as IDBDatabase;

    db.onerror = error => console.warn(this._extract(error));

    this._clear(db);

    // Create indexes for planes store
    const planesStore = db.createObjectStore(IdbStoreName.Planes, { keyPath: 'i' });
    planesStore.createIndex('id', 'i', { unique: true });

    // Create indexes for blocks store
    const blocksStore = db.createObjectStore(IdbStoreName.Blocks, { keyPath: 'i' });
    blocksStore.createIndex('id', 'i', { unique: true });
    blocksStore.createIndex('plane', 'p', { unique: false });
    blocksStore.createIndex('begin', 'b', { unique: true });
    blocksStore.createIndex('end', 'e', { unique: true });

    // Create indexes for symbols store
    const symbolsStore = db.createObjectStore(IdbStoreName.Symbols, { keyPath: 'i' });
    symbolsStore.createIndex('id', 'i', { unique: true });
    symbolsStore.createIndex('block', 'b', { unique: false });
    symbolsStore.createIndex('plane', 'p', { unique: false });
    symbolsStore.createIndex('link', 'l', { unique: false });
    symbolsStore.createIndex('search', 'k', { unique: false, multiEntry: true });

    // Create main menu store
    const menuStore = db.createObjectStore(IdbStoreName.Menu, { keyPath: 'i' });
    menuStore.createIndex('order', 'o', { unique: true });

    // Create app settings store
    if(!db.objectStoreNames.contains(IdbStoreName.Config)) {
      const configStore = db.createObjectStore(IdbStoreName.Config, { autoIncrement: true });

      configStore.put(34, 0);
      configStore.put(1, 1);
      configStore.put({ begin: 0x0, end: 0xFFFF }, 2);
      configStore.put(false, 3);
      configStore.put([], 4);
    }
  }

  /**
   * Clear database
   * @param db
   * @private
   */
  private _clear(db: IDBDatabase): void {
    if (db.objectStoreNames.contains(IdbStoreName.Symbols)) {
      db.deleteObjectStore(IdbStoreName.Symbols);
    }
    if (db.objectStoreNames.contains(IdbStoreName.Blocks)) {
      db.deleteObjectStore(IdbStoreName.Blocks);
    }
    if (db.objectStoreNames.contains(IdbStoreName.Menu)) {
      db.deleteObjectStore(IdbStoreName.Menu);
    }
    if (db.objectStoreNames.contains(IdbStoreName.Planes)) {
      db.deleteObjectStore(IdbStoreName.Planes);
    }
  }

  private async _getCount(storeName: IdbStoreName): Promise<number> {
    const db = await this._database();
    const transaction = db!.transaction([storeName], 'readonly');

    const store = transaction.objectStore(storeName);

    const query = store.count();

    return new Promise((resolve, reject) => {
      query.onsuccess = () => resolve((query as any)?.result);

      query.onerror = error => reject(this._extract(error));
    });
  }

  private async _saveMenuItem(menuItem: IdbMenuItem): Promise<void> {
    const db = await this._database();
    const transaction = db!.transaction([IdbStoreName.Menu], 'readwrite');
    const store = transaction.objectStore(IdbStoreName.Menu);

    store.add(menuItem);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = event => resolve((event.target as any)?.result);
      transaction.onerror = error => reject(this._extract(error));
      transaction.commit();
    });
  }

  private async _linkMenuToSymbols(menuId: number, symbolsIds: number[], skin: Set<number> | undefined): Promise<void> {
    const db = await this._database();
    const transaction = db!.transaction([IdbStoreName.Symbols], 'readwrite');
    const store = transaction.objectStore(IdbStoreName.Symbols);

    let symbolId = this._getNextKey(symbolsIds);

    const request = store.index('id').openCursor(IDBKeyRange.lowerBound(symbolId, false));

    return new Promise((resolve, reject) => {
      request.onsuccess = event => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          if (cursor.value.i === symbolId) {
            cursor.value.l = menuId;
            cursor.value.s = !!skin && skin.has(cursor.value.i);

            cursor.update(cursor.value);
          }

          symbolId = this._getNextKey(symbolsIds, cursor.value.i);
          if (symbolId) {
            cursor.continue(symbolId);
            return;
          }
        }
        transaction.commit();
        resolve();
      };
      transaction.onerror = error => reject(this._extract(error));
    });
  }

  private _extract(error: any): string {
    return (error?.target as any)?.error;
  }

  private _getNextKey(symbolsIds: number[], min?: number): number | undefined {
    if (min == null) {
      return symbolsIds.pop();
    }
    let key: number | undefined = undefined;
    while (true) {
      key = symbolsIds.pop();
      if (!key || key > min) {
        return key;
      }
    }
  }

  private _parsePlane(line: string): IdbPlane {
    line = line.trim();
    const [range, name, abbr] = line.split(';');
    const [beginStr, end] = range.split('..');
    const begin = parseInt(beginStr.trim(), 16);
    const id = Math.floor(begin / 0x10000) + 1;

    return {
      i: id,
      n: name ? name.trim() : '',
      a: abbr ? abbr.trim() : '',
      b: begin,
      e: parseInt(end.trim(), 16),
    };
  }

  private _parseBlock(line: string): IdbBlock {
    line = line.trim();
    const [range, name] = line.split(';');
    const [beginStr, end] = range.split('..');
    const begin = parseInt(beginStr.trim(), 16);
    const plane = Math.floor(begin / 0x10000) + 1;

    const block: IdbBlock = {
      i: this._range.values.length + 1,
      p: plane,
      n: name.trim(),
      b: begin,
      e: parseInt(end.trim(), 16),
    }

    this._range.count += 1;
    this._range.values.push(block.e)

    return block;
  }

  private _parseSymbol(line: string): IdbSymbol {
    line = line.trim();
    const [code, nameRaw] = line.split(';');
    const name = nameRaw.trim();
    const id = parseInt(code.trim(), 16);
    const plane = Math.floor(id / 0x10000) + 1;
    const keywords = name.split(/[\s-_]+/)
      .filter((word: string) => word.length > 2 && !IGNORE_KEYWORDS.includes(word.toUpperCase()));

    let block: number;
    const end = this._range.values[0]
    if (end != null && id > end) {
      this._range.values.shift();
    }

    block = (this._range.count - this._range.values.length) + 1;

    return {
      i: id,
      n: name,
      p: plane,
      b: block,
      l: undefined,
      s: false,
      k: keywords,
    };
  }

  private async _parseMenuItem(line: string, id: number): Promise<IdbMenuItem> {
    const name = line.replace('# group:', '').trim();
    const icon = MENU_ICONS[id] || DEFAULT_ICON;

    return {
      i: id,
      n: name,
      icon: icon,
      o: id,
    }
  }
}