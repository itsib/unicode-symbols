import React, { FC } from 'react';
import { createMemoryRouter, Navigate, useLoaderData } from 'react-router-dom';
import { SYMBOLS } from '../constants/symbols';
import { HomePage } from './home/home';
import { Layout } from './layout';
import { UnicodePage } from './unicode/unicode';

const Redirect: FC = () => {
  const { to, replace, relative } = useLoaderData() as { to: string; replace?: boolean; relative: 'route' | 'path' };
  return <Navigate to={to} replace={!!replace} relative={relative} />;
};

export const ROUTES = createMemoryRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        element: <Navigate to={`unicode/${SYMBOLS[0].id}`} replace={true} />,
      },
      {
        path: 'unicode/:char',
        Component: UnicodePage,
      }
    ],
  }
]);