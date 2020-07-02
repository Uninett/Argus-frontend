/* eslint-disable */
import React from "react";
import { TextField } from "@material-ui/core";
import TimeIntervalSelector from "../timeintervalselector/TimeIntervalSelector";
import Button from "@material-ui/core/Button";
import ConfirmationButton from "../buttons/ConfirmationButton";

type timeslotProp = {
  timeIntervals: any;
  saveTimeslot: any;
  handleStartTimeChange: any;
  handleEndTimeChange: any;
  handleDayChange: any;
  startTime: any;
  endTime: any;
  daysValue: any;
  addTimeInterval: any;
  handleNameChange: any;
  deleteTimeInterval: any;
  deleteTimeslot: any;
  timeslotKey: string;
  timeslots: any;
  timeslotName: string | undefined;
};

const Timeslot: React.FC<timeslotProp> = (props: timeslotProp) => {
  const setSlotlist = () => {
    const list: any = [];
    props.timeslots.forEach((timeslotMap: any) => {
      if (timeslotMap.has(props.timeslotKey)) {
        list.push(...timeslotMap.get(props.timeslotKey));
      }
    });
    return list;
  };

  const slotList = setSlotlist();

  return (
    <div className="super-container">
      <div className="timeslot-name">
        <TextField
          value={props.timeslotName || ""}
          required={true}
          margin="normal"
          variant="outlined"
          helperText="Name of timeslot"
          onChange={(e) => props.handleNameChange(e.target.value, props.timeslotKey)}
        />
      </div>

      <div className="timeslot-intervals">
        {props.timeIntervals
          .filter((slot: string) => {
            let cond = false;
            if (slotList.includes(slot)) {
              cond = true;
            }
            return cond;
          })
          .map((element: string) => {
            return (
              <TimeIntervalSelector
                key={element}
                dictKey={element}
                deleteTimeInterval={props.deleteTimeInterval}
                handleStartChange={props.handleStartTimeChange}
                handleEndChange={props.handleEndTimeChange}
                handleDayChange={props.handleDayChange}
                startTime={props.startTime.get(element)}
                endTime={props.endTime.get(element)}
                daysValue={props.daysValue.get(element)}
              />
            );
          })}
      </div>
      <Button className="timeslot-addNew" variant="contained" onClick={() => props.addTimeInterval(props.timeslotKey)}>
        +
      </Button>
      <div className="saveDelete">
        <div className="timeslot-delete">
          <ConfirmationButton
            title="Delete timeslot"
            question="Are you sure you want to delete this timeslot?"
            buttonProps={{
              variant: "contained",
              color: "secondary",
              size: "small",
            }}
            onConfirm={() => props.deleteTimeslot(props.timeslotKey)}
          >
            Delete
          </ConfirmationButton>
        </div>
        <div className="timeslot-save">
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              props.saveTimeslot(props.timeslotKey);
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Timeslot;
