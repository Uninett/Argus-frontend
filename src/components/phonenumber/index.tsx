import React, { useState } from "react";

import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import DeleteIcon from "@material-ui/icons/Delete";

import Spinning from "../spinning";

import type { PhoneNumberPK } from "../../api/types.d";
import { useStateWithDynamicDefault } from "../../utils";
import { makeConfirmationButton } from "../buttons/ConfirmationButton";

import { WHITE } from "../../colorscheme";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      textAlign: "center",
      color: theme.palette.text.secondary,
      minWidth: 30,
    },
    dangerousButton: {
      background: theme.palette.warning.main,
      color: WHITE,
      margin: theme.spacing(),
    },
    saveButton: {
      background: theme.palette.primary.main,
      color: WHITE,
      margin: theme.spacing(),
    },
    phoneField: {
      margin: theme.spacing(),
    },
    form: {
      alignItems: "center",
      display: "flex",
    },
  }),
);

type PhoneNumberPropsType = {
  pk?: PhoneNumberPK;
  phoneNumber: string | undefined;
  exists?: boolean;
  unsavedChanges: boolean;

  onSave: (pk: PhoneNumberPK | undefined, phoneNumber: string) => void;
  onDelete: (pk: PhoneNumberPK | undefined, phoneNumber: string) => void;
};

const PhoneNumberComponent: React.FC<PhoneNumberPropsType> = ({
  pk,
  phoneNumber: phoneNumberProp,
  exists,
  unsavedChanges,
  onSave,
  onDelete,
}: PhoneNumberPropsType) => {
  const classes = useStyles();

  const [phoneNumber, setPhoneNumber] = useStateWithDynamicDefault<string>(phoneNumberProp || "");
  const [invalidPhoneNumber, setInvalidPhoneNumber] = useState<boolean>(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [hasChanged, setHasChanged] = useState<boolean>(unsavedChanges);

  const onPhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPhoneNumber = event.target.value;
    if (newPhoneNumber !== phoneNumber) {
      setHasChanged(true);
      setPhoneNumber(event.target.value);
      setInvalidPhoneNumber(newPhoneNumber === "");
    }
  };

  const RemovePhoneNumberButton = makeConfirmationButton({
    title: `Remove ${phoneNumber}`,
    question: "Are you sure you want to remove this phone number?",
    onConfirm: () => {
      setDeleteLoading(true);
      onDelete(pk, phoneNumber);
    },
  });

  return (
    <div key={pk}>
      <Paper className={classes.paper}>
        <form className={classes.form} noValidate autoComplete="off">
          <TextField
            error={invalidPhoneNumber}
            required
            label="Phone number"
            variant="standard"
            className={classes.phoneField}
            value={phoneNumber}
            onChange={onPhoneNumberChange}
          />
          <Button
            variant="contained"
            size="small"
            className={classes.saveButton}
            onClick={() => {
              setUpdateLoading(true);
              onSave(pk, phoneNumber);
            }}
            disabled={!hasChanged || invalidPhoneNumber}
            startIcon={updateLoading ? <Spinning shouldSpin /> : <SaveIcon />}
          >
            {exists ? "Save" : "Create"}
          </Button>
          <RemovePhoneNumberButton
            variant="contained"
            size="small"
            className={classes.dangerousButton}
            startIcon={deleteLoading ? <Spinning shouldSpin /> : <DeleteIcon />}
            disabled={!exists}
          >
            Delete
          </RemovePhoneNumberButton>
        </form>
      </Paper>
    </div>
  );
};

PhoneNumberComponent.defaultProps = {
  exists: false,
};

export default PhoneNumberComponent;
