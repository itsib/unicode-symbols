import { FC, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LeftMenu } from '../components/left-menu/left-menu';

export const Layout: FC = () => {
  const pageRef = useRef<HTMLDivElement | null>();
  const { pathname } = useLocation();

  useEffect(() => {
    const div = pageRef.current;
    if (!div) {
      return;
    }

    // div.addEventListener('scroll', console.log)
    div.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="layout">
      <div className="menu-overlay">
        <LeftMenu />
      </div>

      <div className="pages-content" ref={pageRef}>
        <div className="scroll-overlay" >
          <Outlet />
        </div>
      </div>
    </div>
  );
};