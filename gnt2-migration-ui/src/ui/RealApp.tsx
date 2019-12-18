import React from 'react';
import {createServices} from '../services';
import App from './App';
import {ServiceContext} from './hooks';

const services = createServices();


export function RealApp() {
  return (
    <ServiceContext.Provider value={services}>
      <App/>
    </ServiceContext.Provider>
  );
}
