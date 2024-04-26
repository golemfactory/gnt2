import React, {useState} from 'react';
import '../styles/reset.css';
import '../styles/App.sass';
import {hot} from 'react-hot-loader/root';

import {Dashboard} from './Dashboard';
import {useServices} from './hooks/useServices';
import {ConnectionState} from '../services/ConnectionService';
import {useAsyncEffect} from './hooks/useAsyncEffect';
import {HashRouter} from 'react-router-dom';

const App: React.FC = () => {
  const [ready, setReady] = useState(false);
  const services = useServices();
  const {connectionService} = useServices();

  useAsyncEffect(async () => {
    if (connectionService.connectionState !== ConnectionState.NO_METAMASK) {
      await services.startServices();
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <HashRouter>
      <Dashboard/>
    </HashRouter>
  );
};


export default hot(App);
