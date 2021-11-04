import React, {useEffect, useState} from "react";

import { useHistory } from "react-router-dom";

// MUI
import Typography from "@material-ui/core/Typography";
import { TextFieldProps } from "@material-ui/core/TextField";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

// Api
import type { User } from "../../api/types.d";
import api from "../../api";
import auth from "../../auth";

// Config
import { BACKEND_URL } from "../../config";

// Contexts/Hooks
import { useUser } from "../../state/hooks";

// Components
import OutlinedTextField from "../../components/textfields/OutlinedTextField";
import Button from "../../components/buttons/OutlinedButton";
import Logo from "../../components/logo/Logo";

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
    whiteTextInput: {
      color: "white",
    },
  }),
);

const WhiteOutlinedTextField = (props: TextFieldProps) => {
  const style = useStyles();
  return (
    <OutlinedTextField
      InputProps={{
        classes: {
          input: style.whiteTextInput,
        },
      }}
      InputLabelProps={{
        classes: {
          root: style.whiteTextInput,
        },
      }}
      {...props}
    />
  );
};

const LoginForm: React.FC<{}> = () => {
  const style = useStyles();
  const history = useHistory();

  // const { dispatch } = useContext(AppContext);
  const [, { login }] = useUser();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [loginFailed, setLoginFailed] = useState<boolean>(false);

  useEffect(() => {
    const token = auth.token();

    if (token) {
      history.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token()]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("******** SUBMITTING U/P LOGIN ********")


    let token;

    if (auth.token()) {
      token = auth.token();
      console.log("TOKEN FROM COOKIES", token)
    } else {
      token = await api.userpassAuth(username, password)
        .catch((error) => {
          console.log("FAILED TOKEN FROM /api/v1/token-auth/", error)
        // console.log(error);
        setLoginFailed(true);
        auth.logout();
      });
      console.log("TOKEN FROM /api/v1/token-auth/", token)
    }

    if (token) {
      console.log("TOKEN EXISTS in Login onSubmit", token)
      auth.login(token, () => {
        api
          .authGetCurrentUser()
          .then((user: User) => {
            console.debug("[userpass-auth] logged in as user", user);
            login(user);
          })
          .catch((error) => {
            console.error("[userpass-auth] error logging in as user", username, error);
            setLoginFailed(true);
          });
      });
    }
    console.log("TOKEN DOES NOT EXIST in Login onSubmit", token)
  };

  return (
    <form onSubmit={onSubmit} id="login-form">
      <div className={style.loginContainer}>
        <div className={style.loginItem}>
          <Logo className={style.logo} />
        </div>
        <WhiteOutlinedTextField
          id="username-input"
          error={loginFailed}
          className={style.loginItem}
          variant="outlined"
          label="Username"
          value={username}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value as string;
            setUsername(value);
          }}
        />
        <WhiteOutlinedTextField
          id="password-input"
          error={loginFailed}
          helperText={loginFailed && "Wrong username or password"}
          className={style.loginItem}
          variant="outlined"
          label="Password"
          type="password"
          value={password}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
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
          onClick={() => console.log("******** SUBMITTING FEIDE LOGIN ********")}
        >
          Login with Feide
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
