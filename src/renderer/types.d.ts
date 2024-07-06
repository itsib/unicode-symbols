/// <reference types="react" />
/// <reference types="./types/index.ts" />

declare global {
  export interface AppApi {
    INDEXED_DB_CONFIG: { name: string; version: number },
    on<TData = void>(eventName: string, callback: (data: TData) => void): () => void;
    copyText(text: string): void;
    showContextMenu(meta?: any): void;
    getSymbolName(id: number): Promise<string>;
  }

  interface Window {
    appAPI: AppApi;
  }
}

declare module '*.svg' {
  export const ReactComponent: FC<SVGProps<SVGSVGElement>>;

  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

export interface Size {
  width: number;
  height: number;
}

export type TSymbolType = 'single' | 'range' | 'special';

interface TSymbolBase {
  type: TSymbolType;
  name: string;
}

export interface TSymbolSpecial extends TSymbolBase {
  type: 'special';
  code: number;
  mnemonic: string;
}

export interface TSymbolSingle extends TSymbolBase {
  type: 'single';
  code: number;
}

export interface TSymbolRange extends TSymbolBase {
  type: 'range';
  begin: number;
  end: number;
}

export type TSymbol = TSymbolSingle | TSymbolRange | TSymbolSpecial;

export interface CategoryOfSymbols {
  id: string,
  name: string,
  icon: ReactNode,
  color: boolean;
  chars: TSymbol[];
}