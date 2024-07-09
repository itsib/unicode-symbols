import React, { memo } from 'react';

const JOINER = '&#8205;'; // 0x200D;
const RESTYLE = '&#65039;'; // 0xFE0F;

const MOD_SKIN: Record<number, string> = {
  [0]: '',       // No modified   Type 1 - Pale white
  [1]: '&#127995;', // 0x1F3FB 🏻 Type 2 - White
  [2]: '&#127996;', // 0x1F3FC 🏼 Type 3 - Light brown
  [3]: '&#127997;', // 0x1F3FD 🏽 Type 4 - Medium brown
  [4]: '&#127998;', // 0x1F3FE 🏾 Type 5 - Brown
  [5]: '&#127999;', // 0x1F3FF 🏿 Type 6 - Black
};

const MOD_HAIR: Record<number, string> = {
  [1]: '&#129456;', // 0x1F9B0 🦰 White
  [2]: '&#129457;', // 0x1F3F1 🦱 Tanned
  [3]: '&#129458;', // 0x1F3F2 🦲 Brown
  [4]: '&#129459;', // 0x1F3F3 🦳 Dark
}

const codeToHtml = (code: number): string => `&#${code.toString(10)};`;

export interface IImgSymbol extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  size?: number | string;
  code?: number;
  isStyled?: boolean;
  skin?: number;
  join?: number;
  modifier?: number[];
}

export const ImgSymbol = memo(function IImgSymbol({ size = 42, code, isStyled, skin, join, modifier, ...props }: IImgSymbol) {
  let html = code ? codeToHtml(code) : '';
  if (html && isStyled) {
    html += RESTYLE;
  }
  // Skin mod
  if (html && skin != null && MOD_SKIN[skin]) {
    html += MOD_SKIN[skin];
  }
  // Join other emoji
  if (html && join != null) {
    html += (JOINER + codeToHtml(join));
  }
  // Apply custom modifiers
  if (html && modifier && modifier.length) {
    html += modifier.map(codeToHtml).join('');
  }

  // 1.3em

  return (
    <div
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        aspectRatio: '1',
        fontSize: typeof size === 'number' ? `${Math.round(size * 0.8)}px` : 'inherit',
        lineHeight: typeof size === 'number' ? `${size}px` : size,
        textAlign: 'center'
      }}
      {...props}
    >
      {html ? <span dangerouslySetInnerHTML={{ __html: html }}/> : null}
    </div>
  );
})
