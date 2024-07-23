import { extractError, IdbEmoji, IdbMenuItem, parseBlock, parseEmoji, parseMenuItem, parseName } from './utils';

export enum IdbStoreName {
  Planes = 'planes',
  Blocks = 'blocks',
  Names = 'names',
  Emoji = 'emoji',
  Menu = 'menu',
}

export class IndexedDb {

  private readonly _name: string;

  private readonly _version: number;

  private _planeIndex = 0;

  private _blockIndex = 0;

  private _processedMenu = 0;

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
    // Parse names
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
        this._blockIndex += 1;
        const block = parseBlock(this._blockIndex, this._planeIndex, line);
        if (!block) {
          this._blockIndex -= 1;
          continue;
        }

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
      const transaction = db!.transaction([IdbStoreName.Names], 'readwrite');
      const store = transaction.objectStore(IdbStoreName.Names);

      for (let line of lines) {
        line = line.trim();
        const name = parseName(line);
        if (name) {
          store.put(name);
        }
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
        this._processedMenu += 1;
        const menuItem = parseMenuItem(line, this._processedMenu);
        await this._saveMenuItem(menuItem);
      } else {
        // Remove comments
        const emoji = parseEmoji(line, this._processedMenu);
        if (!emoji) {
          continue;
        }
        await this._saveEmoji(emoji);
      }
    }
  }

  async checkInit(): Promise<boolean> {
    const symbolsCount = await this._getCount(IdbStoreName.Names);
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

    // Create indexes for names store
    const namesStore = db.createObjectStore(IdbStoreName.Names, { keyPath: 'c' });
    namesStore.createIndex('code', 'c', { unique: true });
    namesStore.createIndex('start', 's', { unique: false });
    namesStore.createIndex('search', 'k', { unique: false, multiEntry: true });

    // Create indexes for emoji store
    const emojiStore = db.createObjectStore(IdbStoreName.Emoji, { keyPath: 'c' });
    emojiStore.createIndex('code', 'c', { unique: false });
    emojiStore.createIndex('group', 'g', { unique: false });

    // Create main menu store
    const menuStore = db.createObjectStore(IdbStoreName.Menu, { keyPath: 'i' });
    menuStore.createIndex('order', 'o', { unique: true });
  }

  /**
   * Clear database
   * @param db
   * @private
   */
  private _clear(db: IDBDatabase): void {
    if (db.objectStoreNames.contains(IdbStoreName.Names)) {
      db.deleteObjectStore(IdbStoreName.Names);
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

  private async _saveEmoji(emoji: IdbEmoji): Promise<void> {
    const db = await this._database();
    const transaction = db!.transaction([IdbStoreName.Emoji], 'readwrite');
    const store = transaction.objectStore(IdbStoreName.Emoji);

    store.add(emoji);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = event => resolve((event.target as any)?.result);
      transaction.onerror = error => {
        console.log(emoji);
        console.error(extractError(error));
        resolve(null);
      };
      transaction.commit();
    });
  }
}