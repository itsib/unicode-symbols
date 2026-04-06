import { useContext } from 'react';
import { IndexedDbContext } from '@app-context';

export function useDatabase() {
  const { database, isReady } = useContext(IndexedDbContext);

  return isReady ? database : null;
}
