import React, {useState} from 'react';
import '../styles/App.sass';
import {hot} from 'react-hot-loader/root';

import {Dashboard} from './Dashboard';
import {useServices} from './useServices';
import styled from 'styled-components';
import {useAsync} from './hooks/useAsync';
import {ConnectionState} from '../services/ConnectionService';

const App: React.FC = () => {

  const [ready, setReady] = useState(false);
  const services = useServices();
  const {connectionService} = useServices();

  useAsync(async () => {
    await services.startServices();
    setReady(true);
  }, []);

  if (!ready) return null;

  if (connectionService.connectionState === ConnectionState.NO_METAMASK) {
    return (
      <Body>Sorry, you must have metamask installed</Body>
    );
  }

  return (
    <Body>
      <Dashboard/>
    </Body>
  );
};


export default hot(App);

const Body = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100%;
`;
