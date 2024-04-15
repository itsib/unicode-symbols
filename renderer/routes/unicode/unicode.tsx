import { FC, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ModalDetail } from '../../components/modal-detail/modal-detail';
import { SYMBOLS } from '../../constants/symbols';

export const UnicodePage: FC = () => {
  const charCode = useParams().char;
  const [activeCode, setActiveCode] = useState<number | undefined>();

  const config = useMemo(() => (SYMBOLS.find(({ id }) => id === charCode)), [charCode])

  const characters = useMemo(() => {
    return config.ranges.flatMap(({ from, to }) => {
      const start = parseInt(from.replace('U+', ''), 16);
      const end = parseInt(to.replace('U+', ''), 16);
      const characters: { id: string, code: number, html: string; }[] = [];

      for(let i = start; i <= end; i++) {
        characters.push({
          id: i.toString(16).toUpperCase(),
          code: i,
          html: String.fromCharCode(i),
        })
      }
      return characters;
    });
  }, [config]);

  return (
    <>
      <div className="unicode-page">
        <div className="table">
          {characters.map(({ id, html, code }) => {
            return (
              <div className="character" key={code} onClick={() => setActiveCode(code)}>
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
      </div>

      <ModalDetail code={activeCode} isOpen={!!activeCode} onDismiss={() => setActiveCode(undefined)} />
    </>
  );
};