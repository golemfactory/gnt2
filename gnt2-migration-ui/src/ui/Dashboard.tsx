import React from 'react';
import {BrowserRouter, Route, Switch, Redirect} from 'react-router-dom';
import {Login} from './Login';
import {Account} from './Account';
import {useServices} from './useServices';
import {ConnectionState} from '../services/ConnectionService';
import {RouteComponentProps} from 'react-router';
import {RequireConnectionRoute} from './RequireConnectionRoute';

export const Dashboard = () => {

  const {connectionService} = useServices();

  const render = (props: RouteComponentProps) => {
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
          <RequireConnectionRoute exact path='/account' component={ Account}/>
          <Route exact path='/' render={render}/>
        </Switch>
      </BrowserRouter>
    </div>
  );
};
