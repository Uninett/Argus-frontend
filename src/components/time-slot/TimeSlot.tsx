import React from "react";
import { TextField } from "@material-ui/core";
import TimeInterval from "../time-interval-select/TimeInterval";
import Button from "@material-ui/core/Button";
import Dialog from "../dialogue/Dialogue";

type timeSlotProp = {
  timeIntervals: any;
  saveTimeSlot: any;
  handleStartTimeChange: any;
  handleEndTimeChange: any;
  handleDayChange: any;
  startTime: any;
  endTime: any;
  daysValue: any;
  addTimeInterval: any;
  handleNameChange: any;
  deleteTimeInterval: any;
  deleteTimeSlot: any;
  timeSlotKey: string;
  timeSlots: any;
  timeSlotName: string | undefined;
};

const TimeSlot: React.FC<timeSlotProp> = (props: timeSlotProp) => {
  const setSlotlist = () => {
    const list: any = [];
    props.timeSlots.forEach((timeSlotMap: any) => {
      if (timeSlotMap.has(props.timeSlotKey)) {
        list.push(...timeSlotMap.get(props.timeSlotKey));
      }
    });
    return list;
  };

  const slotList = setSlotlist();

  return (
    <div className="super-container">
      <div className="timeslot-name">
        <TextField
          value={props.timeSlotName || ""}
          required={true}
          margin="normal"
          variant="outlined"
          helperText="Name of time slot"
          onChange={e => props.handleNameChange(e.target.value, props.timeSlotKey)}
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
            <TimeInterval
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
      <Button
        className="timeslot-addNew"
        variant="contained"
        onClick={() => props.addTimeInterval(props.timeSlotKey)}
      >
        +
      </Button>
      <div className="saveDelete">
      <div className="timeslot-delete">
      <Dialog handleDelete={() => props.deleteTimeSlot(props.timeSlotKey)} />
      </div>
        <div className="timeslot-save">

      <Button
      variant="contained"
      color="primary"
      onClick={() => {
        props.saveTimeSlot(props.timeSlotKey);
      }}
      >
        Save
      </Button>
      </div>
      </div>
    </div>
  );
};

export default TimeSlot;
