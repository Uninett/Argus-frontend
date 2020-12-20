import React from "react";

import { withStyles, createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import TextField, { TextFieldProps } from "@material-ui/core/TextField";

import classNames from "classnames";

const BaseTextField = withStyles({
  root: {
    "& label.Mui-focused": {
      color: "white",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "white",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "white",
      },
      "&:hover fieldset": {
        borderColor: "white",
      },
      "&.Mui-focused fieldset": {
        borderColor: "white",
        color: "white",
      },
    },
  },
})(TextField);

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

      color: "red",
    },
    button: {
      "& .MuiTextField-root": {},
    },
  }),
);

export type OutlinedTextFieldPropsType = TextFieldProps & {
  className?: string;
};

const OutlinedTextField: React.FC<OutlinedTextFieldPropsType> = ({
  className,
  ...buttonProps
}: OutlinedTextFieldPropsType) => {
  const style = useStyles();

  return (
    <div className={classNames(style.container, className)}>
      <BaseTextField color="primary" variant="outlined" className={style.button} {...buttonProps} />
    </div>
  );
};

export default OutlinedTextField;
