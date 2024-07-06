import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ROUTES } from './pages/routes';
import { IndexedDbProvider, ApplicationProvider } from '@app-context';

const rootElement = document.getElementById('root') as HTMLElement;
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <IndexedDbProvider>
      <ApplicationProvider>
        <RouterProvider router={ROUTES} />
      </ApplicationProvider>
    </IndexedDbProvider>
  </StrictMode>
)