import React from 'react';
import {render} from 'react-dom';
import './types/index.ts';
import App from './ui/App';
import {createServices} from './services';
import {ServiceContext} from './ui/hooks/useServices';
import {SnackbarProvider} from './ui/Snackbar/SnackbarProvider';

const services = createServices();

render(
  (<ServiceContext.Provider value={services}>
    <SnackbarProvider>
      <App/>
    </SnackbarProvider>
  </ServiceContext.Provider>),
  document.getElementById('app')
);
