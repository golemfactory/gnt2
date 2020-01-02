import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {Login} from './Login';
import {Account} from './Account';
import {useServices} from './useServices';

export const Dashboard = () => {

  const {connectionService} = useServices();
  const Root = connectionService.isInitialized ? Account : Login;

  return (
    <div>
      <BrowserRouter>
        <Switch>
          <Route exact path='/account' component={Account}/>
          <Route exact path='/' component={Root}/>
        </Switch>
      </BrowserRouter>
    </div>
  );
};
