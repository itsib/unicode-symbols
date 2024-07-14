import { FC, useEffect } from 'react';
import { useAppConfig } from '../../hooks/use-app-config';
import { AppConfigKey } from '@app-context';
import { useIdbLeftMenu } from '../../hooks/indexed-db/use-idb-left-menu';
import { ImgResource } from '../images/img-resource';

export const LeftMenu: FC = () => {
  const menuItems = useIdbLeftMenu();
  const [activeCategory, setActiveCategory] = useAppConfig(AppConfigKey.ActiveCategory);
  const [favorites] = useAppConfig(AppConfigKey.Favorites);

  useEffect(() => {
    if (favorites.length === 0 && activeCategory === 0) {
      setActiveCategory(1);
    }
  }, [activeCategory, favorites]);

  return (
    <menu className="left-menu">
      {menuItems.length ? (
        <>
          {favorites.length ? (
            <button
              type="button"
              className={`btn btn-menu-item ${0 === activeCategory ? 'active' : ''}`}
              onClick={() => setActiveCategory(0)}
            >
              <div className="menu-icon">
                <ImgResource src="star.svg" alt="Favorites" className="icon" />
              </div>
              <div className="label">
                <span>Favorites</span>
              </div>
            </button>
          ) : null}
          {menuItems.map(({ icon, name, id }) => (
            <button
              type="button"
              key={id}
              className={`btn btn-menu-item ${id === activeCategory ? 'active' : ''}`}
              onClick={() => setActiveCategory(id)}
            >
              <div className="menu-icon">
                <ImgResource src={icon} alt={name} className="icon" />
              </div>
              <div className="label">
                <span>{name}</span>
              </div>
            </button>
          ))}
        </>
      ) : (
        <div className="preloader">
          <div className="item pulse" />
          <div className="item pulse" />
          <div className="item pulse" />
          <div className="item pulse" />
          <div className="item pulse" />
        </div>
      )}
    </menu>
  );
}