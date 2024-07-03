import { createContext, FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { SYMBOLS } from '../constants/symbols';
import { TSymbolRange } from '../types';

export interface IAppContext {
  iconSize: number;
  activeCategory: string;
  range: Pick<TSymbolRange, 'begin' | 'end'>;

  setConfig<K extends AppConfigKey, T extends IAppContext[K]>(key: K, value: T): void;
}

export type AppConfigKey = keyof Omit<IAppContext, 'setConfig'>;

const DEFAULT_VALUES: IAppContext = {
  iconSize: 34 as const,
  activeCategory: SYMBOLS[0].id,
  range: {
    begin: 0x0,
    end: 0xFFFF,
  },
  setConfig: () => {throw new Error('Not implemented')},
};

export const AppContext = createContext<IAppContext>(DEFAULT_VALUES);

export const AppProvider: FC<PropsWithChildren> = ({ children }) => {
  const [iconSize, setIconSize] = useState<IAppContext['iconSize']>(DEFAULT_VALUES.iconSize);
  const [activeCategory, setActiveCategory] = useState<string>(DEFAULT_VALUES.activeCategory);
  const [range, setRange] = useState<Pick<TSymbolRange, 'begin' | 'end'>>(DEFAULT_VALUES.range);

  const setStateByKey = useCallback(function <K extends AppConfigKey, T extends IAppContext[K]>(key: K, value: T) {
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

  const setConfig = useCallback(function <K extends AppConfigKey, T extends IAppContext[K]>(key: K, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
    setStateByKey(key, value);
  }, []);

  // Restore states from local storage
  useEffect(() => {
    const keys = Object.keys(DEFAULT_VALUES) as AppConfigKey[];
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
    <AppContext.Provider value={{ iconSize, activeCategory, range, setConfig }}>
      {children}
    </AppContext.Provider>
  );
};