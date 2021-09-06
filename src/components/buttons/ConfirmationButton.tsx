import React, { useState } from "react";

import ConfirmDialog, { ConfirmDialogPropsType } from "../dialogs/ConfirmDialog";
import Button, { ButtonProps } from "@material-ui/core/Button";

export type ConfirmationButtonParamsType = Partial<Exclude<ConfirmDialogPropsType, "isOpen" | "title" | "question">> & {
  title: ConfirmDialogPropsType["title"];
  question: ConfirmDialogPropsType["question"];
  ButtonComponent?: React.ElementType<{ onClick: ButtonProps["onClick"] }>;
  buttonProps?: Partial<ButtonProps>;
};

type ConfirmationButtonPropsType = Partial<ButtonProps> & {
  onConfirm?: ConfirmDialogPropsType["onConfirm"];
  onReject?: ConfirmDialogPropsType["onReject"];
};

const ConfirmationButton: React.FC<ConfirmationButtonParamsType> = ({
  title,
  question,
  confirmName,
  rejectName,

  onConfirm: onConfirmProp,
  onReject: onRejectProp,
  ButtonComponent = Button,
  ...props
}: ConfirmationButtonParamsType) => {
  const [showConfirmDialog, setShowConfirmDeleteDialog] = useState<boolean>(false);

  return (
    <>
      <ButtonComponent onClick={() => setShowConfirmDeleteDialog(true)} {...props} />
      {showConfirmDialog && (
        <ConfirmDialog
          title={title}
          question={question}
          confirmName={confirmName || "yes"}
          rejectName={rejectName || "no"}
          isOpen={showConfirmDialog}
          onConfirm={() => {
            setShowConfirmDeleteDialog(false);
            if (onConfirmProp) onConfirmProp();
          }}
          onReject={() => {
            setShowConfirmDeleteDialog(false);
            if (onRejectProp) onRejectProp();
          }}
        />
      )}
    </>
  );
}

export function makeConfirmationButton({
  title,
  question,
  confirmName,
  rejectName,

  onConfirm: onConfirmProp,
  onReject: onRejectProp,
  ButtonComponent = Button,
}: ConfirmationButtonParamsType): React.FC<ConfirmationButtonPropsType> {
  const ConfirmationButton: React.FC<ConfirmationButtonPropsType> = ({
    onConfirm,
    onReject,
    ...props
  }: ConfirmationButtonPropsType) => {
    const [showConfirmDialog, setShowConfirmDeleteDialog] = useState<boolean>(false);

    return (
      <>
        <ButtonComponent onClick={() => setShowConfirmDeleteDialog(true)} {...props} />
        {showConfirmDialog && (
          <ConfirmDialog
            title={title}
            question={question}
            confirmName={confirmName || "yes"}
            rejectName={rejectName || "no"}
            isOpen={showConfirmDialog}
            onConfirm={() => {
              setShowConfirmDeleteDialog(false);
              if (onConfirmProp) onConfirmProp();
              else if (onConfirm) onConfirm();
            }}
            onReject={() => {
              setShowConfirmDeleteDialog(false);
              if (onRejectProp) onRejectProp();
              else if (onReject) onReject();
            }}
          />
        )}
      </>
    );
  };

  return ConfirmationButton;
}

export default ConfirmationButton;