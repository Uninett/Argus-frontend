import React from "react";

import "./LoginView.css";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import LoginForm from "../../components/login/Login";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: "fixed",
      width: "100%",
      height: "100%",
      margin: 0,
      left: 0,
      top: 0,
      zIndex: 10,
      background: `linear-gradient(45deg, ${theme.palette.primary.light} 30%, ${theme.palette.primary.dark} 90%)`,
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
  const style = useStyles();

  return (
    <div className={style.root}>
      <div className={style.formContainer}>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginView;
