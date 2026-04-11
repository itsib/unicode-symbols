import React, { CSSProperties, FC, useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ModalSettings } from '../components/modal-settings/modal-settings';
import { useAppConfig } from '../hooks/use-app-config';
import { AppConfigKey } from '@app-context';

export const Layout: FC = () => {
  const [fontFamily] = useAppConfig(AppConfigKey.FontFamily);
  const [isSettings, setIsSettings] = useState(false);

  // Manage redirects from main process
  useEffect(() => {
    return window.appAPI.on<{ path: string }>('settings', () => setIsSettings(true));
  }, []);

  return (
    <div className="layout-page" style={{ '--app-font-family': fontFamily } as CSSProperties}>
      <div className="main-wrap">
        <Outlet />
      </div>

      <ModalSettings onDismiss={() => setIsSettings(false)} isOpen={isSettings} />
    </div>
  );
};
