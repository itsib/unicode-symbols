import { memo } from 'react';

interface ICharacter {
  code: number;
  name?: string;
  mnemonic?: string;
  description?: string;
  onClick?: () => void;
}

export const Character = memo(function Character({ code, name, mnemonic, description, onClick }: ICharacter) {
  return (
    <div className="character" onClick={onClick}>
      <div className="symbol" aria-label={name} data-tooltip-pos="top">
        {mnemonic ? (
          <div className="mnemonic">
            <div>{mnemonic.slice(0, -2)}</div>
            <div>{mnemonic.slice(-2)}</div>
          </div>
        ) : (
          <div className="code">
            <span dangerouslySetInnerHTML={{ __html: `&#${code};` }}/>
          </div>
        )}
      </div>

      <div className="separator"/>

      <div className="subscribe">
        <span>{code.toString(16).toUpperCase()}</span>
      </div>
    </div>
  );
}, (prevProps, nextProps) => prevProps.code !== nextProps.code);