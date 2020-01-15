import React from 'react';
import {BrowserRouter, Route, Switch, Redirect} from 'react-router-dom';
import {Login} from './Login';
import {Account} from './Account';
import {useServices} from './useServices';
import {ConnectionState} from '../services/ConnectionService';

export const Dashboard = () => {

  const {connectionService} = useServices();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (props: any) => {
    return connectionService.connectionState === ConnectionState.CONNECTED ? (
      <Redirect to='/account'/>
    ) : (
      <Login {...props}/>
    );
  };

  return (
    <div>
      <BrowserRouter>
        <Switch>
          <Route exact path='/account' component={Account}/>
          <Route exact path='/' render={render}/>
        </Switch>
      </BrowserRouter>
    </div>
  );
};
