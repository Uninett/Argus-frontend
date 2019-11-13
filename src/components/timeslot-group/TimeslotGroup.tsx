import React from "react";
import { TextField } from "@material-ui/core";
import Timeslot from "../timeslot-select/Timeslot";
import Button from "@material-ui/core/Button";
import Dialog from "../dialogue/Dialogue";

type timeslotGrupProp = {
  timeslots: any;
  saveTimeslotGroup: any;
  handleStartTimeChange: any;
  handleEndTimeChange: any;
  handleDayChange: any;
  startTime: any;
  endTime: any;
  daysValue: any;
  addTimeslot: any;
  handleNameChange: any;
  deleteTimeslot: any;
  deleteTimeslotGroup: any;
  groupKey: string;
  timeslotGroups: any;
  groupName: string | undefined;
};

const TimeslotGroup: React.FC<timeslotGrupProp> = (props: timeslotGrupProp) => {
  const setSlotlist = () => {
    const list: any = [];
    props.timeslotGroups.forEach((groupMap: any) => {
      if (groupMap.has(props.groupKey)) {
        list.push(...groupMap.get(props.groupKey));
      }
    });
    return list;
  };

  const slotList = setSlotlist();

  return (
    <div className="super-container">
      <div id="timeslot-name" className="timeslot-group-name">
        <TextField
          id="name"
          value={props.groupName || ""}
          required={true}
          margin="normal"
          variant="outlined"
          helperText="Name timeslot group"
          onChange={e => props.handleNameChange(e.target.value, props.groupKey)}
        />
      </div>
      
      <div className="timeslot-settings">

      {props.timeslots
        .filter((slot: string) => {
          let cond = false;
          if (slotList.includes(slot)) {
            cond = true;
          }
          return cond;
        })
        .map((element: string) => {
          return (
            <Timeslot
            key={element}
            dictKey={element}
            deleteTimeslot={props.deleteTimeslot}
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
      id="timeslot-addNew"
        variant="contained"
        onClick={() => props.addTimeslot(props.groupKey)}
      >
        +
      </Button>
      <div className="saveDelete">
      <div id="timeslot-delete">
      <Dialog handleDelete={() => props.deleteTimeslotGroup(props.groupKey)} />
      </div>
        <div id="timeslot-save">

      <Button
      id="timeslot-save"
      variant="contained"
      color="primary"
      onClick={() => {
        props.saveTimeslotGroup(props.groupKey);
      }}
      >
        Save
      </Button>
      </div>
      </div>
    </div>
  );
};

export default TimeslotGroup;
