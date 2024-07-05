import { FC, useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LottiePlayer } from '../components/lottie-player/lottie-player';
import initializationAnimation from '../../assets/animations/initialization.json'

const DURATION = 400;

export const Layout: FC = () => {
  const navigate = useNavigate();
  const backdropRef = useRef<HTMLDivElement>();
  const mainRef = useRef<HTMLDivElement>();
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(loading);

  // Listen loading flag change
  useEffect(() => {
    return window.appAPI.on<{ isLoading: boolean }>('main-loading', ({ isLoading }) => setLoading(isLoading));
  }, []);

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
    return window.appAPI.on<{ path: string }>('redirect', ({ path }) => navigate(path));
  }, []);

  return (
    <div className="layout-page">
      <div className="loading-backdrop" ref={backdropRef}>
        <LottiePlayer className="animation" object={initializationAnimation} loop={true}/>
        <div className="message">Data preparation</div>
      </div>
      <div className="main-wrap" ref={mainRef}>
        <Outlet />
      </div>
    </div>
  );
};