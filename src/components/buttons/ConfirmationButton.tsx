import React, { useState } from "react";

import ConfirmDialog, { ConfirmDialogPropsType } from "../dialogs/ConfirmDialog";
import Button, { ButtonProps } from "@material-ui/core/Button";

export type ConfirmationButtonParamsType = Partial<Exclude<ConfirmDialogPropsType, "isOpen" | "title" | "question">> & {
  title: ConfirmDialogPropsType["title"];
  question: ConfirmDialogPropsType["question"];
};

export function makeConfirmationButton({
  title,
  question,
  confirmName,
  rejectName,

  onConfirm,
  onReject,
}: ConfirmationButtonParamsType): React.FC<ButtonProps> {
  const ConfirmationButton: React.FC<ButtonProps> = (props: ButtonProps) => {
    const [showConfirmDialog, setShowConfirmDeleteDialog] = useState<boolean>(false);

    return (
      <>
        <Button onClick={() => setShowConfirmDeleteDialog(true)} {...props} />
        {showConfirmDialog && (
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
            onReject={() => {
              setShowConfirmDeleteDialog(false);
              onReject && onReject();
            }}
          />
        )}
      </>
    );
  };

  return ConfirmationButton;
}
