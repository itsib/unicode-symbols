import { createRoot } from 'react-dom/client';
import React, { StrictMode } from 'react';

const rootElement = document.getElementById('root') as HTMLElement;
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <div>TEST</div>
  </StrictMode>
)