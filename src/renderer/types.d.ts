/// <reference types="react" />

declare global {
  export interface AppApi {
    on<TData = void>(eventName: string, callback: (data: TData) => void): () => void;
    copyText(text: string): void;
    showContextMenu(meta?: any): void;
    getSymbolName(id: number): Promise<string>;
  }

  interface Window {
    appAPI: AppApi;
    setLoading: (isLoading: boolean) => void;
  }
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