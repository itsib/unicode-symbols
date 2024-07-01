import { createBrowserRouter as createRouter } from 'react-router-dom';
import { SymbolsPage } from './symbols/symbols';
import { SettingsPage } from './settings/settings';
import { CreatePage } from './create/create';

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
]);