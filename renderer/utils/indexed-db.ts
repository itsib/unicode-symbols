export class IndexedDb {

  private readonly _name = 'APP_SYMBOLS';

  private readonly _version: number;

  private _db: Promise<IDBDatabase>;

  static get() {
    return new IndexedDb();
  }

  private constructor(version = 1) {
    this._version = version;
  }

  async insert(symbol: IndexedDb.UnicodeSymbol): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const db = await this._db;
      const transaction = db!.transaction(['symbols'], 'readwrite');
      const store = transaction.objectStore('symbols');

      store.put(symbol);

      transaction.oncomplete = event => resolve((event.target as any)?.result);
      transaction.onerror = error => reject(IndexedDb.extract(error));
    });
  }

  private async _connect(): Promise<IDBDatabase> {
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

  /**
   * Callback for onupgradeneeded. Remove old db and create new indexes
   * @private
   */
  private _upgrade(event: IDBVersionChangeEvent) {
    const db = (event.target as any)!.result as IDBDatabase;

    if (db.objectStoreNames.contains('symbols')) {
      db.deleteObjectStore('symbols');
    }

    db.onerror = error => console.warn(IndexedDb.extract(error));

    // Create index fl store for symbols
    const tokensStore = db.createObjectStore('symbols', { keyPath: 'id' });

    tokensStore.createIndex('group', ['group'], { unique: false });
  }
}

export namespace IndexedDb {
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