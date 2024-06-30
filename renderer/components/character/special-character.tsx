import { memo, useEffect, useRef } from 'react';

interface ISpecialCharacter {
  code: number;
  mnemonic: string;
  onClick?: (code: number) => void;
}

export const SpecialCharacter = memo(function SpecialCharacter({ code, mnemonic, onClick }: ISpecialCharacter) {
  const id = code.toString(16).toUpperCase();

  return (
    <div className="character" key={code} onClick={() => onClick?.(code)}>
      <div className="special">
        <div>{mnemonic.slice(0, -2)}</div>
        <div>{mnemonic.slice(-2)}</div>
      </div>
      <div className="separator"/>
      <div className="code">
        <span>{id}</span>
      </div>
    </div>
  );
}, (prevProps, nextProps) => prevProps.code !== nextProps.code || prevProps.mnemonic !== nextProps.mnemonic);