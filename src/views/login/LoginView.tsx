import React from "react";

import "./LoginView.css";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import { useTheme } from "@material-ui/core/styles";
import { useIsMobile, useBackground } from "../../hooks";

import LoginForm from "../../components/login/Login";

const useStyles = makeStyles((theme: Theme) =>
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

  return (
    <div className={isMobile ? style.mobileRoot : style.root}>
      <div className={style.formContainer}>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginView;
