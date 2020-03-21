import React from 'react';
import {render} from 'react-dom';
import './types/index.ts';
import App from './ui/App';
import {createServices} from './services';
import {ServiceContext} from './ui/hooks/useServices';

const services = createServices();

render(
  (<ServiceContext.Provider value={services}>
    <App/>
  </ServiceContext.Provider>),
  document.getElementById('app')
);
