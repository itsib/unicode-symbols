import { CSSProperties, FC, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Character } from '../../components/character/character';
import { ModalDetail } from '../../components/modal-detail/modal-detail';
import { SYMBOLS } from '../../constants/symbols';
import { UnicodeRange } from '../../types';

const MIN_FONT_SIZE = 30;
const MAX_FONT_SIZE = 65;
const STEP_SIZE_PERCENT = 5;

const isRange = (value: any): value is UnicodeRange => {
  return value.start != null && value.end != null;
}

const resize = (page: HTMLDivElement, delta?: number) => {
  const zoomPrev = parseInt(localStorage.getItem('zoom') ?? '50');
  const zoomNext = delta == null ? zoomPrev : delta < 0 ? zoomPrev + STEP_SIZE_PERCENT : zoomPrev - STEP_SIZE_PERCENT;
  const zoom =  Math.round(Math.max(Math.min(zoomNext, 100), 0)); // in %

  localStorage.setItem('zoom', `${zoom}`);

  const fontSize = MIN_FONT_SIZE + ((MAX_FONT_SIZE - MIN_FONT_SIZE) * (zoom / 100));
  page.style.fontSize = `${fontSize}px`;
};

export const UnicodePage: FC = () => {
  const pageRef = useRef<HTMLDivElement>()
  const tableRef = useRef<HTMLDivElement>()

  const navigate = useNavigate();
  const groupId = useParams().groupId as string | undefined;
  const [active, setActive] = useState<number | undefined>();

  const config = useMemo(() => (groupId ? SYMBOLS.find(({ id }) => id === groupId) : undefined), [groupId])

  const characters = useMemo(() => {
    return config ? config.chars.flatMap(char => {
      const characters: number[] = [];

      if (isRange(char)) {
        for(let i = char.start; i <= char.end; i++) {
          characters.push(i);
        }
      } else {
        characters.push(char.code);
      }
      return characters;
    }) : undefined;
  }, [config]);

  // Save and restore page id
  useEffect(() => {
    if (groupId) {
      localStorage.setItem('last-page-id', groupId);
      return;
    }
    const lastPageId = localStorage.getItem('last-page-id') || SYMBOLS[0].id;
    navigate(`/unicode/${lastPageId}`, { replace: true })
  }, [groupId, navigate]);

  // Size of icons
  useEffect(() => {
    const page = pageRef.current;

    resize(page);

    const onResize = (event: WheelEvent) => {
      if (!event.ctrlKey) {
        return;
      }

      // New size computation
      const page = event.currentTarget as HTMLDivElement;
      resize(page, event.deltaY);
    }

    page.addEventListener('wheel', onResize);
    return () => {
      page.removeEventListener('wheel', onResize);
    }
  }, []);

  return (
    <>
      <div className="unicode-page" ref={pageRef}>
        {config ? (
          <div className="table" ref={tableRef}>
            {characters.map(code => (
              <div className="table-cell" key={code}>
                <Character code={code} onClick={_code => setActive(_code)} />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <ModalDetail code={active} onDismiss={() => setActive(undefined)} />
    </>
  );
};