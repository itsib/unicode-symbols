import { useContext } from 'react';
import { IndexedDbContext } from '@app-context';

export function useIdbInstance(): IDBDatabase | null {
  const { database } = useContext(IndexedDbContext);
  return database;
}
