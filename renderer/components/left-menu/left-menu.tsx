import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { SYMBOLS } from '../../constants/symbols';

export const LeftMenu: FC = () => {

  return (
    <menu className="left-menu">
      {SYMBOLS.map(({ Icon, name, id }) => (
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