import React from "react";

import { makeConfirmationButton } from "../buttons/ConfirmationButton";
import { WHITE } from "../../colorscheme";
import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";

// import "date-fns";
import DateFnsUtils from "@date-io/date-fns";

import { MuiPickersUtilsProvider, KeyboardTimePicker } from "@material-ui/pickers";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import RemoveIcon from "@material-ui/icons/Remove";

// Api
import type { TimeRecurrenceDay } from "../../api/types.d";

export type TimeslotRecurrenceDay = {
  pk: TimeRecurrenceDay;
  name: string;

  startTime?: Date;
  endTime?: Date;
  allDay: boolean;
};

type TimeslotDaySelectorPropsType = {
  day: TimeslotRecurrenceDay;
  onRemove: (interval: TimeslotRecurrenceDay) => void;
  onChange: (interval: TimeslotRecurrenceDay) => void;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dangerousButton: {
      background: theme.palette.warning.main,
      color: WHITE,
    },
  }),
);

const TimeslotDaySelector: React.FC<TimeslotDaySelectorPropsType> = ({
  day,
  onRemove,
  onChange,
}: TimeslotDaySelectorPropsType) => {
  const onAllDayChange = () => {
    onChange({ ...day, allDay: !day.allDay });
  };
  const handleStartTimeChange = (date: Date | null) => {
    onChange({ ...day, startTime: date ? date : undefined });
  };
  const handleEndTimeChange = (date: Date | null) => {
    onChange({ ...day, endTime: date ? date : undefined });
  };

  const classes = useStyles();

  const RemoveDayButton = makeConfirmationButton({
    title: `Remove ${day.name}`,
    question: "Are you sure you want to remove this day?",
    onConfirm: () => onRemove(day),
  });

  return (
    <>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                checked={day.allDay}
                onChange={onAllDayChange}
                value="checkBox"
                color="primary"
                inputProps={{
                  "aria-label": "secondary checkbox",
                }}
              />
            }
            label="All day"
          />
          <KeyboardTimePicker
            disabled={day.allDay}
            margin="normal"
            label="Start time picker"
            value={day.startTime || null}
            onChange={handleStartTimeChange}
            KeyboardButtonProps={{
              "aria-label": "change start time",
            }}
          />
          <KeyboardTimePicker
            disabled={day.allDay}
            margin="normal"
            label="End time picker"
            value={day.endTime || null}
            onChange={handleEndTimeChange}
            KeyboardButtonProps={{
              "aria-label": "change end time",
            }}
          />
          <div>
            <RemoveDayButton variant="text" size="small" className={classes.dangerousButton} startIcon={<RemoveIcon />}>
              Remove
            </RemoveDayButton>
          </div>
        </FormGroup>
      </MuiPickersUtilsProvider>
    </>
  );
};

export default TimeslotDaySelector;
