import { useContext } from 'react';
import { IndexedDbContext } from '@app-context';

export function useDatabase() {
  const { database } = useContext(IndexedDbContext);
  return database;
}
