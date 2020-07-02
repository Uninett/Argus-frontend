import React, { useState } from "react";

import ConfirmDialog, { ConfirmDialogPropsType } from "../dialogs/ConfirmDialog";
import Button, { ButtonProps } from "@material-ui/core/Button";

type ConfirmationButtonPropsType = Partial<Exclude<ConfirmDialogPropsType, "isOpen" | "title" | "question">> & {
  title: ConfirmDialogPropsType["title"];
  question: ConfirmDialogPropsType["question"];

  buttonProps: Partial<ButtonProps>;
  children: React.ReactChild | React.ReactChildren;
};

const ConfirmationButton: React.SFC<ConfirmationButtonPropsType> = ({
  title,
  question,
  confirmName,
  rejectName,

  onConfirm,
  onReject,

  buttonProps,
  children,
}: ConfirmationButtonPropsType) => {
  const [showConfirmDialog, setShowConfirmDeleteDialog] = useState<boolean>(false);

  return (
    <div>
      <Button onClick={() => setShowConfirmDeleteDialog(true)} {...buttonProps}>
        {children}
      </Button>
      <ConfirmDialog
        title={title}
        question={question}
        confirmName={confirmName || "yes"}
        rejectName={rejectName || "no"}
        isOpen={showConfirmDialog}
        onConfirm={() => {
          setShowConfirmDeleteDialog(false);
          onConfirm && onConfirm();
        }}
        onReject={onReject}
      />
    </div>
  );
};

export default ConfirmationButton;
