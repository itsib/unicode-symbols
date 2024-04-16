import { FC, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { SYMBOLS } from '../../constants/symbols';

export const LeftMenu: FC = () => {
  const colorItems = useMemo(() => SYMBOLS.filter(({ color }) => color), []);
  const monoItems = useMemo(() => SYMBOLS.filter(({ color }) => !color), []);

  return (
    <menu className="left-menu">
      <div className="group-name">
        Colored
      </div>
      {colorItems.map(({ Icon, name, id }) => (
        <NavLink key={id} to={`/unicode/${id}`} className="menu-item">
          <div className="menu-icon">
            <Icon />
          </div>
          <div className="label">
            <span>{name}</span>
          </div>
        </NavLink>
      ))}
      <div className="group-name">
        Monochrome
      </div>
      {monoItems.map(({ Icon, name, id }) => (
        <NavLink key={id} to={`/unicode/${id}`} className="menu-item">
          <div className="menu-icon">
            <Icon />
          </div>
          <div className="label">
            <span>{name}</span>
          </div>
        </NavLink>
      ))}
    </menu>
  );
}