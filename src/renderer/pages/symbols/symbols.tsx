import React, { FC, useEffect, useRef, useState } from 'react';
import { LeftMenu } from '../../components/left-menu/left-menu';
import { useAppConfig } from '../../hooks/use-app-config';
import { AppConfigKey } from '@app-context';
import { useGetGroup } from '../../hooks/indexed-db/use-get-group';
import { SymbolsGrid } from '../../components/symbols-grid/symbols-grid';
import { FormControlInput } from '../../components/forms';
import { useIdbSearchSymbol } from '../../hooks/indexed-db/use-idb-search-symbol';
import { ImgClose } from '../../components/images/img-close';
import animation from '../../../assets/animations/magnifier.json';
import { LottiePlayer } from '../../components/lottie-player/lottie-player';
import { ImgArrow } from '../../components/images/img-arrow';

export const SymbolsPage: FC = () => {
  const inputRef = useRef<HTMLInputElement>();
  const [activeCategory] = useAppConfig(AppConfigKey.ActiveCategory);
  const [isSearch, setIsSearch] = useState(false);
  const [isSearchRight, setIsSearchRight] = useState(false);
  const [search, setSearch] = useState('');
  const [showPlayer, setShowPlayer] = useState(false);

  const [favorites] = useAppConfig(AppConfigKey.Favorites);
  const predefined = useGetGroup(activeCategory);
  const foundCodes = useIdbSearchSymbol(search);

  const codes = search ? foundCodes : (activeCategory === 0 ? favorites : predefined);

  // Open search
  useEffect(() => {
    return window.appAPI.on('search', () => {
      setIsSearch(true);
      inputRef.current?.focus?.();

      const onKey = (event: KeyboardEvent) => {
        if (event.code === 'Escape') {
          setIsSearch(false);
          inputRef.current?.removeEventListener('keydown', onKey);
        }
      }

      inputRef.current?.addEventListener('keydown', onKey);
    });
  }, []);

  // Remote animation show delay
  useEffect(() => {
    if (codes?.length) {
      return setShowPlayer(false);
    }

    const timer = setTimeout(() => setShowPlayer(true), 300);
    return () => clearTimeout(timer);
  }, [codes]);

  // Reset search after category change
  useEffect(() => {
    setIsSearch(false);
    inputRef.current.value = '';
    setSearch('');
  }, [activeCategory]);

  return (
    <div className="symbols-page">
      <div className="menu-overlay">
        <LeftMenu />
      </div>

      <div className="page-content">
        <div className={`search-dropdown ${isSearch ? 'active' : ''} ${isSearchRight ? 'left' : ''}`}>
          <button className="btn btn-pull" onClick={() => setIsSearchRight(i => !i)}>
            <ImgArrow direction={isSearchRight ? 'right' : 'left'} />
          </button>

          <div className="search-block">
            <FormControlInput
              type="search"
              tabIndex={1}
              id="symbol-serch"
              placeholder="Search symbol..."
              value={search}
              onChange={setSearch}
              ref={inputRef}
            />

            <button
              className="btn btn-close"
              onClick={() => {
                setSearch('');
                setIsSearch(false);
              }}
            >
              <ImgClose />
            </button>
          </div>
        </div>

        {codes?.length ? (
          <SymbolsGrid codes={codes} />
        ) : (
          <div className={`not-found ${showPlayer ? 'show' : ''}`}>
            <LottiePlayer className="animation" object={animation} loop={false} />
          </div>
        )}
      </div>
    </div>
  );
};
