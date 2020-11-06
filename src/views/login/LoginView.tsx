import React, { useState, useContext } from "react";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";

import "./LoginView.css";
import Auth from "../../auth";
import { BACKEND_URL } from "../../config";
import api, { Token } from "../../api";
import { loginAndSetUser } from "../../utils";

import { Store } from "../../store";

import Logo from "../../components/logo/Logo";

type LoginViewPropsType = {
  // TODO: Find type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  history: any;
};

const NewLoginView: React.FC<LoginViewPropsType> = (props: LoginViewPropsType) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [loginFailed, setLoginFailed] = useState<boolean>(false);

  const { dispatch } = useContext(Store);

  const onSubmit = async (e: any) => {
    e.preventDefault();

    await api
      .userpassAuth(username, password)
      .then((token: Token) => {
        loginAndSetUser(token).then(() => {
          setLoginFailed(true);
          dispatch({ type: "setUser", payload: localStorage.getItem("user") });
        });
      })
      .catch((error) => {
        console.log(error);
        setLoginFailed(true);
        Auth.logout();
      });
  };

  return (
    <div
      style={{
        margin: "20em auto",
        width: "25em",
      }}
    >
      <form onSubmit={onSubmit} id="login-form">
        <Card>
          <CardContent>
            <Grid container xl direction="column" spacing={4} alignItems="center" justify="center">
              <Grid item>
                <Typography variant="h1">ARGUS</Typography>
              </Grid>
              <Grid item>
                <TextField
                  variant="outlined"
                  label="Username"
                  value={username}
                  onChange={(event: any) => {
                    const value = event.target.value as string;
                    setUsername(value);
                  }}
                />
              </Grid>
              <Grid item>
                <TextField
                  variant="outlined"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(event: any) => {
                    const value = event.target.value as string;
                    setPassword(value);
                  }}
                />
              </Grid>
              <Grid item>
                <Button type="submit" variant="outlined">
                  Login
                </Button>
              </Grid>
              <Grid item container direction="row" alignItems="center" spacing={1}>
                <Grid item xs>
                  <Divider />
                </Grid>
                <Grid item xs={2}>
                  <Typography color="textSecondary">OR</Typography>
                </Grid>
                <Grid item xs>
                  <Divider />
                </Grid>
              </Grid>
              <Grid item>
                <Button variant="outlined" href={`${BACKEND_URL}/oidc/login/dataporten_feide/`}>
                  Login with Feide
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default NewLoginView;

const LoginView: React.FC<LoginViewPropsType> = (props: LoginViewPropsType) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginAttemptFailed, setLoginAttemptFailed] = useState(false);
  const { dispatch } = useContext(Store);

  // TODO: Find type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (e: any) => {
    e.preventDefault();

    await api
      .userpassAuth(username, password)
      .then((token: Token) => {
        loginAndSetUser(token).then(() => {
          setLoginAttemptFailed(false);
          dispatch({ type: "setUser", payload: localStorage.getItem("user") });
        });
      })
      .catch((error) => {
        console.log(error);
        setLoginAttemptFailed(true);
        Auth.logout();
      });
  };

  return (
    <div>
      <div className="container">
        <div className="login-container">
          <div id="login-logo">
            <Logo />
          </div>
          <form onSubmit={onSubmit} id="login-form">
            <div>
              <input
                name={"username"}
                value={username}
                placeholder={"Username"}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                value={password}
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" id="login-button">
              {" "}
              Log in
            </button>
          </form>
          <p id="login-warning">{loginAttemptFailed ? "Username and/or password is incorrect" : ""}</p>
          <a id="login-feide" href={`${BACKEND_URL}/oidc/login/dataporten_feide/`}>
            Log in with Feide
          </a>
        </div>
      </div>
    </div>
  );
};

// export default LoginView;
