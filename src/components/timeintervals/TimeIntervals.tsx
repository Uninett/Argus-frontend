/* eslint-disable */
import React, { useEffect, useState } from "react";
import Timeslot from "../timeslot/Timeslot";
import api, { Timeslot as TimeslotType } from "../../api";

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

const TimeIntervals: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const uuidv1 = require("uuid/v1");
  const initialTimeslotKey = uuidv1();
  const initialTimeIntervalKey = uuidv1();
  const [timeslots, setTimeslots] = useState([new Map([[initialTimeslotKey, [initialTimeIntervalKey]]])]);
  const [timeIntervals, setTimeInterval] = useState([initialTimeIntervalKey]);
  const [fromServer, setFromServer] = useState(new Map([[initialTimeslotKey, false]]));

  const [timeslotPK, setTimeslotPK] = useState(new Map());

  const [nameField, setNameField] = useState<any>(new Map([[initialTimeslotKey, ""]]));
  const [startTime, setStartTime] = useState(new Map([[initialTimeIntervalKey, "07:30"]]));
  const [endTime, setEndTime] = useState(new Map([[initialTimeIntervalKey, "16:30"]]));
  const [daysValue, setDaysValue] = useState<any>(new Map([[initialTimeIntervalKey, []]]));

  const deleteTimeslot = async (key: string) => {
    api.deleteTimeslot(timeslotPK.get(key)).then((response: any) => {
      const newTimeslots = [...timeslots];
      let timeslotMap: any;
      timeslots.forEach((timeslot) => {
        if (timeslot.has(key)) timeslotMap = timeslot;
      });
      newTimeslots.splice(newTimeslots.indexOf(timeslotMap), 1);
      setTimeslots(newTimeslots);
    });
  };

  const buildTimeslots = (data: any, firstTime: boolean, inputTimeslotKey: string, inputTimeIntervalKey: string) => {
    let responseTimeslots: any = [new Map([[inputTimeslotKey, [inputTimeIntervalKey]]])];
    let responseTimeIntervals: any = [inputTimeIntervalKey];
    if (firstTime) {
      responseTimeslots = [...timeslots];
      responseTimeIntervals = [...timeIntervals];
    }
    if (data) {
      data.forEach((timeslot: any) => {
        const timeslotKey = uuidv1();
        const serverBoolean = fromServer;
        serverBoolean.set(timeslotKey, true);
        setFromServer(serverBoolean);
        setNameField(nameField.set(timeslotKey, timeslot.name.toString()));
        setTimeslotPK(timeslotPK.set(timeslotKey, timeslot.pk));
        responseTimeslots.push(new Map([[timeslotKey, []]]));
        timeslot.time_intervals.forEach((timeInterval: any) => {
          const timeIntervalKey = uuidv1();
          responseTimeIntervals.push(timeIntervalKey);
          responseTimeslots.forEach((timeslotMap: any) => {
            if (timeslotMap.has(timeslotKey)) {
              const timeIntervals = timeslotMap.get(timeslotKey);
              timeIntervals.push(timeIntervalKey);
              timeslotMap.set(timeslotKey, timeIntervals);
            }
          });
          setStartTime(startTime.set(timeIntervalKey, timeInterval.start.toString()));
          setEndTime(endTime.set(timeIntervalKey, timeInterval.end.toString().slice(0, 5)));
          setDaysValue(daysValue.set(timeIntervalKey, convertDay(timeInterval.day.toString())));
        });
      });
    }
    setTimeslots(responseTimeslots);
    setTimeInterval(responseTimeIntervals);
  };

  const getTimeslot = async (firstTime: boolean, inputTimeslotKey: string, inputTimeIntervalKey: string) => {
    api.getAllTimeslots().then((timeslots: TimeslotType[]) => {
      buildTimeslots(timeslots, firstTime, inputTimeslotKey, inputTimeIntervalKey);
    });
  };

  useEffect(() => {
    getTimeslot(true, initialTimeslotKey, initialTimeIntervalKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildDataTimeIntervals = (timeslotKey: any) => {
    const _timeIntervals: any = [];
    const timeslotIntervals: any = [];
    timeslots.forEach((timeslot: any) => {
      if (timeslot.has(timeslotKey)) timeslotIntervals.push(...timeslot.get(timeslotKey));
    });
    timeslotIntervals.forEach((key: any) => {
      if (daysValue.get(key)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        daysValue.get(key).forEach((day: any) => {
          _timeIntervals.push({
            day: day.value,
            start: startTime.get(key),
            end: endTime.get(key),
          });
        });
      }
    });
    return _timeIntervals;
  };

  const resetView = (timeslotKey: string, timeIntervalKey: string) => {
    const serverBoolean = fromServer;
    serverBoolean.set(timeslotKey, false);
    setFromServer(serverBoolean);

    setNameField(nameField.set(timeslotKey, ""));
    setStartTime(startTime.set(timeIntervalKey, "07:30"));
    setEndTime(endTime.set(timeIntervalKey, "16:30"));
    setDaysValue(daysValue.set(timeIntervalKey, []));
  };

  const addTimeslot = async (timeslotKey: any) => {
    const dataTimeIntervals = buildDataTimeIntervals(timeslotKey);
    if (fromServer.get(timeslotKey)) {
      await api.putTimeslot(timeslotPK.get(timeslotKey), nameField.get(timeslotKey), dataTimeIntervals);
    } else {
      await api.postTimeslot(nameField.get(timeslotKey), dataTimeIntervals).then(() => {
        const timeslotKey = uuidv1();
        const timeIntervalKey = uuidv1();
        resetView(timeslotKey, timeIntervalKey);
        getTimeslot(false, timeslotKey, timeIntervalKey);
      });
    }
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

  const addTimeInterval = (timeslotKey: any) => {
    const key = uuidv1();
    const initialStartTime = "07:30";
    const initialEndTime = "16:30";

    const newTimeIntervals = [...timeIntervals, key];
    setTimeInterval(newTimeIntervals);
    timeslots.forEach((timeslot) => {
      if (timeslot) {
        if (timeslot.has(timeslotKey)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          timeslot.get(timeslotKey).push(key);
        }
      }
    });
    setStartTime(startTime.set(key, initialStartTime));
    setEndTime(endTime.set(key, initialEndTime));
    setDaysValue(daysValue.set(key, []));
  };

  const deleteTimeInterval = (event: any, key: string) => {
    const newTimeIntervals = [...timeIntervals];
    newTimeIntervals.splice(newTimeIntervals.indexOf(key), 1);
    daysValue.delete(key);
    setDaysValue(daysValue);
    setTimeInterval(newTimeIntervals);
  };

  return (
    <div>
      <h1>Timeslots</h1>
      {timeslots.map((element: any) => {
        const key = element.keys().next().value;
        return (
          <Timeslot
            key={key}
            timeslotKey={key}
            timeslotName={nameField.get(key)}
            saveTimeslot={addTimeslot}
            timeIntervals={timeIntervals}
            timeslots={timeslots}
            handleStartTimeChange={handleStartTimeChange}
            handleEndTimeChange={handleEndTimeChange}
            handleDayChange={handleDayChange}
            startTime={startTime}
            endTime={endTime}
            daysValue={daysValue}
            addTimeInterval={addTimeInterval}
            deleteTimeInterval={deleteTimeInterval}
            handleNameChange={handleNameChange}
            deleteTimeslot={deleteTimeslot}
          />
        );
      })}
    </div>
  );
};

export default TimeIntervals;
