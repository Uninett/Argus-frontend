import React from "react";
import AlertView from "./views/alertView/AlertView";
import LoginView from "./views/loginView/LoginView";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./variables.css";
import { Store } from "./store";
import { withCookies } from "react-cookie";

const App: React.SFC = () => {
  const { user } = React.useContext(Store);
  console.log(user);
  return (
    <Router>
      <Switch>
        <React.Fragment>
          <Route exact path={"/"} component={AlertView}></Route>
          <Route path={"/login"} component={LoginView}></Route>
        </React.Fragment>
      </Switch>
    </Router>
  );
};

export default withCookies(App);
