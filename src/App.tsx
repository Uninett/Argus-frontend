import React from 'react';
import AlertView from './views/alertView/AlertView';
import LoginView from './views/loginView/LoginView';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './variables.css';

const App: React.SFC = () => {
  return (
    <Router>
      <Switch>
        <React.Fragment>
          <Route exact path={'/'} component={AlertView}></Route>
          <Route path={'/login'} component={LoginView}></Route>
        </React.Fragment>
      </Switch>
    </Router>
  );
};

export default App;
