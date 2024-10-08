import React, { CSSProperties, FC, useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LottiePlayer } from '../components/lottie-player/lottie-player';
import { useIdbReady } from '../hooks/indexed-db/use-idb-ready';
import { ModalSettings } from '../components/modal-settings/modal-settings';
import { useAppConfig } from '../hooks/use-app-config';
import { AppConfigKey } from '@app-context';
import initializationAnimation from '../../assets/animations/initialization.json';

const DURATION = 400;

export const Layout: FC = () => {
  const [fontFamily] = useAppConfig(AppConfigKey.FontFamily);
  const backdropRef = useRef<HTMLDivElement>();
  const mainRef = useRef<HTMLDivElement>();
  const loading = !useIdbReady();
  const loadingRef = useRef(loading);

  const [isSettings, setIsSettings] = useState(false);

  // Manage display animation
  useEffect(() => {
    const backdrop = backdropRef.current;
    const main = mainRef.current;

    if (loadingRef.current === loading) {
      return;
    }

    main.getAnimations().forEach(animation => animation.cancel());
    backdrop.getAnimations().forEach(animation => animation.cancel());

    main.animate(
      (loading ? [{ filter: 'blur(0)' }, { filter: 'blur(4px)' }] : [{ filter: 'blur(4px)' }, { filter: 'blur(0)' }]),
      {
        duration: DURATION,
        easing: "ease-in-out",
        fill: 'both',
      },
    );

    backdrop.style.display = 'flex';

    const animation = backdrop.animate(
      (loading ? [{ opacity: '0' }, { opacity: '1' }] : [{ opacity: '1' }, { opacity: '0' }]),
      {
        duration: DURATION,
        easing: "ease-in-out",
        fill: 'both',
      }
    );

    animation.addEventListener('finish', ((_loading: boolean) => () => {
      if(!_loading) {
        backdrop.style.display = 'none';
      }
    })(loading))

    loadingRef.current = loading;
  }, [loading]);

  // Manage redirects from main process
  useEffect(() => {
    return window.appAPI.on<{ path: string }>('settings', () => setIsSettings(true));
  }, []);

  return (
    <div className="layout-page" style={{ '--app-font-family': fontFamily } as CSSProperties}>
      <div className="loading-backdrop" ref={backdropRef}>
        <LottiePlayer className="animation" object={initializationAnimation} loop={true}/>
        <div className="message">Updating the Database</div>
      </div>
      <div className="main-wrap" ref={mainRef}>
        <Outlet context={{ loading }}/>
      </div>

      <ModalSettings onDismiss={() => setIsSettings(false)} isOpen={isSettings} />
    </div>
  );
};