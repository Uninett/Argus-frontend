import React from "react";

import Button, { ButtonProps } from "@material-ui/core/Button";

import { useStyles } from "./styles";

import SignOffAction, { SignOffActionPropsType } from "./SignOffAction";
import ConfirmationButton from "../../components/buttons/ConfirmationButton";

type ManualClosePropsType = {
  open: boolean;
  onManualClose: (msg: string) => void;
  onManualOpen: () => void;

  reopenButtonText?: string;
  closeButtonText?: string;

  signOffActionProps?: Partial<SignOffActionPropsType>;
  reopenButtonProps?: Partial<ButtonProps>;
  ButtonComponent?: React.ElementType<{ onClick: ButtonProps["onClick"] }>;
  isBulk: boolean;
};

const ManualClose: React.FC<ManualClosePropsType> = ({
  open,
  onManualClose,
  onManualOpen,
  reopenButtonText = "Open incident",
  closeButtonText = "Close incident",
  signOffActionProps = {},
  reopenButtonProps = {},
  ButtonComponent = Button,
  isBulk,
}: ManualClosePropsType) => {
  const classes = useStyles();

  const signOffActionDefaultProps = {
    dialogTitle: "Manually close incident",
    dialogContentText: "Write a message describing why the incident was manually closed",
    dialogSubmitText:"Close now",
    dialogCancelText:"Cancel",
    dialogButtonText: closeButtonText,
    dialogInputLabel: "Closing message",
    isDialogInputRequired: false,
    dialogInputType: "text",
    title: "Manually close incident",
    question: "Are you sure you want to close this incident?",
    onSubmit: onManualClose,
  }

  const signOffActionPluralProps = {
    dialogTitle: "Manually close incidents",
    dialogContentText: "Write a message describing why the incidents were manually closed",
    question: "Are you sure you want to close these incidents?",
  }

  const reopenButtonDefaultProps = {
    title: "Reopen incident",
    question: "Are you sure you want to reopen this incident?",
    onConfirm: onManualOpen,
    ButtonComponent: ButtonComponent,
  }

  const reopenButtonPluralProps = {
    title: "Reopen incidents",
    question: "Are you sure you want to reopen these incidents?",
  }


  if (open) {
    return (
      <SignOffAction
        {...signOffActionDefaultProps}
        {...(isBulk && signOffActionPluralProps)}
        {...signOffActionProps}
      />
    );
  } else {
    return (
      <ConfirmationButton
        className={classes.dangerousButton}
        {...reopenButtonDefaultProps}
        {...(isBulk && reopenButtonPluralProps)}
        {...reopenButtonProps}
      >
        {reopenButtonText}
      </ConfirmationButton>
    );
  }
};

export default ManualClose;
