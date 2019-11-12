import React, { useState } from "react";
import { TextField } from "@material-ui/core";
import Select from "react-select";
import "./timeslot.css";
import Dialog from "../dialogue/Dialogue";
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
type TimeslotProp = {
  deleteTimeslot: any;
  handleStartChange: any;
  handleEndChange: any;
  handleDayChange: any;
  startTime: any;
  endTime: any;
  daysValue: any;
  dictKey: string;
};

const Timeslot: React.FC<TimeslotProp> = (props: TimeslotProp) => {
  return (
    <div>
      <div className="timeslot-time">
        <TextField
          id="start-time"
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
          id="end-time"
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
      <div className="timeslot-day">
        <Select
          isMulti
          value={props.daysValue}
          onChange={e => props.handleDayChange(e, props.dictKey)}
          name="filters"
          label="Single select"
          options={days}
        />
      </div>
      <div className="timeslot-delete">
        <Button
          variant={"contained"}
          onClick={e => props.deleteTimeslot(e, props.dictKey)}
        >
          Delete Timeslot
        </Button>
      </div>
    </div>
  );
};

export default Timeslot;
