import { createContext } from 'react';
import { SYMBOLS } from '../../constants/symbols';
import { TSymbolRange } from '../../types';

export interface IApplicationContext {
  iconSize: number;
  activeCategory: string;
  range: Pick<TSymbolRange, 'begin' | 'end'>;

  setConfig<K extends AppConfigKey, T extends IApplicationContext[K]>(key: K, value: T): void;
}

export type AppConfigKey = keyof Omit<IApplicationContext, 'setConfig'>;

export const APPLICATION_CONTEXT_DEFAULT: IApplicationContext = {
  iconSize: 34 as const,
  activeCategory: SYMBOLS[0].id,
  range: {
    begin: 0x0,
    end: 0xFFFF,
  },
  setConfig: () => {throw new Error('Not implemented')},
};

export const ApplicationContext = createContext<IApplicationContext>(APPLICATION_CONTEXT_DEFAULT);

