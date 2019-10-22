import React from 'react';
import AlertView from './views/alertView/AlertView';
import LoginView from './views/loginView/LoginView';
import {Route, Switch } from 'react-router-dom';
import { ProtectedRoute } from './protected.route';
import './variables.css';
import './colorscheme.css';
import Header from '../src/components/header/Header';


const App: React.SFC = () => {
  return (
    <div>
      <Switch>
        <ProtectedRoute exact path='/' component={AlertView} />
        <Route path='/login' component={LoginView} />
        <Route path='*' component={() => <div> <Header/><div id="not-found"> <h1 >404 not found</h1> </div> </div>} />
      </Switch>
    </div>
  );
};

export default App;
