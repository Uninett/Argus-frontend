import React, { useState, useEffect, useMemo } from "react";

import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

import PhoneNumberComponent from "../phonenumber/index";

import api, { defaultErrorHandler, PhoneNumber, PhoneNumberPK } from "../../api";
import { useApiPhoneNumbers } from "../../api/hooks";

import { useAlertSnackbar, UseAlertSnackbarResultType } from "../../components/alertsnackbar";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    phoneNumber: {
      alignItems: "center",
      padding: theme.spacing(3),
    },
  }),
);

type InternalPhoneNumber = PhoneNumber & { revision?: number };

type PhoneNumberListPropsType = {};

const PhoneNumberList: React.FC<PhoneNumberListPropsType> = () => {
  const classes = useStyles();

  const [{ result: phoneNumbersResponse, error: phoneNumbersError }, setPhoneNumbersPromise] = useApiPhoneNumbers(
    () => undefined,
  )();

  useEffect(() => {
    setPhoneNumbersPromise(api.getAllPhoneNumbers());
  }, [setPhoneNumbersPromise]);

  const [phoneNumbers, setPhoneNumbers] = useState<Map<PhoneNumberPK, InternalPhoneNumber>>(
    new Map<PhoneNumberPK, InternalPhoneNumber>(),
  );

  const newPhoneNumberDefault = { exists: false, pk: undefined };
  const [newPhoneNumber, setNewPhoneNumber] = useState<Partial<InternalPhoneNumber>>({ ...newPhoneNumberDefault });

  const { incidentSnackbar, displayAlertSnackbar }: UseAlertSnackbarResultType = useAlertSnackbar();

  useEffect(() => {
    if (!phoneNumbersResponse) return;

    setPhoneNumbers(phoneNumbersResponse);
  }, [phoneNumbersResponse]);

  useMemo(() => {
    if (!phoneNumbersError) return;
    displayAlertSnackbar("Unable to fetch phone numbers", "error");
  }, [phoneNumbersError, displayAlertSnackbar]);

  const resetNewPhoneNumber = () => {
    setNewPhoneNumber((phoneNumber: Partial<InternalPhoneNumber>) => {
      return { ...phoneNumber, revision: (phoneNumber.revision || 0) + 1 };
    });
  };

  const updateSavedPhoneNumber = (pk: PhoneNumberPK, phoneNumber: string) => {
    api
      .putPhoneNumber(pk, phoneNumber)
      .then((newPhoneNumber: PhoneNumber) => {
        setPhoneNumbers((phoneNumbers: Map<PhoneNumberPK, InternalPhoneNumber>) => {
          const newPhoneNumbers = new Map<PhoneNumberPK, InternalPhoneNumber>(phoneNumbers);
          const revisedPhoneNumber: InternalPhoneNumber | undefined = phoneNumbers.get(pk);
          newPhoneNumbers.set(pk, {
            ...newPhoneNumber,
            revision: (revisedPhoneNumber?.revision || 0) + 1,
          });
          return newPhoneNumbers;
        });
        displayAlertSnackbar(`Updated phone number: ${phoneNumber}`, "success");
      })
      .catch(
        defaultErrorHandler((msg: string) => {
          displayAlertSnackbar(msg, "error");
        }),
      );
  };

  const createNewPhoneNumber = (phoneNumber: string) => {
    api
      .postPhoneNumber(phoneNumber)
      .then((newPhoneNumber: PhoneNumber) => {
        resetNewPhoneNumber();
        setPhoneNumbers((phoneNumbers: Map<PhoneNumberPK, InternalPhoneNumber>) => {
          const newPhoneNumbers = new Map<PhoneNumberPK, InternalPhoneNumber>(phoneNumbers);
          newPhoneNumbers.set(newPhoneNumber.pk, { ...newPhoneNumber, revision: 1 });
          return newPhoneNumbers;
        });
        displayAlertSnackbar(`Created new phone number: ${newPhoneNumber.phone_number}`, "success");
      })
      .catch(
        defaultErrorHandler((msg: string) => {
          displayAlertSnackbar(msg, "error");
        }),
      );
  };

  const deleteSavedPhoneNumber = (pk: PhoneNumberPK, phoneNumber: string) => {
    api
      .deletePhoneNumber(pk)
      .then(() => {
        setPhoneNumbers((phoneNumbers: Map<PhoneNumberPK, InternalPhoneNumber>) => {
          const newPhoneNumbers = new Map<PhoneNumberPK, InternalPhoneNumber>(phoneNumbers);
          newPhoneNumbers.delete(pk);
          return newPhoneNumbers;
        });
        displayAlertSnackbar(`Deleted phone number: ${phoneNumber}`, "warning");
      })
      .catch(
        defaultErrorHandler((msg: string) => {
          displayAlertSnackbar(msg, "error");
        }),
      );
  };

  const onSave = (pk: PhoneNumberPK | undefined, phoneNumber: string) => {
    if (pk) {
      updateSavedPhoneNumber(pk, phoneNumber);
    } else createNewPhoneNumber(phoneNumber);
  };

  const onDelete = (pk: PhoneNumberPK | undefined, phoneNumber: string) => {
    if (pk) {
      deleteSavedPhoneNumber(pk, phoneNumber);
    } else {
      resetNewPhoneNumber();
    }
  };

  const newPhoneNumberComponent = newPhoneNumber && (
    <PhoneNumberComponent
      key={`newPhoneNumber-${newPhoneNumber.revision}`}
      pk={newPhoneNumber.pk}
      phoneNumber={newPhoneNumber.phone_number}
      onSave={onSave}
      onDelete={onDelete}
      unsavedChanges={false}
    />
  );

  return (
    <div className={classes.root}>
      {incidentSnackbar}
      <Grid key="new-phone-number-grid-item" item xs={12} className={classes.phoneNumber}>
        <Typography>Create new phone number</Typography>
        {newPhoneNumberComponent}
      </Grid>
      {[...phoneNumbers.values()].map((phoneNumber: InternalPhoneNumber) => {
        return (
          <Grid key={`${phoneNumber.pk}-grid-item`} item xs={12} className={classes.phoneNumber}>
            <PhoneNumberComponent
              exists
              key={`key-${phoneNumber.pk}-${phoneNumber.revision}`}
              pk={phoneNumber.pk}
              phoneNumber={phoneNumber.phone_number}
              onSave={onSave}
              onDelete={onDelete}
              unsavedChanges={false}
            />{" "}
          </Grid>
        );
      })}
    </div>
  );
};

export default PhoneNumberList;
