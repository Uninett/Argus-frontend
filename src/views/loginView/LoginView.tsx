import React, { useState, useContext } from "react";
import "./LoginView.css";
import Axios from "axios";
import Header from "../../components/header/Header";
import { Redirect } from "react-router-dom";
import { Store } from "../../store";

const LoginView: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const { state, dispatch } = useContext(Store);

  const onSubmit = () => {
    dispatch({ type: "setUser", payload: "theodor" });
    console.log("submitty");
    getMoney();
    if (redirect == true) {
      return <Redirect to="/" />;
    } else {
    }
  };

  const getMoney = async () => {
    //get feideshit
    console.log("getmoney");
    await Axios({
      url: "http://127.0.0.1:8000/login/",
      method: "GET",
      params: { username, password }
    }).then(result => {
      console.log(result);
    });
  };

  const handleUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setUsername(e.target.value);
  };

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setPassword(e.target.value);
  };

  if (redirect) {
    return <Redirect to="/" />;
  }
  return (
    <div>
      <header>
        <Header></Header>
      </header>
      <div className="container">
        <div className="login-container">
          <h1>Login</h1>
          <form onSubmit={onSubmit}>
            <div>
              <input
                name={"username"}
                value={username}
                placeholder={"Email"}
                onChange={handleUsername}
              />
            </div>
            <div>
              <input
                name={"password"}
                value={password}
                placeholder={"Password"}
                onChange={handlePassword}
              />
            </div>
            <button type="submit"> Log in</button>
          </form>
          <a href={"feide"}>login with feide</a>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
