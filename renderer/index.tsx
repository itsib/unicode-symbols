import { createRoot } from 'react-dom/client';
import React, { StrictMode } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ROUTES } from './routes/routes';

const rootElement = document.getElementById('root') as HTMLElement;
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <RouterProvider router={ROUTES} />
  </StrictMode>
)