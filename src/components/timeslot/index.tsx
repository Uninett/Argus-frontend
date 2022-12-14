import React, { useState } from "react";

import './timeslot.css';

import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import DeleteIcon from "@material-ui/icons/Delete";
import Paper from "@material-ui/core/Paper";
import SaveIcon from "@material-ui/icons/Save";
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

import Spinning from "../spinning";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";

import TimePicker from "../TimePicker";

import { useStateWithDynamicDefault, dateFromTimeOfDayString, timeOfDayFromDate } from "../../utils";
import { makeConfirmationButton } from "../buttons/ConfirmationButton";

import type { TimeslotPK, TimeRecurrence, TimeRecurrenceDay } from "../../api/types.d";
import { TimeRecurrenceDayNameMap, TIME_RECURRENCE_DAY_IN_ORDER } from "../../api/consts";

import { WHITE } from "../../colorscheme";
import { isBefore, parse, isValid } from "date-fns";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(3),
      color: theme.palette.text.secondary,
      minWidth: 30,
    },
    recurrenceContainer: {
      padding: theme.spacing(3),
      borderColor: theme.palette.divider,
    },
    dayPickersContainer: {
      padding: theme.spacing(3),
    },
    timePicker: {
      padding: theme.spacing(2),
    },
    removeWrapper: {
      paddingRight: theme.spacing(3),
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
      '&:hover': {
        backgroundColor: `${theme.palette.warning.main}`,
        opacity: 0.7
      },
    },
    safeButton: {
      background: theme.palette.primary.main,
      color: WHITE,
      '&:hover': {
        backgroundColor: `${theme.palette.primary.main}`,
        opacity: 0.7
      },
    },
    createDeleteButtonGroup: {
      margin: theme.spacing(1),
    },
  }),
);

const DEFAULT_TIMESLOT_RECURRENCE: TimeRecurrence = {
  // eslint-disable-next-line
  all_day: false,
  start: "04:00:00",
  end: "16:00:00",
  days: [1, 2, 3, 4, 5], // work-week
};

export type TimeslotRecurrenceComponentPropsType = {
  id: number;
  recurrence: TimeRecurrence;
  onChange: (id: number, recurrence: TimeRecurrence, isValid: boolean) => void;
  onRemove: (id: number, recurrence: TimeRecurrence) => void;
  disabled?: boolean;

  // Primary key of the timeslot which the recurrence belongs to. The timeslot pk is combined with the id of the recurrence to create an unique id for sub-components.
  timeslotPk?: TimeslotPK;
};

export const TimeslotRecurrenceComponent: React.FC<TimeslotRecurrenceComponentPropsType> = ({
  id,
  recurrence,
  onChange,
  onRemove,
  disabled,
  timeslotPk,
}: TimeslotRecurrenceComponentPropsType) => {
  const style = useStyles();

  const [startTimeError, setStartTimeError] = useState<boolean>(false);
  const [startTimeHelperText, setStartTimeHelperText] = useState<string>("Required");
  const [endTimeError, setEndTimeError] = useState<boolean>(false);
  const [endTimeHelperText, setEndTimeHelperText] = useState<string>("Required");

  const RemoveRecurrenceButton = makeConfirmationButton({
    title: `Remove recurrence ${recurrence.start}-${recurrence.end}`,
    question: "Are you sure you want to remove this recurrence?",
    onConfirm: () => undefined,
  });

  const handleRemoveRecurrence = () => {
    setStartTimeError(false);
    setEndTimeError(false);
    onRemove(id, recurrence);
  };

  const handleRecurrenceDaysChange = (days: TimeRecurrenceDay[]) => {
    onChange(id, { ...recurrence, days }, !(startTimeError || endTimeError));
  };

  const handleTimeChange = (date: Date | null, isStart: boolean,
                            id: number, recurrence: TimeRecurrence) => {
    if (date) {
      // parse
      const newTime = parse(timeOfDayFromDate(date), 'HH:mm:ss', new Date())
      const startTime = isStart ? newTime : parse(recurrence.start, 'HH:mm:ss', new Date());
      const endTime = isStart ? parse(recurrence.end, 'HH:mm:ss', new Date()) : newTime;

      const isEndValid = isValid(endTime);
      const isStartValid = isValid(startTime);


      if (!isValid(newTime)) {
        setStartTimeError(!isStartValid || startTimeError);
        setEndTimeError(!isEndValid || endTimeError);
        setStartTimeHelperText(isStart ? "Invalid" : startTimeHelperText);
        setEndTimeHelperText(isStart ? endTimeHelperText : "Invalid");
        onChange(id, { ...recurrence, start: timeOfDayFromDate(startTime), end: timeOfDayFromDate(endTime) }, false)
      } else {
        if (isEndValid && isStartValid) {
          if (isBefore(startTime, endTime)) {
            setStartTimeError(false);
            setEndTimeError(false);
            setStartTimeHelperText("Required");
            setEndTimeHelperText("Required");
            onChange(id, { ...recurrence, start: timeOfDayFromDate(startTime), end: timeOfDayFromDate(endTime) }, true)
          } else {
            setStartTimeError(isStart);
            setEndTimeError(!isStart);
            setStartTimeHelperText(isStart ? "Must be before end time" : "Required");
            setEndTimeHelperText(isStart ? "Required" : "Must be after start time");
            onChange(id, { ...recurrence, start: timeOfDayFromDate(startTime), end: timeOfDayFromDate(endTime) }, false)
          }
        } else {
          setStartTimeError(!isStartValid);
          setEndTimeError(!isEndValid);
          setStartTimeHelperText(isStartValid ? "Required" : startTimeHelperText);
          setEndTimeHelperText(isEndValid ? "Required" : endTimeHelperText);
          onChange(id, { ...recurrence, start: timeOfDayFromDate(startTime), end: timeOfDayFromDate(endTime) }, false)
        }
      }
    } else {
      if (isStart) {
        setStartTimeError(true);
        setStartTimeHelperText('Required');
        onChange(id, { ...recurrence, start: "" }, false);
      } else {
        setEndTimeError(true);
        setEndTimeHelperText('Required');
        onChange(id, { ...recurrence, end: "" }, false);
      }
    }
  };


  // eslint-disable-next-line @typescript-eslint/camelcase
  const allDay = recurrence.all_day;
  const start = !allDay && dateFromTimeOfDayString(recurrence.start);
  const end = !allDay && dateFromTimeOfDayString(recurrence.end);

  return (
    <div className={`${style.recurrenceContainer} recurrenceContainer`}>
      <div className={`${style.removeWrapper} removeWrapper`}>
        <RemoveRecurrenceButton
          variant="text"
          size="small"
          className={style.dangerousButton}
          startIcon={<DeleteIcon />}
          onClick={handleRemoveRecurrence}
          disabled={disabled}
        >
          Remove
        </RemoveRecurrenceButton>
      </div>
      <div className={`${style.dayPickersContainer} dayPickersContainer`}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <FormControlLabel
              id="all-day-checkbox"
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
                    onChange(id, { ...DEFAULT_TIMESLOT_RECURRENCE, days: recurrence.days },  !(startTimeError || endTimeError));
                  } else {
                    setStartTimeError(false);
                    setEndTimeError(false);
                    // eslint-disable-next-line
                    onChange(id, { ...recurrence, all_day: true, start: "", end: "" },
                      true);
                  }
                }}
                disabled={disabled}
              />
            }
            label="All day"
          />
          <div className="timePickers">
            <TimePicker
                id={timeslotPk ? `timeslot-${timeslotPk}-start-time-picker-${id}` : `start-time-picker-${id}`}
                className={style.timePicker}
                disabled={allDay || disabled}
                margin="normal"
                label="Start time picker"
                value={start || null}
                required={!allDay}
                error={startTimeError}
                helperText={startTimeError ? startTimeHelperText : null}
                onChange={(date: Date | null) => handleTimeChange(date, true, id, recurrence)}
                KeyboardButtonProps={{
                  "aria-label": "change start time",
                }}
            />
            <TimePicker
                id={timeslotPk ? `timeslot-${timeslotPk}-end-time-picker-${id}` : `end-time-picker-${id}`}
                className={style.timePicker}
                disabled={allDay || disabled}
                margin="normal"
                label="End time picker"
                value={end || null}
                required={!allDay}
                error={endTimeError}
                helperText={endTimeError ? endTimeHelperText : null}
                KeyboardButtonProps={{
                  "aria-label": "change end time",
                }}
                onChange={(date: Date | null) => handleTimeChange(date, false, id, recurrence)}
            />
          </div>

          <div className="grow" />
        </MuiPickersUtilsProvider>
      </div>
      <DaySelector disabled={disabled} selectedDays={recurrence.days} onSelectionChange={handleRecurrenceDaysChange} />
    </div>
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
            <div className="dayChipsContainer">
              {TIME_RECURRENCE_DAY_IN_ORDER.filter((day) => selectedDays.has(day)).map((day: TimeRecurrenceDay) => (
                <Chip key={day} label={TimeRecurrenceDayNameMap[day]} />
              ))}
            </div>
          );
        }}
        disabled={disabled}
        MenuProps={{
          variant: "menu",
          getContentAnchorEl: null,
        }}
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

  const [invalidTime, setInvalidTime] = useState<boolean>(false);

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

  const isValidTime = (start: string, end: string) => {
    const startTime = parse(start, 'HH:mm:ss', new Date());
    const endTime = parse(end, 'HH:mm:ss', new Date());
    if (start === "" || end === "") {
      return false;
    }
    return isBefore(startTime, endTime);
  }

  const RemoveTimeslotButton = makeConfirmationButton({
    title: `Remove ${timeslotName}`,
    question: "Are you sure you want to remove this timeslot?",
    onConfirm: () => {
      setDeleteLoading(true);
      onDelete(pk, timeslotName);
    },
  });

  return (
    <div key={pk} className="root">
      <Paper className={`${classes.paper} paper`}>
        <form
          className="root"
          aria-label={timeslotName ? timeslotName : "new timeslot"}
          noValidate
          autoComplete="off"
        >
          <Grid container direction="column" alignItems="stretch" spacing={4}>
            <Grid item container direction="row" justify="space-between" spacing={2} id="input-buttons-container">
              <Grid item xs={12} md={6}>
                <TextField
                  id={pk ? `timeslot-${pk}-name-input` : "new-timeslot-name-input"}
                  error={invalidTimeslotName}
                  helperText={invalidTimeslotName ? "Required" : null}
                  required
                  label="Timeslot name"
                  variant="standard"
                  value={timeslotName}
                  fullWidth
                  onChange={onTimeslotNameChange}
                  disabled={updateLoading || deleteLoading}
                />
              </Grid>
              <Grid item xs={12} md={6} >
                <ButtonGroup variant="contained" aria-label="outlined primary button group" className="button-group">
                  <Button
                    variant="contained"
                    size="small"
                    className={classes.safeButton}
                    onClick={() => {
                      if (timeslotName === "") {
                        setInvalidTimeslotName(true);
                        return;
                      }
                      setUpdateLoading(true);
                      onSave(pk, timeslotName, recurrences);
                      setUpdateLoading(false);
                    }}
                    disabled={!hasChanged || invalidTimeslotName || invalidTime || updateLoading || deleteLoading}
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
                      setDeleteLoading(false);
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
                </ButtonGroup>
              </Grid>
            </Grid>
            {recurrences.map((recurrence: TimeRecurrence, index: number) => {
              return (
                <Grid key={index} item xs={12} className="recurrenceGridContainer">
                  <TimeslotRecurrenceComponent
                    timeslotPk={pk}
                    id={index}
                    recurrence={recurrence}
                    onChange={(id: number, recurrence: TimeRecurrence, isValid?: boolean) => {
                      setRecurrences((prev: TimeRecurrence[]) => {
                        const recurrences = [...prev];
                        recurrences[id] = recurrence;
                        return recurrences;
                      });

                      if (!isValid) {
                        setInvalidTime(true);
                      } else if (recurrences
                        .filter((r, index) =>
                          index !== id && !isValidTime(r.start, r.end) && !r.all_day).length > 0) {
                        setInvalidTime(true);
                      } else {
                        setInvalidTime(false);
                      }

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
                </Grid>
              );
            })}
          </Grid>
        </form>
      </Paper>
    </div>
  );
};

export default TimeslotComponent;
