import React, { CSSProperties, FC, useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ModalSettings } from '../components/modal-settings/modal-settings';
import { useAppConfig } from '../hooks/use-app-config';
import { AppConfigKey } from '@app-context';
import initializationAnimation from '../../assets/animations/initialization.json';
import { useLoading } from '../hooks/use-loading';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const DURATION = 400;

export const Layout: FC = () => {
  const [fontFamily] = useAppConfig(AppConfigKey.FontFamily);
  const loading = useLoading();

  const [isSettings, setIsSettings] = useState(false);

  // Manage redirects from main process
  useEffect(() => {
    return window.appAPI.on<{ path: string }>('settings', () => setIsSettings(true));
  }, []);

  return (
    <div className="layout-page" style={{ '--app-font-family': fontFamily } as CSSProperties}>
      {loading ? (
        <div className="loading-backdrop">
          <DotLottieReact className="animation" data={initializationAnimation} loop autoplay />
          <div className="message">Updating the Database</div>
        </div>
      ) : null}

      <div className="main-wrap">
        <Outlet context={{ loading }}/>
      </div>

      <ModalSettings onDismiss={() => setIsSettings(false)} isOpen={isSettings} />
    </div>
  );
};
