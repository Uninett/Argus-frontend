import React from "react";

import SignOffAction from "./SignOffAction";
import { useStyles } from "./styles";

import { makeConfirmationButton } from "../../components/buttons/ConfirmationButton";

type ManualClosePropsType = {
  open: boolean;
  onManualClose: (msg: string) => void;
  onManualOpen: () => void;
};

const ManualClose: React.FC<ManualClosePropsType> = ({ open, onManualClose, onManualOpen }: ManualClosePropsType) => {
  const classes = useStyles();

  if (open) {
    return (
      <SignOffAction
        dialogTitle="Manually close incident"
        dialogContentText="Write a message describing why the incident was manually closed"
        dialogSubmitText="Close now"
        dialogCancelText="Cancel"
        dialogButtonText="Close incident"
        title="Manually close incident"
        question="Are you sure you want to close this incident?"
        onSubmit={onManualClose}
      />
    );
  } else {
    const ReopenButton = makeConfirmationButton({
      title: "Reopen incident",
      question: "Are you sure you want to reopen this incident?",
      onConfirm: onManualOpen,
    });

    return (
      <ReopenButton variant="contained" className={classes.dangerousButton}>
        Reopen incident
      </ReopenButton>
    );
  }
};

export default ManualClose;
