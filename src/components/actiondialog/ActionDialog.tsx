import React from "react";
import "../../components/alerttable/alerttable.css";

import Dialog from "@material-ui/core/Dialog";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import WarningIcon from "@material-ui/icons/Warning";

export type ActionDialogPropType = {
  message: string;
  show: boolean;
  success: boolean;
  onClose: () => void;
};

const ActionDialog: React.FC<ActionDialogPropType> = ({ message, show, success, onClose }: ActionDialogPropType) => {
  return (
    <Dialog open={show} onClose={onClose}>
      <h1 className="dialogHeader">{message}</h1>
      <div className="dialogDiv">
        {success ? <CheckCircleIcon color={"primary"} /> : <WarningIcon color={"primary"} />}
      </div>
    </Dialog>
  );
};

export default ActionDialog;
