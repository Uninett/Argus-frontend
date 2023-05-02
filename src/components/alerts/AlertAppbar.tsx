import React from "react";

import classNames from "classnames";
import Typography from "@material-ui/core/Typography";
import AppBar from "@material-ui/core/AppBar";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      boxSizing: "border-box",
      color: theme.palette.text.primary,
      flexGrow: 1,
      transition: "0.4s",
      zIndex: theme.zIndex.drawer + 1,
    },
    rootDefault: {
      backgroundColor: theme.palette.primary.dark,
    },
    rootNetworkError: {
      backgroundColor: theme.palette.error.dark,
    },
    rootWarningMessage: {
      backgroundColor: theme.palette.warning.dark,
    },
    container: {
      display: "flex",
      flexFlow: "column wrap",
      alignItems: "center",
      margin: "4px",
    },
    typography: {
      alignItems: "center",
      fontWeight: "bold",
      color: "white",
    },
  }),
);

export type AlertAppbarSeverity = "error" | "warning" | "info" | "success";

export type AlertAppbarPropsType = {
  message: string;
  severity: AlertAppbarSeverity;
};

const AlertAppbar: React.SFC<AlertAppbarPropsType> = ({
                                                            message,
                                                            severity,
                                                          }: AlertAppbarPropsType): React.ReactElement => {

  const style = useStyles();

  const getStyleBySeverity  = () : string  => {
      switch (severity) {
        case "error":
          return style.rootNetworkError;
        case "warning":
          return style.rootWarningMessage;
        default:
          return style.rootDefault;
      }
  };

  return (
    <AppBar className={classNames(style.root, getStyleBySeverity())} position="relative">
      <div className={style.container}>
        <Typography className={style.typography}>
          {message}
        </Typography>
      </div>
    </AppBar>
  );
};

export default AlertAppbar;