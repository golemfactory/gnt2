import React from 'react';
import {Redirect, Route, RouteProps} from 'react-router-dom';
import {useLocation} from 'react-router';
import {useServices} from './useServices';
import {ConnectionState} from '../services/ConnectionService';

function LoginRedirect() {
  const location = useLocation();
  return <Redirect to={{pathname: '/', state: {from: location.pathname}}}/>;
}

export function RequireConnectionRoute(props: RouteProps) {
  const {connectionService} = useServices();

  if (connectionService.connectionState === ConnectionState.NOT_CONNECTED || connectionService.connectionState === ConnectionState.UNKNOWN) {
    return <LoginRedirect/>;
  } else {
    return <Route {...props}/>;
  }
}
