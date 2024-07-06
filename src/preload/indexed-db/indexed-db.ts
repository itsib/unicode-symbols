export interface IdbBlock {
  /**
   * Block ID
   */
  i: number,
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
   * Block id includes symbol
   */
  b: number;
}

export enum IdbStoreName {
  Symbols = 'symbols',
  Blocks = 'blocks',
}

export class IndexedDb {

  private readonly _name: string;

  private readonly _version: number;

  private readonly _ranges: number[] = [];

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
      const blocks = lines.map(line => this._parseBlock(line));
      await this.insertBlocks(blocks);
    }
    // Parse symbols
    else if (context === 'symbols') {
      const symbols = lines.map(line => this._parseSymbol(line));
      await this.insertSymbols(symbols);
    }
  }

  async insertSymbols(symbols: IdbSymbol[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const db = await this._database();
      const transaction = db!.transaction([IdbStoreName.Symbols], 'readwrite');
      const store = transaction.objectStore(IdbStoreName.Symbols);

      for (const symbol of symbols) {
        store.put(symbol);
      }

      transaction.oncomplete = event => resolve((event.target as any)?.result);
      transaction.onerror = error => reject(this._extract(error));
    });
  }

  async insertBlocks(blocks: IdbBlock[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const db = await this._database();
      const transaction = db!.transaction([IdbStoreName.Blocks], 'readwrite');
      const store = transaction.objectStore(IdbStoreName.Blocks);

      for (const block of blocks) {
        store.put(block);
      }

      transaction.oncomplete = event => resolve((event.target as any)?.result);
      transaction.onerror = error => reject(this._extract(error));
    });
  }

  async checkInit(): Promise<boolean> {
    const symbolsCount = await this._getCount(IdbStoreName.Symbols);
    const blocksCount = await this._getCount(IdbStoreName.Blocks);

    return symbolsCount > 0 && blocksCount > 0;
  }

  async close() {
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

    // Create indexes for blocks store
    const blocksStore = db.createObjectStore(IdbStoreName.Blocks, { keyPath: 'i' });
    blocksStore.createIndex('id', 'i', { unique: true });
    blocksStore.createIndex('begin', 'b', { unique: true });

    // Create indexes for symbols store
    const symbolsStore = db.createObjectStore(IdbStoreName.Symbols, { keyPath: 'i' });
    symbolsStore.createIndex('id', 'i', { unique: true });
    symbolsStore.createIndex('name', 'n', { unique: false });
    symbolsStore.createIndex('block', 'b', { unique: false });
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
  }

  private async _getCount(storeName: IdbStoreName): Promise<number> {
    return new Promise(async (resolve, reject) => {
      const db = await this._database();
      const transaction = db!.transaction([storeName], 'readonly');

      const store = transaction.objectStore(storeName);

      const query = store.count();

      query.onsuccess = () => resolve((query as any)?.result);

      query.onerror = error => reject(this._extract(error));
    });
  }

  private _extract(error: any): string {
    return (error?.target as any)?.error;
  }

  private _parseBlock(line: string): IdbBlock {
    line = line.trim();
    const [range, name] = line.split(';');
    const [begin, end] = range.split('..');

    const block: IdbBlock = {
      i: this._ranges.length + 1,
      n: name.trim(),
      b: parseInt(begin.trim(), 16),
      e: parseInt(end.trim(), 16),
    }

    this._ranges.push(block.e)

    return block;
  }

  private _parseSymbol(line: string): IdbSymbol {
    line = line.trim();
    const [code, nameRaw] = line.split(';')
    const id = parseInt(code.trim(), 16);
    const name = nameRaw
      .split(/\s+/)
      .map((word: string, index: number) => {
        if (word.length === 1) {
          return word;
        }
        if (index === 1) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word.toLowerCase();
      })
      .join(' ')
      .trim();

    const block = this._ranges.findIndex(end => id > end) + 2;

    return { i: id, n: name, b: block };
  }
}