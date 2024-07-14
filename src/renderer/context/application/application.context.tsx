import { createContext } from 'react';
import { TSymbolRange } from '../../types';

export enum AppConfigKey {
  IconSize,
  ActiveCategory,
  LastRange,
  DevMode,
  Favorites,
}

export type AppConfig<Key extends AppConfigKey> =
  Key extends AppConfigKey.IconSize ? number :
    Key extends AppConfigKey.ActiveCategory ? number :
      Key extends AppConfigKey.LastRange ? Pick<TSymbolRange, 'begin' | 'end'> :
        Key extends AppConfigKey.DevMode ? boolean :
          Key extends AppConfigKey.Favorites ? number[] : never;

export interface IApplicationContext {
  config: { [ Key in AppConfigKey ]: AppConfig<Key> };
  setConfig<Key extends AppConfigKey, Val extends AppConfig<Key>>(key: Key, value: Val): void;
}

export const APPLICATION_CONTEXT_DEFAULT: IApplicationContext = {
  config: {
    [AppConfigKey.IconSize]: 34,
    [AppConfigKey.ActiveCategory]: 1,
    [AppConfigKey.LastRange]: {
      begin: 0x0,
      end: 0xFFFF,
    },
    [AppConfigKey.DevMode]: false,
    [AppConfigKey.Favorites]: [],
  },
  setConfig: () => {throw new Error('Not implemented')},
};

export const ApplicationContext = createContext<IApplicationContext>(APPLICATION_CONTEXT_DEFAULT);

