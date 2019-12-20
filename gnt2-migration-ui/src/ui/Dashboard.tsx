import React, {useState} from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import {Login} from './Login';
import {Account} from './Account';
import {useAsync} from './hooks/useAsync';
import {useServices} from './useServices';
import {Web3Provider} from 'ethers/providers';

export const Dashboard = () => {
  const [provider, setProvider] = useState(undefined as Web3Provider | undefined);
  const {connectionService} = useServices();

  useAsync(async () => {
    const provider = await connectionService.connect();
    setProvider(provider);
  }, []);

  const Root = provider ? Account : Login;

  return (
    <div>
      <BrowserRouter>
        <Switch>
          <Route path='/account' component={Account}/>
          <Route exact path='/' component={Root}/>
        </Switch>
      </BrowserRouter>
    </div>
  );
};
