import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import {Login} from './Login/Login';
import {Account} from './Account';
import {PageNotFound} from './PageNotFound';
import {useServices} from './hooks/useServices';
import {RouteComponentProps} from 'react-router';

export const Dashboard = () => {

  const {connectionService} = useServices();

  const loginOrRedirectToAccountWhenConnected = (props: RouteComponentProps) => {
    return connectionService.isConnected() ? (
      <Redirect to='/account'/>
    ) : (
      <Login {...props}/>
    );
  };

  const accountOrRedirectToLoginWhenNotConnected = () => {
    return connectionService.isConnected() ? <Account/> : <Redirect to='/'/>;
  };

  return (
    <Switch>
      <Route exact path='/account' render={accountOrRedirectToLoginWhenNotConnected}/>
      <Route exact path='/' render={loginOrRedirectToAccountWhenConnected}/>
      <Route component={PageNotFound}/>
    </Switch>
  );
};
