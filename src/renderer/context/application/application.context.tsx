import { createContext } from 'react';
import { SymbolSkinColor } from '@app-types';
import { DEFAULT_FONT_FAMILY } from '../../constants/common';

export enum AppConfigKey {
  IconSize,
  ActiveCategory,
  DevMode,
  Favorites,
  SkinColor,
  NumberBase,
  FontFamily,
  SearchResult,
}

export type AppConfig<Key extends AppConfigKey> =
  Key extends AppConfigKey.IconSize ? number :
  Key extends AppConfigKey.ActiveCategory ? number :
  Key extends AppConfigKey.DevMode ? boolean :
  Key extends AppConfigKey.Favorites ? number[] :
  Key extends AppConfigKey.SkinColor ? SymbolSkinColor :
  Key extends AppConfigKey.NumberBase ? number :
  Key extends AppConfigKey.FontFamily ? string :
  Key extends AppConfigKey.SearchResult ? number :
      never;

export interface IApplicationContext {
  config: { [ Key in AppConfigKey ]: AppConfig<Key> };
  setConfig<Key extends AppConfigKey, Val extends AppConfig<Key>>(key: Key, value: Val): void;
}

export const APPLICATION_CONTEXT_DEFAULT: IApplicationContext = {
  config: {
    [AppConfigKey.IconSize]: 34,
    [AppConfigKey.ActiveCategory]: 1,
    [AppConfigKey.DevMode]: false,
    [AppConfigKey.Favorites]: [],
    [AppConfigKey.SkinColor]: 0,
    [AppConfigKey.NumberBase]: 16,
    [AppConfigKey.FontFamily]: DEFAULT_FONT_FAMILY,
    [AppConfigKey.SearchResult]: 0x1000,
  },
  setConfig: () => {throw new Error('Not implemented')},
};

export const ApplicationContext = createContext<IApplicationContext>(APPLICATION_CONTEXT_DEFAULT);

