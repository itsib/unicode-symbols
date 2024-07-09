import { useContext } from 'react';
import { IndexedDbContext } from '@app-context';

export function useIdbReady(): boolean {
  const { isReady } = useContext(IndexedDbContext);
  return isReady;
}