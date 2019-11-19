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

  const [groupPK, setGroupPK] = useState(new Map());

  const [nameField, setNameField] = useState<any>(
    new Map([[initialTimeslotGroupKey, ""]])
  );
  const [startTime, setStartTime] = useState(
    new Map([[initialTimeslotKey, "07:30"]])
  );
  const [endTime, setEndTime] = useState(
    new Map([[initialTimeslotKey, "16:30"]])
  );
  const [daysValue, setDaysValue] = useState<any>(
    new Map([[initialTimeslotKey, []]])
  );

  useEffect(() => {
    getTimeslotGroup(true, initialTimeslotGroupKey, initialTimeslotKey);
  }, []);

  const getTimeslotGroup = async (
    firstTime: boolean,
    inputGroupKey: string,
    inputSlotKey: string
  ) => {
    await axios({
      url: "http://127.0.0.1:8000/notificationprofiles/timeslotgroups/",
      method: "GET",
      headers: {
        Authorization: "Token " + localStorage.getItem("token")
      }
    }).then((response: any) => {
      buildTimeslotGroups(
        response.data,
        firstTime,
        inputGroupKey,
        inputSlotKey
      );
    });
  };

  const deleteTimeslotGroup = async (key: string) => {
    await axios({
      url:
        "http://127.0.0.1:8000/notificationprofiles/timeslotgroups/" +
        groupPK.get(key),
      method: "DELETE",
      headers: {
        Authorization: "Token " + localStorage.getItem("token")
      }
    }).then(() => {
      const newGroups = [...timeslotGroups];
      let groupMap: any;
      timeslotGroups.forEach(group => {
        if (group.has(key)) groupMap = group;
      });
      newGroups.splice(newGroups.indexOf(groupMap), 1);
      setTimeslotGroups(newGroups);
    });
  };

  const buildTimeslotGroups = (
    data: any,
    firstTime: boolean,
    inputGroupKey: string,
    inputSlotKey: string
  ) => {
    let responseGroups: any = [new Map([[inputGroupKey, [inputSlotKey]]])];
    let responseTimeslots: any = [inputSlotKey];
    if (firstTime) {
      responseGroups = [...timeslotGroups];
      responseTimeslots = [...timeslots];
    }
    if (data) {
      data.forEach((group: any) => {
        const groupKey = uuidv1();
        const serverBoolean = fromServer;
        serverBoolean.set(groupKey, true);
        setFromServer(serverBoolean);
        setNameField(nameField.set(groupKey, group.name.toString()));
        setGroupPK(groupPK.set(groupKey, group.pk));
        responseGroups.push(new Map([[groupKey, []]]));
        group.time_slots.forEach((timeslot: any) => {
          const timeslotKey = uuidv1();
          responseTimeslots.push(timeslotKey);
          responseGroups.forEach((groupMap: any) => {
            if (groupMap.has(groupKey)) {
              const groupTimeslots = groupMap.get(groupKey);
              groupTimeslots.push(timeslotKey);
              groupMap.set(groupKey, groupTimeslots);
            }
          });
          setStartTime(startTime.set(timeslotKey, timeslot.start.toString()));
          setEndTime(endTime.set(timeslotKey, timeslot.end.toString()));
          setDaysValue(
            daysValue.set(timeslotKey, convertDay(timeslot.day.toString()))
          );
        });
      });
    }
    setTimeslotGroups(responseGroups);
    setTimeslot(responseTimeslots);
  };

  const convertDay = (day: any) => {
    switch (day) {
      case "MO":
        return [{ value: "MO", label: "Monday" }];
      case "TU":
        return [{ value: "TU", label: "Tuesday" }];
      case "WE":
        return [{ value: "WE", label: "Wednesday" }];
      case "TH":
        return [{ value: "TH", label: "Thursday" }];
      case "FR":
        return [{ value: "FR", label: "Friday" }];
      case "SA":
        return [{ value: "SA", label: "Saturday" }];
      case "SU":
        return [{ value: "SU", label: "Sunday" }];
      default:
        return undefined;
    }
  };

  const buildDataTimeslots = (groupKey: any) => {
    const _timeslots: any = [];
    const groupSlots: any = [];
    timeslotGroups.forEach((group: any) => {
      if (group.has(groupKey)) groupSlots.push(...group.get(groupKey));
    });
    groupSlots.forEach((key: any) => {
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

  const addTimeslotGroup = async (groupKey: any) => {
    const dataTimeslots = buildDataTimeslots(groupKey);
    if (fromServer.get(groupKey)) {
      await axios({
        url:
          "http://127.0.0.1:8000/notificationprofiles/timeslotgroups/" +
          groupPK.get(groupKey),
        method: "PUT",
        headers: {
          Authorization: "Token " + localStorage.getItem("token")
        },
        // eslint-disable-next-line @typescript-eslint/camelcase
        data: { name: nameField.get(groupKey), time_slots: dataTimeslots }
      });
    } else {
      await axios({
        url: "http://127.0.0.1:8000/notificationprofiles/timeslotgroups/",
        method: "POST",
        headers: {
          Authorization: "Token " + localStorage.getItem("token")
        },
        // eslint-disable-next-line @typescript-eslint/camelcase
        data: { name: nameField.get(groupKey), time_slots: dataTimeslots }
      }).then(() => {
        const groupKey = uuidv1();
        const timeslotKey = uuidv1();
        resetView(groupKey, timeslotKey);
        getTimeslotGroup(false, groupKey, timeslotKey);
      });
    }
  };

  const resetView = (groupKey: string, timeslotKey: string) => {
    const serverBoolean = fromServer;
    serverBoolean.set(groupKey, false);
    setFromServer(serverBoolean);

    setNameField(nameField.set(groupKey, ""));
    setStartTime(startTime.set(timeslotKey, "07:30"));
    setEndTime(endTime.set(timeslotKey, "16:30"));
    setDaysValue(daysValue.set(timeslotKey, []));
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

  const handleNameChange = (value: any, key: string) => {
    setNameField(updateStateMap(nameField, value, key));
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
        if (group.has(groupKey)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          group.get(groupKey).push(key);
        }
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

  return (
    <div>
      <h1>Timeslots: </h1>
      {timeslotGroups.map((element: any) => {
        const key = element.keys().next().value;
        return (
          <TimeslotGroup
            key={key}
            groupKey={key}
            groupName={nameField.get(key)}
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
