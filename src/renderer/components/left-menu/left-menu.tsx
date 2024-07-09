import { FC } from 'react';
import { useAppConfig } from '../../hooks/use-app-config';
import { AppConfigKey } from '@app-context';
import { useIdbLeftMenu } from '../../hooks/indexed-db/use-idb-left-menu';
import { ImgResource } from '../images/img-resource';

export const LeftMenu: FC = () => {
  const menuItems = useIdbLeftMenu();
  const [activeCategory, setActiveCategory] = useAppConfig(AppConfigKey.ActiveCategory);

  return (
    <menu className="left-menu">
      {menuItems.length ? (
        <>
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