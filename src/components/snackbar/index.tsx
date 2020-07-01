import MaterialUISnackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import React, { useState, Dispatch, SetStateAction } from "react";

export type AlertSnackbarSeverity = "error" | "warning" | "info" | "success";

export type AlertSnackbarPropsType = {
  message: string;
  severity: AlertSnackbarSeverity;
  autoHide?: boolean;
  autoHideDuration?: number;

  open: boolean;

  onOpen: () => void;
  onClose: () => void;
};

const AlertSnackbar: React.SFC<AlertSnackbarPropsType> = ({
  message,
  severity,
  autoHideDuration,

  open,

  onClose,
}: AlertSnackbarPropsType): React.ReactElement => {
  const handleClose = (event?: unknown, reason?: string) => {
    if (reason === "clickaway") return;
    onClose();
  };

  return (
    <MaterialUISnackbar open={open} onClose={handleClose} autoHideDuration={autoHideDuration}>
      <Alert elevation={6} variant="filled" severity={severity} onClose={() => handleClose()}>
        {message}
      </Alert>
    </MaterialUISnackbar>
  );
};

AlertSnackbar.defaultProps = {
  autoHide: false,
  autoHideDuration: 1500,
};

export type AlertSnackbarState = {
  message: string;
  severity: AlertSnackbarSeverity;
  open: boolean;
};

export type UseAlertSnackbarResultType = [
  React.ReactElement,
  AlertSnackbarState,
  Dispatch<SetStateAction<AlertSnackbarState>>,
];

export const useAlertSnackbar = (): UseAlertSnackbarResultType => {
  const [state, setState] = useState<AlertSnackbarState>({
    message: "",
    severity: "info",
    open: false,
  });

  const onOpen = () => {
    setState((state: AlertSnackbarState) => ({ ...state, open: true }));
  };

  const onClose = () => {
    setState((state: AlertSnackbarState) => ({ ...state, open: false }));
  };

  const component = <AlertSnackbar onOpen={onOpen} onClose={onClose} {...state} />;

  return [component, state, setState];
};

export default AlertSnackbar;
