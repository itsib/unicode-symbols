import { extractError, } from './extract-error';
import { IndexedDbStore } from '@app-context';
import { LeftMenuItem, IdbStoreName, IdbMenuItem } from '@app-types';
import { initDatabaseStores } from './database-init';
import { showIdbError } from './show-idb-error';
import { openDB, unwrap, type IDBPDatabase, type IDBPTransaction } from 'idb';

export interface DatabaseOptions {
  name: string;
  version: number;
  onInit?: (db: IDBDatabase) => Promise<void>
  onReady?: () => void
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
    let isUpgraded = false
    this._db = openDB(options.name, options.version, {
      upgrade(db: IDBPDatabase, oldVersion, newVersion, transaction, event) {
        isUpgraded = true
        initDatabaseStores(unwrap(db));
      }
    })
      .then(db => {
        if (isUpgraded && options.onInit) {
          options.onInit(unwrap(db))
            .then(() => {
              options?.onReady?.()
            })
            .catch(console.error);
        } else {
          options?.onReady?.()
        }

        return db;
      })
  }

  get db() {
    return this._db;
  }

  async getStore(): Promise<IDBDatabase> {
    return unwrap(await this._db)
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

  /**
   * Callback for onupgradeneeded. Remove old db and create new indexes
   * @private
   */
  private _upgrade(event: IDBVersionChangeEvent) {
    const db = (event.target as any)!.result as IDBDatabase;

    db.onerror = error => console.warn(extractError(error));

    initDatabaseStores(db);
  }
}
