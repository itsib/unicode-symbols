import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { LeftMenu } from '../../components/left-menu/left-menu';
import { useAppConfig } from '../../hooks/use-app-config';
import { AppConfigKey } from '@app-context';
import { useCodesByGroup } from '../../hooks/use-codes-by-group';
import { SymbolsGrid } from '../../components/symbols-grid/symbols-grid';
import { useCodesBySearch } from '../../hooks/indexed-db/use-codes-by-search';
import { ImgClose } from '../../components/images/img-close';
import { ImgArrow } from '../../components/images/img-arrow';
import { useOutletContext } from 'react-router-dom';
import { NothingFound } from '../../components/nothing-found/nothing-found';
import { debounce } from '../../utils/debounce';
import { useLog } from '../../hooks/use-log';

export const SymbolsPage: FC = () => {
  const [activeCategory] = useAppConfig(AppConfigKey.ActiveCategory);

  // Search stuff
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isSearch, setIsSearch] = useState(false);
  const [isSearchRight, setIsSearchRight] = useState(false);
  const [search, setSearch] = useState('');

  const { loading } = useOutletContext<{ loading: boolean }>();
  const skeletonItems = useMemo(() => new Array(24).fill(1), []);

  const foundCodes = useCodesBySearch(search);
  const groupCodes = useCodesByGroup(activeCategory);

  const codes = search ? foundCodes : groupCodes;

  function cleanSearch() {
    setIsSearch(false);
    inputRef.current.value = ''
    setSearch('');
  }

  // Open search
  useEffect(() => {
    const input = inputRef.current
    if (!input) return

    const unsubscribe =  window.appAPI.on('search', () => {
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

    const setValue = debounce<string>(value => setSearch(value), 800)
    const onInput = (event: Event) => setValue(((event.target as any).value || '') as string)

    input.addEventListener('input', onInput)

    return () => {
      unsubscribe()
      input.removeEventListener('change', onInput)
    };
  }, []);

  // Reset search after category change
  useEffect(() => cleanSearch(), [activeCategory]);

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
            <input
              id="symbol-serch"
              type="search"
              placeholder="Search symbol..."
              tabIndex={1}
              autoFocus
              ref={inputRef}
            />

            <button type="button" className="btn btn-close" onClick={cleanSearch}>
              <ImgClose />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="main-loading">
            {skeletonItems.map((_, key) => (<div key={key} className="pulse"/>))}
          </div>
        ) : codes?.length ? (
          <SymbolsGrid codes={codes} />
        ) : search.length ? (
          <NothingFound />
        ) : null}
      </div>
    </div>
  );
};
