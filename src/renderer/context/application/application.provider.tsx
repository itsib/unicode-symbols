import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import {
  AppConfigKey,
  APPLICATION_CONTEXT_DEFAULT,
  ApplicationContext,
  IApplicationContext,
} from './application.context';
import { TSymbolRange } from '../../types';

export const ApplicationProvider: FC<PropsWithChildren> = ({ children }) => {
  const [iconSize, setIconSize] = useState<IApplicationContext['iconSize']>(APPLICATION_CONTEXT_DEFAULT.iconSize);
  const [activeCategory, setActiveCategory] = useState<string>(APPLICATION_CONTEXT_DEFAULT.activeCategory);
  const [range, setRange] = useState<Pick<TSymbolRange, 'begin' | 'end'>>(APPLICATION_CONTEXT_DEFAULT.range);

  const setStateByKey = useCallback(function <K extends AppConfigKey, T extends IApplicationContext[K]>(key: K, value: T) {
    switch (key) {
      case 'iconSize':
        setIconSize(value as any);
        break;
      case 'activeCategory':
        setActiveCategory(value as any);
        break;
      case 'range':
        setRange(value as any);
        break;
    }
  }, [])

  const setConfig = useCallback(function <K extends AppConfigKey, T extends IApplicationContext[K]>(key: K, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
    setStateByKey(key, value);
  }, []);

  // Restore states from local storage
  useEffect(() => {
    const keys = Object.keys(APPLICATION_CONTEXT_DEFAULT) as AppConfigKey[];
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value != null) {
        try {
          setStateByKey(key, JSON.parse(value));
        } catch (e) {
          console.warn(e);
        }
      }
    }
  }, []);

  return (
    <ApplicationContext.Provider value={{ iconSize, activeCategory, range, setConfig }}>
      {children}
    </ApplicationContext.Provider>
  );
};