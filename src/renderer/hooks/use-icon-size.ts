import { useCallback, useContext } from 'react';
import { ApplicationContext } from '../context/application/application.context';

export function useIconSize(): [number, (category: number) => void] {
  const { iconSize, setConfig } = useContext(ApplicationContext);

  const updateIconSize = useCallback((_iconSize: number) => setConfig('iconSize', _iconSize), []);

  return [iconSize, updateIconSize];
}