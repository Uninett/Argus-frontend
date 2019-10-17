import React from 'react';
import AlertView from './views/alertView/AlertView';
import LoginView from './views/loginView/LoginView';
import {Route, Switch } from 'react-router-dom';
import { ProtectedRoute } from './protected.route';
import './variables.css';
import './colorscheme.css';


const App: React.SFC = () => {
  return (
    <div>
      <Switch>
        <ProtectedRoute exact path='/' component={AlertView} />
        <Route path='/login' component={LoginView} />
        <Route path='*' component={() => <h1>404 not found</h1>} />
      </Switch>
    </div>
  );
};

export default App;
