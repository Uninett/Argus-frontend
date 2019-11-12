import React, { useEffect, useState } from "react";
import TimeslotGroup from "../timeslot-group/TimeslotGroup";
import axios from "axios";

const Timeslots: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const uuidv1 = require("uuid/v1");
  const initialTimeslotGroupKey = uuidv1();
  const initialTimeslotKey = uuidv1();
  const [timeslotGroups, setTimeslotGroups] = useState([
    new Map([[initialTimeslotGroupKey, [initialTimeslotKey]]])
  ]);
  const [timeslots, setTimeslot] = useState([initialTimeslotKey]);
  const [fromServer, setFromServer] = useState(
    new Map([[initialTimeslotGroupKey, false]])
  );

  const nameObj: any = {};

  const [nameField, setNameField] = useState<any>(
    (nameObj[initialTimeslotGroupKey] = "")
  );
  const [startTime, setStartTime] = useState(
    new Map([[initialTimeslotKey, "07:30"]])
  );
  const [endTime, setEndTime] = useState(
    new Map([[initialTimeslotKey, "16:30"]])
  );
  const [daysValue, setDaysValue] = useState(
    new Map([[initialTimeslotKey, []]])
  );

  useEffect(() => {
    getTimeslotGroup();
  }, []);

  const getTimeslotGroup = async () => {
    await axios({
      url: "http://127.0.0.1:8000/notificationprofiles/timeslotgroups/",
      method: "GET",
      headers: {
        Authorization: "Token " + localStorage.getItem("token")
      }
    }).then((response: any) => {
      buildTimeslotGroups(response.data);
    });
  };

  const buildTimeslotGroups = (data: any) => {
    const responseGroups: any = [...timeslotGroups];
    const responseTimeslots: any = [...timeslots];
    data.forEach((group: any) => {
      const groupKey = uuidv1();
      const serverBoolean = fromServer;
      serverBoolean.set(groupKey, true);
      setFromServer(serverBoolean);
      setNameField({ [groupKey]: group.name.toString() });
      responseGroups.push(new Map([[groupKey, []]]));
      group.time_slots.forEach((timeslot: any) => {
        const timeslotKey = uuidv1();
        responseTimeslots.push(timeslotKey);
        responseGroups.forEach((groupMap: any) => {
          if (groupMap.has(groupKey)) {
            const groupTimeslots = groupMap.get(groupKey);
            groupTimeslots.push(timeslotKey);
            groupMap.set(groupTimeslots);
          }
        });
        setStartTime(startTime.set(timeslotKey, timeslot.start.toString()));
        setEndTime(endTime.set(timeslotKey, timeslot.end.toString()));
        setDaysValue(daysValue.set(timeslotKey, timeslot.day.toString()));
      });
    });
    setTimeslotGroups(responseGroups);
    setTimeslot(responseTimeslots);
  };

  const buildDataTimeslots = () => {
    const _timeslots: any = [];
    timeslots.forEach(key => {
      if (daysValue.get(key)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        daysValue.get(key).forEach((day: any) => {
          _timeslots.push({
            day: day.value,
            start: startTime.get(key),
            end: endTime.get(key)
          });
        });
      }
    });
    return _timeslots;
  };

  const addTimeslotGroup = async () => {
    const dataTimeslots = buildDataTimeslots();
    console.log(dataTimeslots);
    await axios({
      url: "http://127.0.0.1:8000/notificationprofiles/timeslotgroups/",
      method: "POST",
      headers: {
        Authorization: "Token " + localStorage.getItem("token")
      },
      // eslint-disable-next-line @typescript-eslint/camelcase
      data: { name: nameField, time_slots: dataTimeslots }
    }).then(() => {
      //getTimeslotGroup();
    });
  };

  const deleteTimeslotGroup = async () => {
    await axios({});
  };

  const handleStartTimeChange = (value: any, key: string) => {
    setStartTime(updateStateMap(startTime, value, key));
  };
  const handleEndTimeChange = (value: any, key: string) => {
    setEndTime(updateStateMap(endTime, value, key));
  };
  const handleDayChange = (value: any, key: string) => {
    setDaysValue(updateStateMap(daysValue, value, key));
  };

  const updateStateMap = (data: any, newValue: any, id: string) => {
    const newStateMap = new Map();
    data.forEach((value: any, key: any) => {
      if (key !== id) {
        newStateMap.set(key, value);
      } else {
        newStateMap.set(key, newValue);
      }
    });
    return newStateMap;
  };

  const addTimeslot = (groupKey: any) => {
    const key = uuidv1();
    const initialStartTime = "07:30";
    const initialEndTime = "16:30";

    const newTimeslots = [...timeslots, key];
    setTimeslot(newTimeslots);
    timeslotGroups.forEach(group => {
      if (group) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        group.get(groupKey).push(key);
      }
    });
    setStartTime(startTime.set(key, initialStartTime));
    setEndTime(endTime.set(key, initialEndTime));
    setDaysValue(daysValue.set(key, []));
  };

  const deleteTimeslot = (event: any, key: string) => {
    const newTimeslots = [...timeslots];
    newTimeslots.splice(newTimeslots.indexOf(key), 1);
    setTimeslot(newTimeslots);
  };
  const handleNameChange = (value: any, key: string) => {
    setNameField((nameField[key] = value));
  };

  return (
    <div>
      <h1>Timeslots: </h1>
      {timeslotGroups.map((element: any) => {
        const key = element.keys().next().value;
        return (
          <TimeslotGroup
            key={key}
            groupKey={key}
            groupName={nameField[key]}
            saveTimeslotGroup={addTimeslotGroup}
            timeslots={timeslots}
            timeslotGroups={timeslotGroups}
            handleStartTimeChange={handleStartTimeChange}
            handleEndTimeChange={handleEndTimeChange}
            handleDayChange={handleDayChange}
            startTime={startTime}
            endTime={endTime}
            daysValue={daysValue}
            addTimeslot={addTimeslot}
            deleteTimeslot={deleteTimeslot}
            handleNameChange={handleNameChange}
            deleteTimeslotGroup={deleteTimeslotGroup}
          />
        );
      })}
    </div>
  );
};

export default Timeslots;
