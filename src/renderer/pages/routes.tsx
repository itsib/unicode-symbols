import { createHashRouter as createRouter } from 'react-router-dom';
import { SymbolsPage } from './symbols/symbols';
import { Error404 } from './error-404/error-404';
import { Error500 } from './error-500/error-500';
import { Layout } from './layout';

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
        path: '*',
        Component: Error404,
      },
    ],
  }
]);
