import React, {createContext, ReactNode, useState} from 'react';
import {Snackbar} from './Snackbar';


type Show = (message: string) => void;
// @typescript-eslint/no-explicit-any
export const SnackbarContext = createContext<{show: Show}>({} as any);

const SNACKBAR_TIMEOUT = 3000;

export function SnackbarProvider({children}: {children: ReactNode}) {
  const [content, setContent] = useState('');
  const [visible, setVisible] = useState(false);

  const show = (message: string) => {
    setContent(message);
    setVisible(true);
    setTimeout(() => { setVisible(false); setContent(''); }, SNACKBAR_TIMEOUT);
  };

  return (
    <SnackbarContext.Provider value={{show}}>
      {children}
      <Snackbar content={content} visible={visible}/>
    </SnackbarContext.Provider>
  );
}
