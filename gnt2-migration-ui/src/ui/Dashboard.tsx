import React from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import {Login} from './Login';
import {Account} from './Account';

export const Dashboard = () =>
  (
    <div>
      <BrowserRouter>
        <Switch>
          <Route path='/account' component={Account}/>
          <Route exact path='/' component={Login}/>
        </Switch>
      </BrowserRouter>
    </div>
  );
