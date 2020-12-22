import React, { useState, useContext } from "react";

import Typography from "@material-ui/core/Typography";
import { useHistory } from "react-router-dom";

import Auth from "../../auth";
import { BACKEND_URL } from "../../config";
import api, { Token } from "../../api";
import { loginAndSetUser } from "../../utils";

import { Store } from "../../store";

import Button from "../../components/buttons/OutlinedButton";
import TextField from "../../components/textfields/OutlinedTextField";
import Logo from "../../components/logo/Logo";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    loginContainer: {
      backgroundColor: theme.palette.primary.dark,
      display: "flex",
      flexDirection: "column",
      flexWrap: "nowrap",
      alignItems: "center",
      padding: theme.spacing(4),
      borderRadius: "10px",
    },
    loginWithFeideContainer: {
      display: "flex",
      flexDirection: "column",
      flexWrap: "nowrap",
      alignItems: "center",
      padding: 0,
      margin: 0,
    },
    loginWithFeideButton: {
      padding: theme.spacing(0.5),
      backgroundColor: theme.palette.primary.dark,
      borderRadius: "5px",
    },
    loginItem: {
      margin: theme.spacing(2),
      flexGrow: 1,
    },
    divider: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      margin: theme.spacing(2),
    },
    logo: {
      minHeight: "150px",
    },
  }),
);

const LoginForm: React.FC<{}> = () => {
  const style = useStyles();
  const history = useHistory();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [loginFailed, setLoginFailed] = useState<boolean>(false);

  const { dispatch } = useContext(Store);

  const onSubmit = async (e: any) => {
    e.preventDefault();

    await api
      .userpassAuth(username, password)
      .then((token: Token) => {
        loginAndSetUser(token)
          .then(() => {
            history.push("/");
          })
          .catch(() => {
            console.log("failed to login");
            setLoginFailed(true);
          });
      })
      .catch((error) => {
        console.log(error);
        setLoginFailed(true);
        Auth.logout();
      });
  };

  return (
    <form onSubmit={onSubmit} id="login-form">
      <div className={style.loginContainer}>
        <div className={style.loginItem}>
          <Logo className={style.logo} />
        </div>
        <TextField
          className={style.loginItem}
          variant="outlined"
          label="Username"
          value={username}
          onChange={(event: any) => {
            const value = event.target.value as string;
            setUsername(value);
          }}
        />
        <TextField
          className={style.loginItem}
          variant="outlined"
          label="Password"
          type="password"
          value={password}
          onChange={(event: any) => {
            const value = event.target.value as string;
            setPassword(value);
          }}
        />
        <Button className={style.loginItem} type="submit" variant="outlined">
          Login
        </Button>
      </div>
      <div className={style.divider}>
        <Typography color="textSecondary">OR</Typography>
      </div>
      <div className={style.loginWithFeideContainer}>
        <Button
          className={style.loginWithFeideButton}
          variant="outlined"
          href={`${BACKEND_URL}/oidc/login/dataporten_feide/`}
        >
          Login with Feide
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
