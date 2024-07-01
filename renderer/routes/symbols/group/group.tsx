import { FC, useMemo, useRef, useState } from 'react';
import { Character } from '../../../components/character/character';
import { ModalDetail } from '../../../components/modal-detail/modal-detail';
import { SYMBOLS } from '../../../constants/symbols';
import { useIconGroupId } from '../../../hooks/use-icon-group-id';
import { useResizeHandler } from '../../../hooks/use-resize-handler';

export const GroupPage: FC = () => {
  const pageRef = useRef<HTMLDivElement>()
  const iconGroupId = useIconGroupId();
  const [active, setActive] = useState<{ code: number, mnemonic?: string; name?: string } | undefined>();

  const config = useMemo(() => (iconGroupId ? SYMBOLS.find(({ id }) => id === iconGroupId) : undefined), [iconGroupId])

  const tables = useMemo(() => {
    if (!config) {
      return [];
    }
    const tables: ({ code: number, name?: string, mnemonic?: string })[][] = [[]];

    for (let i = 0; i < config.chars.length; i++) {
      const chars = config.chars[i];

      if (chars.type === 'single') {
        tables[tables.length - 1].push({ code: chars.code, name: chars.name })
      } else if (chars.type === 'range') {
        for(let i = chars.start; i <= chars.end; i++) {
          if (!chars.skip?.includes(i)) {
            tables[tables.length - 1].push({ code: i });
          }
        }
      } else if (chars.type === 'special') {
        tables[tables.length - 1].push({ code: chars.code, mnemonic: chars.mnemonic, name: chars.name });
      } else if (chars.type === 'divider') {
        tables.push([]);
      }
    }

    return tables;
  }, [config]);

  useResizeHandler(pageRef);

  return (
    <>
      <div className="group-page" ref={pageRef}>
        {tables.map((table, index) => (
          <div className="table-owerlay" key={`table-${index}`}>
            <div className="table">
              {table.map(character => (
                <div className="table-cell" id={`char-${index}-${character.code}`} key={`${index}-${character.code}`}>
                  <Character
                    code={character.code}
                    name={character.name}
                    mnemonic={character.mnemonic}
                    onClick={() => setActive({ code: character.code, name: character.name, mnemonic: character.mnemonic })}
                  />
                </div>
              ))}
            </div>
            {tables.length - 1 !== index ? (
              <hr className="divider"/>
            ) : null}
          </div>
        ))}
      </div>

      <ModalDetail code={active?.code} name={active?.name} onDismiss={() => setActive(undefined)}/>
    </>
  );
};

// const ref = useRef<HTMLDivElement>()
//
// useEffect(() => {
//     const element = ref.current;
//
//     const onContextmenu = () => {
//       window.appAPI.showContextMenu(code);
//     }
//
//     element.addEventListener('contextmenu', onContextmenu);
//     return () => {
//       element.removeEventListener('contextmenu', onContextmenu);
//     }
//   }, [code]);