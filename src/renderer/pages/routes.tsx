import { createHashRouter as createRouter } from 'react-router-dom';
import { SymbolsPage } from './symbols/symbols';
import { SettingsPage } from './settings/settings';
import { CreatePage } from './create/create';
import { Error404 } from './error-404/error-404';

export const ROUTES = createRouter([
  {
    path: '/',
    Component: SymbolsPage,
  },
  {
    path: 'create',
    Component: CreatePage,
  },
  {
    path: 'settings',
    Component: SettingsPage,
  },
  {
    path: '*',
    Component: Error404,
  }
]);