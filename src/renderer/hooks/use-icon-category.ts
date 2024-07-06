import { useCallback, useContext } from 'react';
import { ApplicationContext } from '../context/application/application.context';

export function useIconCategory(): [string, (category: string) => void] {
  const { activeCategory, setConfig } = useContext(ApplicationContext);

  const updateActiveCategory = useCallback((category: string) => setConfig('activeCategory', category), []);

  return [activeCategory, updateActiveCategory];
}