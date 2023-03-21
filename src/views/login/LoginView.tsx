import React from "react";
import { Helmet } from "react-helmet";

import "./LoginView.css";
import {createStyles, makeStyles } from "@material-ui/core/styles";

import { useTheme } from "@material-ui/core/styles";
import { useIsMobile, useBackground } from "../../hooks";

import LoginForm from "../../components/login/Login";
import {useApiState} from "../../state/hooks";
import AlertAppbar from "../../components/alerts/AlertAppbar";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      margin: 0,
      height: "100vh",
      width: "100vw",
    },
    mobileRoot: {
      margin: 0,
    },
    formContainer: {
      display: "flex",
      flexDirection: "column",
      flexWrap: "nowrap",
      alignItems: "center",
    },
  }),
);

type LoginViewPropsType = {};

export const LoginView: React.FC<LoginViewPropsType> = () => {
  const theme = useTheme();
  const style = useStyles();
  useBackground(
    `linear-gradient(45deg, ${theme.palette.primary.light} 30%, ${theme.palette.primary.dark} 90%) no-repeat fixed`,
  );

  const isMobile = useIsMobile();

  const [apiState] = useApiState();

  return (
    <div className={isMobile ? style.mobileRoot : style.root}>
      <Helmet>
        <title>Argus | Login</title>
      </Helmet>
      <div className={style.formContainer}>
        {apiState.hasConnectionProblems && (
          <AlertAppbar
            message={"Problems connecting to server... Check your connection."}
            severity={"error"}/>
        )}
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginView;
