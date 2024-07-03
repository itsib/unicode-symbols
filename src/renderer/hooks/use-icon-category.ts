import { useCallback, useContext } from 'react';
import { AppContext } from '../contexts/app.context';

export function useIconCategory(): [string, (category: string) => void] {
  const { activeCategory, setConfig } = useContext(AppContext);

  const updateActiveCategory = useCallback((category: string) => setConfig('activeCategory', category), []);

  return [activeCategory, updateActiveCategory];
}