import React, { useState, Dispatch, SetStateAction } from "react";

import Alert from "@material-ui/lab/Alert";
import MaterialUISnackbar from "@material-ui/core/Snackbar";

import { debuglog } from "../../utils";

export type AlertSnackbarSeverity = "error" | "warning" | "info" | "success";

export type AlertSnackbarPropsType = {
  message: string;
  severity: AlertSnackbarSeverity;
  autoHide?: boolean;
  autoHideDuration?: number;

  open: boolean;
  keepOpen?: boolean;

  onOpen: () => void;
  onClose: () => void;
};

const AlertSnackbar: React.SFC<AlertSnackbarPropsType> = ({
  message,
  severity,
  autoHideDuration,

  open,
  keepOpen,

  onClose,
}: AlertSnackbarPropsType): React.ReactElement => {
  const handleClose = (event?: unknown, reason?: string) => {
    if (reason === "clickaway") return;
    onClose();
  };

  console.log("keepOpen", keepOpen);

  return (
    <MaterialUISnackbar
      open={open}
      onClose={handleClose}
      autoHideDuration={(!keepOpen && autoHideDuration) || undefined}
    >
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
  keepOpen?: boolean;
};

export type UseAlertSnackbarResultType = {
  incidentSnackbar: React.ReactElement;
  state: AlertSnackbarState;
  setState: Dispatch<SetStateAction<AlertSnackbarState>>;
  displayAlertSnackbar: (message: string, severity?: AlertSnackbarSeverity) => void;
};

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
    setState((state: AlertSnackbarState) => ({ ...state, open: false, keepOpen: false }));
  };

  const component = <AlertSnackbar onOpen={onOpen} onClose={onClose} {...state} />;

  const displayAlertSnackbar = (message: string, severity?: AlertSnackbarSeverity) => {
    if (message === state.message && severity === state.severity && state.open) return;

    debuglog(`Displaying message with severity ${severity}: ${message}`);
    setState((state: AlertSnackbarState) => {
      return { ...state, open: true, message, severity: severity || "success", keepOpen: severity === "error" };
    });
  };

  return { incidentSnackbar: component, state, setState, displayAlertSnackbar };
};

export default AlertSnackbar;
