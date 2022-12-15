import React, { useEffect, useState } from "react";

import Button, { ButtonProps } from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import TextField from "@material-ui/core/TextField";

import { makeConfirmationButton } from "../../components/buttons/ConfirmationButton";

import { useStyles } from "./styles";
import { validateStringInput, isValidUrl } from "../../utils";
import { Alert } from "@material-ui/lab";

export type SignOffActionPropsType = {
  dialogTitle: string;
  dialogContentText: string;
  dialogCancelText: string;
  dialogSubmitText: string;
  dialogButtonText: string;
  dialogInputLabel: string;
  isDialogInputRequired: boolean;
  dialogInputType: string;
  dialogHelperText?: string;
  title: string;
  question: string;
  confirmName?: string;
  rejectName?: string;
  onSubmit: (msg: string) => void;
  ButtonComponent?: React.ElementType<{ onClick: ButtonProps["onClick"] }>;
  buttonProps?: Partial<ButtonProps>;
  children?: React.Props<{}>["children"];
};

const SignOffAction: React.FC<SignOffActionPropsType> = ({
  dialogTitle,
  dialogContentText,
  dialogCancelText,
  dialogSubmitText,
  dialogButtonText,
  dialogInputLabel,
  isDialogInputRequired,
  dialogInputType,
  dialogHelperText,
  title,
  question,
  confirmName,
  rejectName,
  onSubmit,
  ButtonComponent = Button,
  buttonProps = {},
  children,
}: SignOffActionPropsType) => {
  const classes = useStyles();

  const [open, setOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [inputError, setInputError] = useState<boolean>(false);
  const [errorHelperText, setErrorHelperText] = useState<string>("Required");

  useEffect(() => {
    // before unmount
    return () => {
      setInputError(false);
      setMessage("");
      setErrorHelperText("Required");
    }
  }, [open])

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const onConfirm = () => {
    if (isDialogInputRequired && !validateStringInput(message)) {
      setInputError(true);
      setErrorHelperText("Required");
    } else if (dialogInputType === "url" && message && !isValidUrl(message)) {
      setInputError(true);
      setErrorHelperText("Must be an absolute URL")
    } else if (validateStringInput(message)) {
      onSubmit(message);
      setOpen(false);
      setMessage("");
    } else {
      onSubmit("");
      setOpen(false);
      setMessage("");
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value);

  const CloseButton = makeConfirmationButton({
    title,
    question,
    confirmName,
    rejectName,
    onConfirm,
  });

  return (
    <div>
      <ButtonComponent onClick={handleOpen} className={classes.dangerousButton} {...buttonProps}>
        {dialogButtonText}
      </ButtonComponent>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogContentText}</DialogContentText>
          <TextField
            required={isDialogInputRequired}
            autoFocus
            margin="dense"
            id="message"
            label={dialogInputLabel}
            type={dialogInputType}
            fullWidth
            value={message || ""}
            onChange={handleMessageChange}
            error={inputError}
            helperText={inputError ? errorHelperText : null}
          />
          {dialogHelperText && <DialogContent><Alert severity="info">{dialogHelperText}</Alert></DialogContent>}
          {children}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} className={classes.safeButton}>
            {dialogCancelText}
          </Button>
          <CloseButton onClick={onConfirm} className={classes.dangerousButton}>
            {dialogSubmitText}
          </CloseButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SignOffAction;
