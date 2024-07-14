import React, { FC, useEffect, useRef, useState } from 'react';
import { LeftMenu } from '../../components/left-menu/left-menu';
import { useAppConfig } from '../../hooks/use-app-config';
import { AppConfigKey } from '@app-context';
import { useGetSymbolsByMenu } from '../../hooks/indexed-db/use-get-symbols-by-menu';
import { SymbolsGrid } from '../../components/symbols-grid/symbols-grid';
import { FormControlInput } from '../../components/forms';
import { useIdbSearchSymbol } from '../../hooks/indexed-db/use-idb-search-symbol';
import { ImgClose } from '../../components/images/img-close';

export const SymbolsPage: FC = () => {
  const ref = useRef(null);
  const [activeCategory] = useAppConfig(AppConfigKey.ActiveCategory);
  const [isSearch, setIsSearch] = useState(false);
  const [search, setSearch] = useState('');

  const [favorites] = useAppConfig(AppConfigKey.Favorites);
  const predefined = useGetSymbolsByMenu(activeCategory);
  const foundCodes = useIdbSearchSymbol(search);

  const codes = search ? foundCodes : (activeCategory === 0 ? favorites : predefined);

  useEffect(() => {
    return window.appAPI.on('search', () => setIsSearch(true));
  }, []);

  useEffect(() => {
    if (isSearch) {
      ref.current?.focus?.();
    }
  }, [isSearch]);

  return (
    <div className="symbols-page">
      <div className="menu-overlay">
        <LeftMenu />
      </div>

      <div className="page-content">
        <div className={`search-wrap ${isSearch ? 'active' : ''}`}>
          <FormControlInput
            type="search"
            id="symbol-serch"
            placeholder="Search symbol..."
            value={search}
            onChange={setSearch}
            ref={ref}
          />

          <button className="btn btn-close" onClick={() => {
            setSearch('');
            setIsSearch(false);
          }}>
            <ImgClose />
          </button>
        </div>

        <SymbolsGrid codes={codes} />
      </div>
    </div>
  );
};
