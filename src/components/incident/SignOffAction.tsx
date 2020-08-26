import React, { useState } from "react";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import TextField from "@material-ui/core/TextField";

import { makeConfirmationButton } from "../../components/buttons/ConfirmationButton";

import { useStyles } from "./styles";

type SignOffActionPropsType = {
  dialogTitle: string;
  dialogContentText: string;
  dialogCancelText: string;
  dialogSubmitText: string;
  dialogButtonText: string;
  title: string;
  question: string;
  confirmName?: string;
  rejectName?: string;
  onSubmit: (msg: string) => void;
  children?: React.Props<{}>["children"];
};

const SignOffAction: React.FC<SignOffActionPropsType> = ({
  dialogTitle,
  dialogContentText,
  dialogCancelText,
  dialogSubmitText,
  dialogButtonText,
  title,
  question,
  confirmName,
  rejectName,
  onSubmit,
  children,
}: SignOffActionPropsType) => {
  const classes = useStyles();

  const [open, setOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const onConfirm = () => {
    handleClose();
    if (message) onSubmit(message);
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
      <Button onClick={handleOpen} className={classes.dangerousButton}>
        {dialogButtonText}
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogContentText}</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="messsage"
            label="Messsage"
            type="text"
            fullWidth
            value={message || ""}
            onChange={handleMessageChange}
          />
          {children}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} className={classes.safeButton}>
            {dialogCancelText}
          </Button>
          <CloseButton onClick={onConfirm} variant="contained" className={classes.dangerousButton}>
            {dialogSubmitText}
          </CloseButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SignOffAction;
