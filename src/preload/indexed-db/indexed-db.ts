import { extractError, IdbBlock, IdbMenuItem, parseBlock, parseEmoji, parseMenuItem, parseSymbol } from './utils';

export enum IdbStoreName {
  Symbols = 'symbols',
  Blocks = 'blocks',
  Planes = 'planes',
  Config = 'config',
  Menu = 'menu',
}

export class IndexedDb {

  private readonly _name: string;

  private readonly _version: number;

  private _blocks: IdbBlock[] = [];

  private _planeIndex = 0;

  private _processedMenu = 0;

  private _emoji = {
    codes: new Set<number>(),
    skin: new Set<number>(),
    restyle: new Set<number>(),
  };

  private _db: Promise<IDBDatabase>;

  static get(name: string, version: number) {
    return new IndexedDb(name, version);
  }

  private constructor(name: string, version: number) {
    this._name = name;
    this._version = version;
  }

  async parseAndSave(context: string, lines: string[]): Promise<void> {
    // Parse blocks
    if (context === 'blocks') {
      await this.handleBlocks(lines);
    }
    // Parse symbols
    else if (context === 'names') {
      await this.handleNames(lines);
    }
    // Parse emoji
    else if (context === 'emoji') {
      await this.handleEmoji(lines);
    }
  }

  async handleBlocks(lines: string[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const db = await this._database();
      const transaction = db!.transaction([IdbStoreName.Blocks, IdbStoreName.Planes], 'readwrite');
      const blockStore = transaction.objectStore(IdbStoreName.Blocks);
      const planeStore = transaction.objectStore(IdbStoreName.Planes);

      for (let line of lines) {
        line = line.trim()
        const plane = line.split('# plane:')[1]?.trim();
        if (plane) {
          this._planeIndex += 1;
          planeStore.add(plane, this._planeIndex);
          continue;
        }
        const id = this._blocks.length + 1
        const block = parseBlock(id, this._planeIndex, line);

        this._blocks.push(block)

        blockStore.put(block);
      }

      transaction.commit();
      transaction.oncomplete = event => resolve((event.target as any)?.result);
      transaction.onerror = error => reject(extractError(error));
    });
  }

  async handleNames(lines: string[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const db = await this._database();
      const transaction = db!.transaction([IdbStoreName.Symbols], 'readwrite');
      const store = transaction.objectStore(IdbStoreName.Symbols);

      for (let line of lines) {
        line = line.trim();
        const symbol  = parseSymbol(line);

        const block = this._blocks[0];
        if (block != null && symbol.i > block.e) {
          this._blocks.shift();
        }

        symbol.b = this._blocks[0]?.i;
        symbol.p = this._blocks[0]?.p;

        store.put(symbol);
      }

      transaction.commit();
      transaction.oncomplete = event => resolve((event.target as any)?.result);
      transaction.onerror = error => reject(extractError(error));
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
          // Handle items from the previous menu
          await this._linkMenuToSymbols();
        }

        this._processedMenu += 1;
        const menuItem = parseMenuItem(line, this._processedMenu);
        await this._saveMenuItem(menuItem);
      } else {
        // Remove comments
        const emoji = parseEmoji(line);
        if (!emoji) {
          continue;
        }
        this._emoji.codes.add(emoji.code);
        if (emoji.skin) {
          this._emoji.skin.add(emoji.code);
        }
        if (emoji.restyle) {
          this._emoji.restyle.add(emoji.code);
        }

        if (this._emoji.codes.size >= 30 && this._processedMenu > 0) {
          await this._linkMenuToSymbols();
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

        request.onerror = error => reject(extractError(error));

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

    db.onerror = error => console.warn(extractError(error));

    this._clear(db);

    // Create indexes for planes store
    db.createObjectStore(IdbStoreName.Planes, { autoIncrement: true });

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

      query.onerror = error => reject(extractError(error));
    });
  }

  private async _saveMenuItem(menuItem: IdbMenuItem): Promise<void> {
    const db = await this._database();
    const transaction = db!.transaction([IdbStoreName.Menu], 'readwrite');
    const store = transaction.objectStore(IdbStoreName.Menu);

    store.add(menuItem);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = event => resolve((event.target as any)?.result);
      transaction.onerror = error => reject(extractError(error));
      transaction.commit();
    });
  }

  private async _linkMenuToSymbols(): Promise<void> {
    const db = await this._database();
    const transaction = db!.transaction([IdbStoreName.Symbols], 'readwrite');
    const store = transaction.objectStore(IdbStoreName.Symbols);

    const menuId = this._processedMenu;
    const symbolsIds = Array.from(this._emoji.codes).sort((a, b) => b - a);
    let symbolId = this._getNextKey(symbolsIds);

    const request = store.index('id').openCursor(IDBKeyRange.lowerBound(symbolId, false));

    return new Promise((resolve, reject) => {
      request.onsuccess = event => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          if (cursor.value.i === symbolId) {
            cursor.value.l = menuId;
            cursor.value.s = !!this._emoji.skin && this._emoji.skin.has(cursor.value.i);
            cursor.value.r = !!this._emoji.restyle && this._emoji.restyle.has(cursor.value.i);

            cursor.update(cursor.value);
          }

          symbolId = this._getNextKey(symbolsIds, cursor.value.i);
          if (symbolId) {
            cursor.continue(symbolId);
            return;
          }
        }
        transaction.commit();
        this._emoji.codes.clear();
        this._emoji.skin.clear();
        resolve();
      };
      transaction.onerror = error => reject(extractError(error));
    });
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
}