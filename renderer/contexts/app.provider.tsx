import { FC, PropsWithChildren, useState } from 'react';
import { AppContext } from './app.context';

export const AppProvider: FC<PropsWithChildren> = ({ children }) => {
  const [iconSize, setIconSize] = useState(1);



  return (
    <AppContext.Provider value={{ iconSize }}>
      {children}
    </AppContext.Provider>
  );
};