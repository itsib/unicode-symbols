import { FC, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ModalDetail } from '../../components/modal-detail/modal-detail';
import { SYMBOLS } from '../../constants/symbols';
import { UnicodeRange } from '../../types';

const isRange = (value: any): value is UnicodeRange => {
  return value.start != null && value.end != null;
}

export const UnicodePage: FC = () => {
  const navigate = useNavigate();
  const groupId = useParams().groupId as string | undefined;
  const [active, setActive] = useState<number | undefined>();

  const config = useMemo(() => (groupId ? SYMBOLS.find(({ id }) => id === groupId) : undefined), [groupId])

  const characters = useMemo(() => {
    return config ? config.chars.flatMap(char => {
      const characters: { id: string, code: number, html: string }[] = [];

      if (isRange(char)) {
        for(let i = char.start; i <= char.end; i++) {
          characters.push({
            id: i.toString(16).toUpperCase(),
            code: i,
            html: `&#${i};`,
          });
        }
      } else {
        characters.push({
          id: char.code.toString(16).toUpperCase(),
          code: char.code,
          html:`&#${char.code};`,
        });
      }

      return characters;
    }) : undefined;
  }, [config]);

  useEffect(() => {
    if (groupId) {
      return;
    }
    const lastGroupId = localStorage.getItem('last-group-id') || SYMBOLS[0].id;
    navigate(`/unicode/${lastGroupId}`, { replace: true })
  }, [groupId, navigate]);

  useEffect(() => {
    if (!groupId) {
      return;
    }
    localStorage.setItem('last-group-id', groupId);
  }, [groupId]);

  return (
    <>
      <div className="unicode-page">
        {config ? (
          <div className="table">
            {characters.map(({ id, html, code }) => {
              return (
                <div className="character" key={code} onClick={() => setActive(code)}>
                  <div className="symbol">
                    <span dangerouslySetInnerHTML={{ __html: html }}/>
                  </div>
                  <div className="code">
                    <span>{id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      <ModalDetail code={active} onDismiss={() => setActive(undefined)} />
    </>
  );
};