import { useContext, useEffect, useState } from 'react';
import { IndexedDbContext } from '@app-context';

export function useIdbInstance(): IDBDatabase | null {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const { database } = useContext(IndexedDbContext);

  useEffect(() => {
    database?.getStore()
      .then(db => setDb(db))
      .catch(console.error);
  }, [database]);


  return db;
}
