import React from "react";
import { TextField } from "@material-ui/core";
import TimeInterval from "../time-interval-select/TimeInterval";
import Button from "@material-ui/core/Button";
import Dialog from "../dialogue/Dialogue";

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
      <Button className="timeslot-addNew" variant="contained" onClick={() => props.addTimeInterval(props.timeslotKey)}>
        +
      </Button>
      <div className="saveDelete">
        <div className="timeslot-delete">
          <Dialog handleDelete={() => props.deleteTimeslot(props.timeslotKey)} />
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
