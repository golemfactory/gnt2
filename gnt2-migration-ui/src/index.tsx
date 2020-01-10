import React from 'react';
import {render} from 'react-dom';
import './styles/index.sass';
import './types/index.ts';
import App from './ui/App';
import {createServices} from './services';
import {ServiceContext} from './ui/useServices';

const services = createServices();

render(
  (<ServiceContext.Provider value={services}>
    <App/>
  </ServiceContext.Provider>),
  document.getElementById('app')
);
