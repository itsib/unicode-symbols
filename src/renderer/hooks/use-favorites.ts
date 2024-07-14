import { useCallback, useEffect, useMemo } from 'react';
import { useAppConfig } from './use-app-config';
import { AppConfigKey } from '@app-context';

export function useFavorites(symbol: number): [boolean, () => void] {
  const [favorites, setFavorites] = useAppConfig(AppConfigKey.Favorites);

  const isFavorite = useMemo(() => (symbol != null ? favorites.includes(symbol) : false), [symbol, favorites]);

  const toggleFavorite = useCallback(() => {
    const index = favorites.indexOf(symbol);
    if (index === -1) {
      setFavorites([...favorites, symbol]);
    } else {
      favorites.splice(index, 1);

      setFavorites([...favorites]);
    }

  }, [symbol, favorites]);

  return [isFavorite, toggleFavorite];
}