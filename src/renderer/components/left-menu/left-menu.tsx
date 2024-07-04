import { FC } from 'react';
import { SYMBOLS } from '../../constants/symbols';
import { useIconCategory } from '../../hooks/use-icon-category';

export const LeftMenu: FC = () => {
  const [activeCategory, setActiveCategory] = useIconCategory();

  return (
    <menu className="left-menu">
      {SYMBOLS.map(({ icon, name, id }) => (
        <button
          type="button"
          key={id}
          className={`btn btn-menu-item ${id === activeCategory ? 'active' : ''}`}
          onClick={() => setActiveCategory(id)}
        >
          <div className="menu-icon">
            <img src={icon} alt={name} className="icon" />
          </div>
          <div className="label">
            <span>{name}</span>
          </div>
        </button>
      ))}
    </menu>
  );
}