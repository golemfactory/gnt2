import React from 'react';
import {BrowserRouter, Route, Switch, Redirect} from 'react-router-dom';
import {Login} from './Login';
import {Account} from './Account';
import {useServices} from './useServices';
import {ConnectionState} from '../services/connectionService';

export const Dashboard = () => {

  const {connectionService} = useServices();

  return (
    <div>
      <BrowserRouter>
        <Switch>
          <Route exact path='/account' component={Account}/>
          <Route exact path='/' render={(props) => {
            console.log(connectionService.connectionState);
            return connectionService.connectionState === ConnectionState.CONNECTED ? (
              <Redirect to='/account'/>
            ) : (
              <Login {...props}/>

            );
          }
          }/>
        </Switch>
      </BrowserRouter>
    </div>
  );
};
