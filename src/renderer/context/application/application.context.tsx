import { createContext } from 'react';
import { TSymbolRange } from '../../types';

export enum AppConfigKey {
  IconSize,
  ActiveCategory,
  LastRange,
}

export type AppConfig<T extends AppConfigKey> =
  T extends AppConfigKey.IconSize ? number :
  T extends AppConfigKey.ActiveCategory ? number :
  T extends AppConfigKey.LastRange ? Pick<TSymbolRange, 'begin' | 'end'> : never;

export interface IApplicationContext {
  config: { [ Key in AppConfigKey ]: AppConfig<Key> };
  setConfig<K extends AppConfigKey, T extends AppConfig<K>>(key: K, value: T): void;
}

export const APPLICATION_CONTEXT_DEFAULT: IApplicationContext = {
  config: {
    [AppConfigKey.IconSize]: 34,
    [AppConfigKey.ActiveCategory]: 1,
    [AppConfigKey.LastRange]: {
      begin: 0x0,
      end: 0xFFFF,
    },
  },
  setConfig: () => {throw new Error('Not implemented')},
};

export const ApplicationContext = createContext<IApplicationContext>(APPLICATION_CONTEXT_DEFAULT);

