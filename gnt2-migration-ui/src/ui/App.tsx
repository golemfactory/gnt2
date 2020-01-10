import React, {useState} from 'react';
import '../styles/App.sass';
import {hot} from 'react-hot-loader/root';

import {Dashboard} from './Dashboard';
import {useServices} from './useServices';
import styled from 'styled-components';
import {useAsync} from './hooks/useAsync';

const App: React.FC = () => {

  const [ready, setReady] = useState(false);
  const services = useServices();

  useAsync(async () => {
    await services.startServices();
    setReady(true);
  }, []);

  if (!ready) return null;

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
    height: 300px;
`;
