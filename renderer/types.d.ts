/// <reference types="vite-plugin-svgr/client" />
/// <reference types="react" />


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