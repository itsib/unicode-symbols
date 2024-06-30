/// <reference types="vite-plugin-svgr/client" />
/// <reference types="react" />

declare global {
  export interface AppApi {
    copyText(text: string): void;
    showContextMenu(meta?: any): void;
  }

  interface Window {
    appAPI: AppApi;
  }
}

export type UnicodeType = 'single' | 'Range' | 'divider' | 'special';

interface UnicodeBase {
  type: UnicodeType;
}

export interface UnicodeDivider extends UnicodeBase {
  type: 'divider';
}

export interface UnicodeSpecial extends UnicodeBase {
  type: 'special';
  code: number;
  mnemonic: string;
  name: string;
}

export interface UnicodeChar extends UnicodeBase {
  type: 'single';
  code: number;
  name: string;
  tags?: string[];
}

export interface UnicodeRange extends UnicodeBase {
  type: 'range';
  start: number;
  end: number;
  skip?: number[];
  tags?: string[];
}

export type Unicode = UnicodeChar | UnicodeRange | UnicodeDivider | UnicodeSpecial;

export interface CategoryIcons {
  id: string,
  name: string,
  Icon: ReactNode,
  color: boolean;
  chars: Unicode[];
}