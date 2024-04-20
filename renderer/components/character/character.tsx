import { memo, useEffect, useRef } from 'react';

interface ICharacter {
  code: number;
  onClick?: (code: number) => void;
}

export const Character = memo(function Character({ code, onClick }: ICharacter) {
  const ref = useRef<HTMLDivElement>()
  const id = code.toString(16).toUpperCase();

  useEffect(() => {
    const element = ref.current;

    const onContextmenu = () => {
      window.appAPI.showContextMenu(code);
    }

    element.addEventListener('contextmenu', onContextmenu);
    return () => {
      element.removeEventListener('contextmenu', onContextmenu);
    }
  }, [code]);

  return (
    <div className="character" key={code} onClick={() => onClick?.(code)} ref={ref}>
      <div className="symbol">
        <span dangerouslySetInnerHTML={{ __html: `&#${code};` }}/>
      </div>
      <div className="separator" />
      <div className="code">
        <span>{id}</span>
      </div>
    </div>
  );
});