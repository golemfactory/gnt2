import React from 'react';
import '../styles/App.sass';
import {hot} from 'react-hot-loader/root';

import {Dashboard} from './Dashboard';
import {ServiceContext} from './useServices';
import {createServices} from '../services';
import styled from 'styled-components';

const App: React.FC = () => {

  const services = createServices();

  return (
    <ServiceContext.Provider value={services}>
      <Body>
        <Dashboard/>
      </Body>
    </ServiceContext.Provider>
  );
};


export default hot(App);

const Body = styled.div`
    display: flex;
    flex-direction: column; 
    justify-content: center; 
    align-items: center;     
    height: 300px;
`;
