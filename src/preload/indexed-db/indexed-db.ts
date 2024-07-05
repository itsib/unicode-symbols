export class IndexedDb {

  private readonly _name = 'UnicodeSymbols';

  private readonly _version: number;

  private _db: Promise<IDBDatabase>;

  static get(version = 1) {
    return new IndexedDb(version);
  }

  private constructor(version: number) {
    this._version = version;
  }

  async db(): Promise<IDBDatabase> {
    if (!this._db) {
      this._db = new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(this._name, this._version);

        request.onerror = error => reject(new Error(IndexedDb.extract(error)));

        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = event => this._upgrade(event);
      });
    }

    return this._db;
  }

  async insertNames(...symbolNames: IndexedDb.SymbolName[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const db = await this.db();
      const transaction = db!.transaction([IndexedDb.Store.SymbolName], 'readwrite');
      const store = transaction.objectStore(IndexedDb.Store.SymbolName);

      for (const symbolName of symbolNames) {
        store.put(symbolName);
      }

      transaction.oncomplete = event => resolve((event.target as any)?.result);
      transaction.onerror = error => reject(IndexedDb.extract(error));
    });
  }

  async checkInit(): Promise<boolean> {
    const symbolNamesCount = await this._getCount(IndexedDb.Store.SymbolName);

    return !!symbolNamesCount;
  }

  async getSymbolName(id: number): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const db = await this.db();
      const transaction = db!.transaction([IndexedDb.Store.SymbolName], 'readonly');
      const store = transaction.objectStore(IndexedDb.Store.SymbolName);

      const index = store.index('byId');
      const request = index.get([id]);

      request.onsuccess = () => {
        resolve(request.result?.name);
      };

      transaction.onerror = error => reject(IndexedDb.extract(error));
    });

  }

  /**
   * Callback for onupgradeneeded. Remove old db and create new indexes
   * @private
   */
  private _upgrade(event: IDBVersionChangeEvent) {
    const db = (event.target as any)!.result as IDBDatabase;

    if (db.objectStoreNames.contains(IndexedDb.Store.SymbolName)) {
      db.deleteObjectStore(IndexedDb.Store.SymbolName);
    }

    db.onerror = error => console.warn(IndexedDb.extract(error));

    // Create index fl store for symbols
    const tokensStore = db.createObjectStore(IndexedDb.Store.SymbolName, { keyPath: 'id' });

    tokensStore.createIndex('byName', ['name'], { unique: false });
    tokensStore.createIndex('byId', ['id'], { unique: true });
  }

  private _getCount(storeName: IndexedDb.Store): Promise<number> {
    return new Promise(async (resolve, reject) => {
      const db = await this.db();
      const transaction = db!.transaction([storeName], 'readonly');

      const store = transaction.objectStore(storeName);

      const query = store.count();

      query.onsuccess = () => resolve((query as any)?.result);

      query.onerror = error => reject(IndexedDb.extract(error));
    });
  }
}

export namespace IndexedDb {
  export enum Store {
    SymbolName = 'symbol-name',
  }

  export interface SymbolName {
    id: number;
    name: string
  }

  export interface UnicodeSymbol {
    id: number;
    name: string;
    group: string;
  }

  /**
   * Extract error message
   * @param error
   * @private
   */
  export function extract(error: any): string {
    return (error?.target as any)?.error;
  }
}