import React from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Button, { ButtonProps } from "@material-ui/core/Button";

import classNames from "classnames";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: theme.palette.primary.dark,
      boxSizing: "border-box",
      color: theme.palette.text.primary,
      flexGrow: 1,
      transition: "0.4s",
      zIndex: theme.zIndex.drawer + 1,
    },
    container: {
      // padding: "6px 8px 6px 8px",
      margin: theme.spacing(2),

      color: "white",
    },
    button: {
      "&:hover": {
        color: "black",
        backgroundColor: "white",
      },
    },
  }),
);

export type OutlinedButtonPropsType = ButtonProps & {
  children?: React.ReactNode;
  className?: string;
};

const OutlinedButton: React.FC<OutlinedButtonPropsType> = ({
  children,
  className,
  ...buttonProps
}: OutlinedButtonPropsType) => {
  const style = useStyles();

  return (
    <div className={classNames(style.container, className)}>
      <Button color="inherit" variant="outlined" size="large" className={style.button} {...buttonProps}>
        {children}
      </Button>
    </div>
  );
};

export default OutlinedButton;
