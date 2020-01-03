import React from 'react';
import {render} from 'react-dom';
import './styles/index.sass';
import './types/index.ts';
import App from './ui/App';


render(
  <App/>,
  document.getElementById('app')
);
