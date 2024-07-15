import { createHashRouter as createRouter } from 'react-router-dom';
import { SymbolsPage } from './symbols/symbols';
import { SettingsPage } from './settings/settings';
import { Error404 } from './error-404/error-404';
import { Layout } from './layout';
import { Error500 } from './error-500/error-500';

export const ROUTES = createRouter([
  {
    path: '/',
    Component: Layout,
    ErrorBoundary: Error500,
    children: [
      {
        path: '/',
        Component: SymbolsPage,
      },
      {
        path: 'settings',
        Component: SettingsPage,
      },
      {
        path: '*',
        Component: Error404,
      },
    ],
  }
]);