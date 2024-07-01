import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { LeftMenu } from '../../components/left-menu/left-menu';

export const SymbolsPage: FC = () => {
  return (
    <div className="symbols-page">
      <div className="menu-overlay">
        <LeftMenu />
      </div>

      <div className="page-content">
        <Outlet />
      </div>
    </div>
  );
};