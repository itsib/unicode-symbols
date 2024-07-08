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
   * Keywords for search by name
   */
  k: string[];
}

export enum IdbStoreName {
  Symbols = 'symbols',
  Blocks = 'blocks',
  Planes = 'planes',
  Config = 'config',
}

const IGNORE_KEYWORDS = ['SIGN', 'ONE', 'WITH', 'LETTER', 'MARK'];

export class IndexedDb {

  private readonly _name: string;

  private readonly _version: number;

  private _rangesCount: number = 0;
  private _ranges: number[] = [];

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
      const planes = lines.map(line => this._parsePlane(line));
      await this.insertPlanes(planes);
    }
    // Parse blocks
    else if (context === 'blocks') {
      const blocks = lines.map(line => this._parseBlock(line));
      await this.insertBlocks(blocks);
    }
    // Parse symbols
    else if (context === 'symbols') {
      const symbols = lines.map(line => this._parseSymbol(line));
      await this.insertSymbols(symbols);
    }
  }

  async insertPlanes(planes: IdbPlane[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const db = await this._database();
      const transaction = db!.transaction([IdbStoreName.Planes], 'readwrite');
      const store = transaction.objectStore(IdbStoreName.Planes);

      for (const plane of planes) {
        store.put(plane);
      }

      transaction.oncomplete = event => resolve((event.target as any)?.result);
      transaction.onerror = error => reject(this._extract(error));
      transaction.commit();
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
    symbolsStore.createIndex('search', 'k', { unique: false, multiEntry: true });

    // Create app settings store
    if(!db.objectStoreNames.contains(IdbStoreName.Config)) {
      const configStore = db.createObjectStore(IdbStoreName.Config, { autoIncrement: true });

      configStore.put(34, 0);
      configStore.put(1, 1);
      configStore.put({ begin: 0x0, end: 0xFFFF }, 2);
      configStore.put(false, 3);
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
      i: this._ranges.length + 1,
      p: plane,
      n: name.trim(),
      b: begin,
      e: parseInt(end.trim(), 16),
    }

    this._rangesCount += 1;
    this._ranges.push(block.e)

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
    const end = this._ranges[0]
    if (end != null && id > end) {
      this._ranges.shift();
    }

    block = (this._rangesCount - this._ranges.length) + 1;

    return { i: id, n: name, p: plane, b: block, k: keywords };
  }
}