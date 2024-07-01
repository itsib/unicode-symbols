import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AppProvider } from './contexts/app.context';
import { ROUTES } from './pages/routes';

const rootElement = document.getElementById('root') as HTMLElement;
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <AppProvider>
      <RouterProvider router={ROUTES} />
    </AppProvider>
  </StrictMode>
)