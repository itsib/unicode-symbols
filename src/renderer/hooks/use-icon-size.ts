import { useCallback, useContext } from 'react';
import { AppContext } from '../contexts/app.context';

export function useIconSize(): [number, (category: number) => void] {
  const { iconSize, setConfig } = useContext(AppContext);

  const updateIconSize = useCallback((_iconSize: number) => setConfig('iconSize', _iconSize), []);

  return [iconSize, updateIconSize];
}