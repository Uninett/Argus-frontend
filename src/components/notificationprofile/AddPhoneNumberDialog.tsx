import React, { useState } from "react";
import Modal from "../modal/Modal";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

type AddPhoneNumberDialogPropsType = {
  open: boolean;
  onSave: (phoneNumber: string) => void;
  onCancel: () => void;
};

const AddPhoneNumberDialog = ({ open, onSave, onCancel }: AddPhoneNumberDialogPropsType) => {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  const handleSave = () => {
    if (phoneNumber) {
      setError(false);
      onSave(phoneNumber);
    } else {
      setError(true);
    }
  };

  const handleCancel = () => {
    setError(false);
    setPhoneNumber("");
    onCancel();
  };

  return (
    <Modal
      title="Add phone number"
      content={
        <TextField
          value={phoneNumber}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(event.target.value)}
          error={error}
          helperText={error ? "This field cannot be empty." : null}
        />
      }
      actions={
        <div>
          <Button onClick={handleCancel} color="primary" autoFocus>
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" autoFocus>
            Save
          </Button>
        </div>
      }
      open={open}
      onClose={handleCancel}
    />
  );
};

export default AddPhoneNumberDialog;
