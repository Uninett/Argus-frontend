import React, { useState, useContext } from "react";

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

export default LoginView;
