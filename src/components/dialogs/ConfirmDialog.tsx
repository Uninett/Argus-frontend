import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";

import { useStateWithDynamicDefault } from "../../utils";

export type ConfirmDialogPropsType = {
  title: string;
  question: string;
  confirmName: string;
  rejectName: string;

  onReject?: () => void;
  onConfirm?: () => void;

  isOpen: boolean;
};

const ConfirmDialog: React.SFC<ConfirmDialogPropsType> = ({
  title,
  question,
  confirmName,
  rejectName,
  onReject,
  onConfirm,
  isOpen: defaultIsOpen,
}: ConfirmDialogPropsType) => {
  const [isOpen, setIsOpen] = useStateWithDynamicDefault<boolean>(defaultIsOpen);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClose = () => setIsOpen(false);

  const handleReject = () => {
    onReject && onReject();
    setIsOpen(false);
  };

  const handleConfirm = () => {
    onConfirm && onConfirm();
    setIsOpen(false);
  };

  return (
    <div>
      <Dialog fullScreen={fullScreen} open={isOpen} onClose={handleClose} aria-labelledby="responsive-dialog-title">
        <DialogTitle id="responsive-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{question}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleReject} color="primary">
            {rejectName}
          </Button>
          <Button onClick={handleConfirm} color="primary" autoFocus>
            {confirmName}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ConfirmDialog;
