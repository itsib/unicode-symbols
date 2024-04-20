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

interface UnicodeBase {
  tags?: string[];
}

export interface UnicodeChar extends UnicodeBase {
  code: number;
  name: string;
}

export interface UnicodeRange extends UnicodeBase {
  start: number;
  end: number;
  prefix?: string;
}

export type Unicode = UnicodeChar | UnicodeRange;

export interface CategoryIcons {
  id: string,
  name: string,
  Icon: ReactNode,
  color: boolean;
  chars: Unicode[];
}