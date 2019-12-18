import React from 'react';
import {render} from 'react-dom';
import App from './ui/App';
import './styles/index.sass';
import './types';

render(
  <App/>,
  document.getElementById('app')
);
