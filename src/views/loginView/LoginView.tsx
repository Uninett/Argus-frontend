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
  const [token, setToken]  = useState("");

  const onSubmit = () => {
    console.log("submitty");
    getMoney();
    setRedirect(true)
  };

  const getMoney = async () => {
    //get feideshit
    console.log("getmoney");
    await Axios({
      url: "http://127.0.0.1:8000/api-token-auth/",
      method: "POST",
      data: { username: username, password: password }
    }).then(result => {
      console.log(result);
      setToken(result.data.token);
      dispatch({ type: "setUser", payload: username });
    });
  };

  const handleUsername = (e: any) => {
    e.preventDefault();
    setUsername(e.target.value);
  };

  const handlePassword = (e: any) => {
    e.preventDefault();
    setPassword(e.target.value);
  };

  const renderRedirect = () => {
    if (redirect) {
      return <Redirect to="/" />;
    }
  };
  return (
    <div>
      {renderRedirect()}
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
          <a href={"http://localhost:8000/login/dataporten/"}>login with feide</a>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
