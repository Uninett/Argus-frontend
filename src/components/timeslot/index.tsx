import React, { useState } from "react";

import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import DeleteIcon from "@material-ui/icons/Delete";
import Paper from "@material-ui/core/Paper";
import SaveIcon from "@material-ui/icons/Save";
import EditIcon from "@material-ui/icons/Edit";
import TextField from "@material-ui/core/TextField";
import Input from "@material-ui/core/Input";
import Chip from "@material-ui/core/Chip";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Grid from "@material-ui/core/Grid";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import RemoveIcon from "@material-ui/icons/DeleteOutlineOutlined";

import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";

import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionActions from "@material-ui/core/AccordionActions";
import Divider from "@material-ui/core/Divider";

import Spinning from "../spinning";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, KeyboardTimePicker } from "@material-ui/pickers";

import { useStateWithDynamicDefault, dateFromTimeOfDayString, timeOfDayFromDate } from "../../utils";
import { makeConfirmationButton } from "../buttons/ConfirmationButton";

import {
  TimeslotPK,
  TimeRecurrence,
  TimeRecurrenceDay,
  TimeRecurrenceDayNameMap,
  TIME_RECURRENCE_DAY_IN_ORDER,
} from "../../api";

import { WHITE } from "../../colorscheme";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(3),
      textAlign: "center",
      color: theme.palette.text.secondary,
      minWidth: 30,
    },
    recurrencePaper: {
      padding: theme.spacing(2),
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

export const DEFAULT_TIMESLOT_RECURRENCE: TimeRecurrence = {
  // eslint-disable-next-line
  all_day: false,
  start: "04:00:00",
  end: "16:00:00",
  days: [1, 2, 3, 4, 5], // work-week
};

export type TimeslotRecurrenceComponentPropsType = {
  id: number;
  recurrence: TimeRecurrence;
  onChange: (id: number, recurrence: TimeRecurrence) => void;
  onRemove: (id: number, recurrence: TimeRecurrence) => void;
  disabled?: boolean;
};

export const TimeslotRecurrenceComponent: React.FC<TimeslotRecurrenceComponentPropsType> = ({
  id,
  recurrence,
  onChange,
  onRemove,
  disabled,
}: TimeslotRecurrenceComponentPropsType) => {
  const classes = useStyles();

  const RemoveRecurrenceButton = makeConfirmationButton({
    title: `Remove recurrence ${recurrence.start}-${recurrence.end}`,
    question: "Are you sure you want to remove this recurrence?",
    onConfirm: () => undefined,
  });

  const handleRemoveRecurrence = () => {
    onRemove(id, recurrence);
  };

  const handleRecurrenceDaysChange = (days: TimeRecurrenceDay[]) => {
    onChange(id, { ...recurrence, days });
  };

  // eslint-disable-next-line @typescript-eslint/camelcase
  const allDay = recurrence.all_day;
  const start = !allDay && dateFromTimeOfDayString(recurrence.start);
  const end = !allDay && dateFromTimeOfDayString(recurrence.end);

  return (
    <>
      <Grid item container direction="row" justify="space-between" alignItems="center" spacing={3}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Grid item sm>
            <FormControlLabel
              control={
                <Checkbox
                  checked={allDay}
                  value="checkBox"
                  color="primary"
                  inputProps={{
                    "aria-label": "secondary checkbox",
                  }}
                  onClick={() => {
                    if (allDay) {
                      onChange(id, { ...DEFAULT_TIMESLOT_RECURRENCE, days: recurrence.days });
                    } else {
                      // eslint-disable-next-line
                      onChange(id, { ...recurrence, all_day: true, start: "", end: "" });
                    }
                  }}
                  disabled={disabled}
                />
              }
              label="All day"
            />
          </Grid>
          <Grid item>
            <KeyboardTimePicker
              disabled={allDay || disabled}
              margin="normal"
              label="Start time picker"
              value={start || null}
              onChange={(date: Date | null) => {
                if (date) {
                  onChange(id, { ...recurrence, start: timeOfDayFromDate(date) });
                } else {
                  onChange(id, { ...recurrence, start: "" });
                }
              }}
              KeyboardButtonProps={{
                "aria-label": "change start time",
              }}
            />
          </Grid>
          <Grid item>
            <KeyboardTimePicker
              disabled={allDay || disabled}
              margin="normal"
              label="End time picker"
              value={end || null}
              KeyboardButtonProps={{
                "aria-label": "change end time",
              }}
              onChange={(date: Date | null) => {
                if (date) {
                  onChange(id, { ...recurrence, end: timeOfDayFromDate(date) });
                } else {
                  onChange(id, { ...recurrence, end: "" });
                }
              }}
            />
          </Grid>
        </MuiPickersUtilsProvider>
        <Grid item>
          <RemoveRecurrenceButton
            variant="text"
            size="small"
            className={classes.dangerousButton}
            startIcon={<RemoveIcon />}
            onClick={() => handleRemoveRecurrence()}
            disabled={disabled}
          >
            Remove
          </RemoveRecurrenceButton>
        </Grid>
      </Grid>
      <Grid item>
        <DaySelector
          disabled={disabled}
          selectedDays={recurrence.days}
          onSelectionChange={handleRecurrenceDaysChange}
        />
      </Grid>
    </>
  );
};

export type DaySelectorPropsType = {
  selectedDays: TimeRecurrenceDay[];
  onSelectionChange: (days: TimeRecurrenceDay[]) => void;
  disabled?: boolean;
};

export const DaySelector: React.FC<DaySelectorPropsType> = ({
  selectedDays,
  onSelectionChange,
  disabled,
}: DaySelectorPropsType) => {
  return (
    <FormControl style={{ minWidth: "100%" }}>
      <InputLabel id="demo-mutiple-chip-label">Days</InputLabel>
      <Select
        labelId="demo-mutiple-chip-label"
        id="demo-mutiple-chip"
        multiple
        value={selectedDays}
        // eslint-disable-next-line
        onChange={(e: any) => {
          const changeValue = e.target.value;
          onSelectionChange(changeValue);
        }}
        input={<Input id="select-multiple-chip" />}
        renderValue={(selected) => {
          const selectedDays = new Set<TimeRecurrenceDay>(selected as TimeRecurrenceDay[]);
          return (
            <div>
              {TIME_RECURRENCE_DAY_IN_ORDER.filter((day) => selectedDays.has(day)).map((day: TimeRecurrenceDay) => (
                <Chip key={day} label={TimeRecurrenceDayNameMap[day]} />
              ))}
            </div>
          );
        }}
        disabled={disabled}
      >
        {TIME_RECURRENCE_DAY_IN_ORDER.map((day: TimeRecurrenceDay) => (
          <MenuItem key={day} value={day} selected>
            {TimeRecurrenceDayNameMap[day]}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export type TimeslotPropsType = {
  revision?: number | undefined;
  pk?: TimeslotPK;
  name?: string;
  recurrences: TimeRecurrence[];
  exists?: boolean;
  unsavedChanges: boolean;

  onSave: (pk: TimeslotPK | undefined, name: string, recurrences: TimeRecurrence[]) => void;
  onDelete: (pk: TimeslotPK | undefined, name: string) => void;
};

const TimeslotComponent: React.FC<TimeslotPropsType> = ({
  pk,
  name: nameProp,
  recurrences: recurrencesProp,
  exists,
  unsavedChanges,
  onSave,
  onDelete,
}: TimeslotPropsType) => {
  const classes = useStyles();

  const [timeslotName, setTimeslotName] = useStateWithDynamicDefault<string>(nameProp || "");
  const [invalidTimeslotName, setInvalidTimeslotName] = useState<boolean>(false);

  const [recurrences, setRecurrences] = useState<TimeRecurrence[]>(recurrencesProp);

  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [hasChanged, setHasChanged] = useStateWithDynamicDefault<boolean>(unsavedChanges);

  const [expanded, setExpanded] = useState(false);

  const handleAddRecurrence = () => {
    setRecurrences((prev: TimeRecurrence[]) => {
      // eslint-disable-next-line @typescript-eslint/camelcase
      return [...prev, { days: [], all_day: false, start: "08:00:00", end: "16:00:00" }];
    });
    setHasChanged(true);
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

  /*
  <Button
                variant="outlined"
                  size="small"
                  className={classes.safeButton}
                  onClick={() => handleAddRecurrence()}
                  startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  disabled={updateLoading || deleteLoading}
                >
                  Details
                </Button>
   */

  return (
    <form className={classes.root} noValidate autoComplete="off">
      <Card>
        <CardContent>
          <Grid container lg direction="column" spacing={4}>
            <Grid item>
              <TextField
                error={invalidTimeslotName}
                required
                label="Timeslot name"
                variant="outlined"
                value={timeslotName}
                onChange={onTimeslotNameChange}
                disabled={updateLoading || deleteLoading}
              />
            </Grid>
            <Grid item style={{ margin: 0, paddingBottom: 0 }}>
              <Typography>Recurrences</Typography>
            </Grid>
            {(recurrences.length > 0 &&
              recurrences.map((recurrence: TimeRecurrence, index: number) => {
                return (
                  <Grid key={index} item lg>
                    <Card variant="outlined">
                      <CardContent>
                        <TimeslotRecurrenceComponent
                          id={index}
                          recurrence={recurrence}
                          onChange={(id: number, recurrence: TimeRecurrence) => {
                            setRecurrences((prev: TimeRecurrence[]) => {
                              const recurrences = [...prev];
                              recurrences[id] = recurrence;
                              return recurrences;
                            });
                            setHasChanged(true);
                          }}
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          onRemove={(id: number, recurrence: TimeRecurrence) => {
                            setRecurrences((prev: TimeRecurrence[]) => {
                              const recurrences = [...prev];
                              recurrences.splice(id, 1);
                              return recurrences;
                            });
                            setHasChanged(true);
                          }}
                          disabled={updateLoading || deleteLoading}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })) || <Typography>No recurrences</Typography>}
          </Grid>
        </CardContent>
        <Divider />
        <CardActions>
          <Button
            variant="contained"
            size="small"
            className={classes.safeButton}
            onClick={() => {
              setUpdateLoading(true);
              onSave(pk, timeslotName, recurrences);
            }}
            disabled={!hasChanged || invalidTimeslotName || updateLoading || deleteLoading}
            startIcon={updateLoading ? <Spinning shouldSpin /> : <SaveIcon />}
          >
            {exists ? "Save" : "Create"}
          </Button>
          <RemoveTimeslotButton
            variant="contained"
            size="small"
            className={classes.dangerousButton}
            startIcon={deleteLoading ? <Spinning shouldSpin /> : <DeleteIcon />}
            disabled={!exists || updateLoading || deleteLoading}
            onClick={() => {
              setDeleteLoading(true);
              onDelete(pk, timeslotName);
            }}
          >
            Delete
          </RemoveTimeslotButton>
          <Button
            variant="outlined"
            size="small"
            className={classes.safeButton}
            onClick={() => handleAddRecurrence()}
            startIcon={<AddIcon />}
            disabled={updateLoading || deleteLoading}
          >
            Add recurrence
          </Button>
        </CardActions>
      </Card>
    </form>
  );
};

export default TimeslotComponent;
