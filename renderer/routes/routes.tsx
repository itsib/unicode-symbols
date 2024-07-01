import { createBrowserRouter as createRouter } from 'react-router-dom';
import { SymbolsPage } from './symbols/symbols';
import { SettingsPage } from './settings/settings';
import { CreatePage } from './create/create';
import { GroupPage } from './symbols/group/group';

export const ROUTES = createRouter([
  {
    path: '/',
    Component: SymbolsPage,
    children: [
      {
        index: true,
        Component: GroupPage,
      },
      {
        path: 'symbols/:iconGroupId',
        Component: GroupPage,
      },
    ],
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