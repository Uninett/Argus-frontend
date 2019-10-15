import React, { useContext, useState } from "react";
import AlertView from "./views/alertView/AlertView";
import LoginView from "./views/loginView/LoginView";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./variables.css";
import { Store } from "./store";
import { withCookies } from "react-cookie";
import Axios from "axios";

const App: React.SFC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { state, dispatch } = useContext(Store);
  const [token, setToken] = useState<any>("");
  const [loggedin, setLoggedin] = useState(false);

  const { user } = React.useContext(Store);

  const login = (user: string) => {
    setUsername(user);
    setLoggedin(true);
  };

  console.log(user);
  return (
    <Router>
      <Switch>
        <React.Fragment>
          <Route exact path={"/"} component={AlertView} />
          <Route
            path={"/login"}
            component={LoginView}
            onSubmit={login}
            loggedin={loggedin}
          />
        </React.Fragment>
      </Switch>
    </Router>
  );
};

export default App;
