import { useIdbReady } from './indexed-db/use-idb-ready';

export function useLoading(): boolean {
  const isReady = useIdbReady()

  return !isReady
}
