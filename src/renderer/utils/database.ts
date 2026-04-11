import { IndexedDbStore } from '@app-context';
import { IdbStoreName } from '@app-types';
import { type IDBPDatabase, type IDBPTransaction, openDB } from 'idb';

export interface DatabaseOptions {
  name: string;
  version: number;
  onConnected?: () => void
}

export interface GetAllOptions {
  store: IndexedDbStore
  indexName?: string
  key?: IDBKeyRange | number
  signal?: AbortSignal
}

export class Database {
  /**
   * IndexedDB instance
   * @private
   */
  private readonly _db: Promise<IDBPDatabase>;

  private static _INSTANCE: Database | null = null;

  static get(options: DatabaseOptions) {
    if (!Database._INSTANCE) {
      Database._INSTANCE = new Database(options)
    }
    return Database._INSTANCE;
  }

  static drop(name: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(name);

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Error deleting database.'))
      }
    })
  }

  private constructor(options: DatabaseOptions) {
    this._db = openDB(options.name, options.version)
      .then(db => {
        options?.onConnected?.()
        return db;
      })
  }

  get db() {
    return this._db;
  }

  async count(storeName: IdbStoreName): Promise<number> {
    const db = await this._db;
    const store = db!.transaction(storeName, 'readonly').objectStore(storeName);

    return store.count();
  }

  async transaction<TStore extends IndexedDbStore, Mode extends IDBTransactionMode>(storeName: TStore, mode?: Mode, options?: IDBTransactionOptions): Promise<IDBPTransaction<unknown, [TStore], Mode>> {
    const db = await this._db

    return db.transaction(storeName, mode, options)
  }

  async getAll<T = unknown>(params: GetAllOptions) {
    const db = await this._db;

    const transaction = db.transaction(params.store, 'readonly');
    const store = transaction.objectStore(params.store);

    const request = params.indexName ? await store.index(params.indexName).openCursor(params.key) : await store.openCursor(params.key);

    function onAbort() {
      transaction.abort();
    }

    params.signal?.addEventListener('abort', onAbort)

    return transaction.store
  }
}
