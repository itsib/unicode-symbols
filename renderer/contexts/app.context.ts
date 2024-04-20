import { createContext } from 'react';

export interface IAppContext {
  iconSize: number;
}

export const AppContext = createContext<IAppContext>({
  iconSize: 1,
});