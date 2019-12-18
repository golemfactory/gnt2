import React from 'react';
import {render} from 'react-dom';
import './styles/index.sass';
import './types/index.d.ts';
import {RealApp} from './ui/RealApp';


render(
  <RealApp/>,
  document.getElementById('app')
);
