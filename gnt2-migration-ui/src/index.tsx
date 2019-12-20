import React from 'react';
import {render} from 'react-dom';
import './styles/index.sass';
import './types/index.d.ts';
import {ServiceContext} from './ui/useServices';
import {createServices} from './services';
import App from './ui/App';

const services = createServices();

render(
  <ServiceContext.Provider value={services}>
    <App/>
  </ServiceContext.Provider>,
  document.getElementById('app')
);
