import React, { useState, useEffect } from "react";

import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import DeleteIcon from "@material-ui/icons/Delete";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from "@material-ui/core/Paper";
import SaveIcon from "@material-ui/icons/Save";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import Spinning from "../spinning";

import { useStateWithDynamicDefault } from "../../utils";
import { makeConfirmationButton } from "../buttons/ConfirmationButton";

import TimeslotDaySelector, { TimeslotRecurrenceDay } from "../timeslotdayselector";

import { TimeslotPK, TimeRecurrenceDay, TIME_RECURRENCE_DAY_IN_ORDER, TimeRecurrenceDayNameMap } from "../../api";

import { WHITE } from "../../colorscheme";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(1),
      textAlign: "center",
      color: theme.palette.text.secondary,
      minWidth: 30,
    },
    dangerousButton: {
      background: theme.palette.warning.main,
      color: WHITE,
    },
    safeButton: {
      background: theme.palette.primary.main,
      color: WHITE,
    },
    timeslot: {
      alignItems: "center",
      padding: theme.spacing(3),
    },
    createDeleteButtonGroup: {
      margin: theme.spacing(1),
    },
  }),
);

type SelectDayDialogPropsType = {
  remainingDays: TimeslotRecurrenceDay[];
  open: boolean;
  selectedValue?: TimeslotRecurrenceDay;
  onClose: (day?: TimeslotRecurrenceDay) => void;
};

const SelectDayDialog: React.FC<SelectDayDialogPropsType> = ({
  remainingDays,
  open,
  selectedValue,
  onClose,
}: SelectDayDialogPropsType) => {
  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleDaySelect = (day: TimeslotRecurrenceDay) => {
    onClose(day);
  };

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle>Select day</DialogTitle>
      <List>
        {remainingDays.map((day: TimeslotRecurrenceDay) => (
          <ListItem button onClick={() => handleDaySelect(day)} key={day.pk}>
            <ListItemText primary={day.name} key={day.pk} />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
};

const defaultDay = (name: string, pk: TimeRecurrenceDay): TimeslotRecurrenceDay => ({
  name: name,
  pk: pk,
  startTime: new Date("2014-08-18T08:00:00"),
  endTime: new Date("2014-08-18T16:00:00"),
  allDay: false,
});

export type TimeslotPropsType = {
  pk?: TimeslotPK;
  name?: string;
  days: Partial<Record<TimeRecurrenceDay, TimeslotRecurrenceDay>>;
  exists?: boolean;
  unsavedChanges: boolean;

  onSave: (
    pk: TimeslotPK | undefined,
    name: string,
    days: Partial<Record<TimeRecurrenceDay, TimeslotRecurrenceDay>>,
  ) => void;
  onDelete: (pk: TimeslotPK | undefined, name: string) => void;
};

const TimeslotComponent: React.FC<TimeslotPropsType> = ({
  pk,
  name: nameProp,
  days: daysProp,
  exists,
  unsavedChanges,
  onSave,
  onDelete,
}: TimeslotPropsType) => {
  const classes = useStyles();

  const [timeslotName, setTimeslotName] = useStateWithDynamicDefault<string>(nameProp || "");
  const [invalidTimeslotName, setInvalidTimeslotName] = useState<boolean>(false);
  const [days, setDays] = useStateWithDynamicDefault<Partial<Record<TimeRecurrenceDay, TimeslotRecurrenceDay>>>(
    daysProp,
  );
  const [remainingDays, setRemainingDays] = useState<TimeslotRecurrenceDay[]>([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [hasChanged, setHasChanged] = useStateWithDynamicDefault<boolean>(unsavedChanges);

  useEffect(() => {
    const remaining = TIME_RECURRENCE_DAY_IN_ORDER.filter(
      (key: TimeRecurrenceDay) => !days[key],
    ).map((key: TimeRecurrenceDay) => defaultDay(TimeRecurrenceDayNameMap[key], key));
    setRemainingDays(remaining);
  }, [days]);

  const onDayChange = (day: TimeslotRecurrenceDay) => {
    setHasChanged(true);
    setDays((days: Partial<Record<TimeRecurrenceDay, TimeslotRecurrenceDay>>) => ({ ...days, [day.pk]: day }));
  };

  const onDayRemove = (day: TimeslotRecurrenceDay) => {
    setHasChanged(true);
    setDays((days: Partial<Record<TimeRecurrenceDay, TimeslotRecurrenceDay>>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [day.pk]: removedDay, ...newDays } = days;
      return { ...newDays, [day.pk]: undefined };
    });
  };

  const [selectDialogIsOpen, setSelectDialogIsOpen] = useState<boolean>(false);

  const onAddDayClick = () => {
    setSelectDialogIsOpen(true);
  };

  const onSelectDialogClose = (day?: TimeslotRecurrenceDay) => {
    setSelectDialogIsOpen(false);
    if (day) {
      setHasChanged(true);
      setDays((days: Partial<Record<TimeRecurrenceDay, TimeslotRecurrenceDay>>) => ({ ...days, [day.pk]: day }));
    }
  };

  const onTimeslotNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    if (newName !== timeslotName) {
      setHasChanged(true);
      setTimeslotName(event.target.value);
      setInvalidTimeslotName(newName === "");
    }
  };

  const RemoveTimeslotButton = makeConfirmationButton({
    title: `Remove ${timeslotName}`,
    question: "Are you sure you want to remove this timeslot?",
    onConfirm: () => {
      setDeleteLoading(true);
      onDelete(pk, timeslotName);
    },
  });

  return (
    <div key={pk} className={classes.root}>
      <Paper className={classes.paper}>
        <form className={classes.root} noValidate autoComplete="off">
          <TextField
            error={invalidTimeslotName}
            required
            label="Timeslot name"
            variant="standard"
            value={timeslotName}
            onChange={onTimeslotNameChange}
          />
          <ButtonGroup variant="contained" aria-label="outlined primary button group">
            <Button
              variant="contained"
              size="small"
              className={classes.safeButton}
              onClick={() => {
                setUpdateLoading(true);
                onSave(pk, timeslotName, days);
              }}
              disabled={!hasChanged || invalidTimeslotName}
              startIcon={updateLoading ? <Spinning shouldSpin /> : <SaveIcon />}
            >
              {exists ? "Save" : "Create"}
            </Button>
            <RemoveTimeslotButton
              variant="contained"
              size="small"
              className={classes.dangerousButton}
              startIcon={deleteLoading ? <Spinning shouldSpin /> : <DeleteIcon />}
              disabled={!exists}
            >
              Delete
            </RemoveTimeslotButton>
            <Button
              variant="outlined"
              size="small"
              className={classes.safeButton}
              onClick={() => onAddDayClick()}
              startIcon={<AddIcon />}
            >
              Add recurrence
            </Button>
          </ButtonGroup>
          {TIME_RECURRENCE_DAY_IN_ORDER.map((key: TimeRecurrenceDay) => days[key] as TimeslotRecurrenceDay).map(
            (day?: TimeslotRecurrenceDay) => {
              if (!day) return undefined;
              return (
                <div key={day.pk}>
                  <Typography>{`${day.startTime?.getHours()}` + " - " + `${day.endTime?.getHours()}`}</Typography>
                  <TimeslotDaySelector key={day.pk} day={day} onChange={onDayChange} onRemove={onDayRemove} />
                </div>
              );
            },
          )}
          <SelectDayDialog remainingDays={remainingDays} open={selectDialogIsOpen} onClose={onSelectDialogClose} />
        </form>
      </Paper>
    </div>
  );
};

export default TimeslotComponent;
