import { createMemoryRouter } from 'react-router-dom';
import { Layout } from './layout';
import { UnicodePage } from './unicode/unicode';

export const ROUTES = createMemoryRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: UnicodePage,
      },
      {
        path: 'unicode/:iconGroupId',
        Component: UnicodePage,
      },
    ],
  }
]);