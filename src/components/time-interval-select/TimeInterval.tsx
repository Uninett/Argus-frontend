import React from "react";
import { TextField } from "@material-ui/core";
import Select from "react-select";
import "./timeInterval.css";
import Button from "@material-ui/core/Button";

const days = [
  { value: "MO", label: "Monday" },
  { value: "TU", label: "Tuesday" },
  { value: "WE", label: "Wednesday" },
  { value: "TH", label: "Thursday" },
  { value: "FR", label: "Friday" },
  { value: "SA", label: "Saturday" },
  { value: "SU", label: "Sunday" }
];
type TimeIntervalProp = {
  deleteTimeInterval: any;
  handleStartChange: any;
  handleEndChange: any;
  handleDayChange: any;
  startTime: any;
  endTime: any;
  daysValue: any;
  dictKey: string;
};

const TimeInterval: React.FC<TimeIntervalProp> = (props: TimeIntervalProp) => {
  return (
    <div className="time-interval-setting">

          <div className="time-interval-day">
          <p>Days:</p>

            <Select
              isMulti
              value={props.daysValue}
              onChange={e => props.handleDayChange(e, props.dictKey)}
              name="filters"
              label="Single select"
              options={days}
              />
          </div>
      <div className="time-interval-time">
        <div className="time-interval-times">

        <TextField
          label="Start Time"
          type="time"
          margin="normal"
          variant="outlined"
          value={props.startTime}
          onChange={e => props.handleStartChange(e.target.value, props.dictKey)}
          InputLabelProps={{
            shrink: true
          }}
          inputProps={{
            step: 300
          }}
          />
        <TextField
          label="End Time"
          type="time"
          margin="normal"
          variant="outlined"
          value={props.endTime}
          onChange={e => props.handleEndChange(e.target.value, props.dictKey)}
          InputLabelProps={{
            shrink: true
          }}
          inputProps={{
            step: 300
          }}
          />
          </div>
    </div>
      <div className="time-interval-delete">
        <Button
          variant={"contained"}
          onClick={e => props.deleteTimeInterval(e, props.dictKey)}
          >
          X
        </Button>
      </div>
          </div>

  );
};

export default TimeInterval;
