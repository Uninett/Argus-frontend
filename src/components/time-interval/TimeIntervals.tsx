import React, { useEffect, useState } from "react";
import TimeSlot from "../time-slot/TimeSlot";
import axios from "axios";

const TimeIntervals: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const uuidv1 = require("uuid/v1");
  const initialTimeSlotKey = uuidv1();
  const initialTimeIntervalKey = uuidv1();
  const [timeSlots, setTimeSlots] = useState([
    new Map([[initialTimeSlotKey, [initialTimeIntervalKey]]])
  ]);
  const [timeIntervals, setTimeInterval] = useState([initialTimeIntervalKey]);
  const [fromServer, setFromServer] = useState(
    new Map([[initialTimeSlotKey, false]])
  );

  const [timeSlotPK, setTimeSlotPK] = useState(new Map());

  const [nameField, setNameField] = useState<any>(
    new Map([[initialTimeSlotKey, ""]])
  );
  const [startTime, setStartTime] = useState(
    new Map([[initialTimeIntervalKey, "07:30"]])
  );
  const [endTime, setEndTime] = useState(
    new Map([[initialTimeIntervalKey, "16:30"]])
  );
  const [daysValue, setDaysValue] = useState<any>(
    new Map([[initialTimeIntervalKey, []]])
  );

  useEffect(() => {
    getTimeSlot(true, initialTimeSlotKey, initialTimeIntervalKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTimeSlot = async (
    firstTime: boolean,
    inputTimeSlotKey: string,
    inputTimeIntervalKey: string
  ) => {
    await axios({
      url: "/notificationprofiles/timeslots/",
      method: "GET",
      headers: {
        Authorization: "Token " + localStorage.getItem("token")
      }
    }).then((response: any) => {
      buildTimeSlots(
        response.data,
        firstTime,
        inputTimeSlotKey,
        inputTimeIntervalKey
      );
    });
  };

  const deleteTimeSlot = async (key: string) => {
    await axios({
      url:
        "/notificationprofiles/timeslots/" +
        timeSlotPK.get(key),
      method: "DELETE",
      headers: {
        Authorization: "Token " + localStorage.getItem("token")
      }
    }).then(() => {
      const newTimeSlots = [...timeSlots];
      let timeSlotMap: any;
      timeSlots.forEach(timeSlot => {
        if (timeSlot.has(key)) timeSlotMap = timeSlot;
      });
      newTimeSlots.splice(newTimeSlots.indexOf(timeSlotMap), 1);
      setTimeSlots(newTimeSlots);
    });
  };

  const buildTimeSlots = (
    data: any,
    firstTime: boolean,
    inputTimeSlotKey: string,
    inputTimeIntervalKey: string
  ) => {
    let responseTimeSlots: any = [new Map([[inputTimeSlotKey, [inputTimeIntervalKey]]])];
    let responseTimeIntervals: any = [inputTimeIntervalKey];
    if (firstTime) {
      responseTimeSlots = [...timeSlots];
      responseTimeIntervals = [...timeIntervals];
    }
    if (data) {
      data.forEach((timeSlot: any) => {
        const timeSlotKey = uuidv1();
        const serverBoolean = fromServer;
        serverBoolean.set(timeSlotKey, true);
        setFromServer(serverBoolean);
        setNameField(nameField.set(timeSlotKey, timeSlot.name.toString()));
        setTimeSlotPK(timeSlotPK.set(timeSlotKey, timeSlot.pk));
        responseTimeSlots.push(new Map([[timeSlotKey, []]]));
        timeSlot.time_intervals.forEach((timeInterval: any) => {
          const timeIntervalKey = uuidv1();
          responseTimeIntervals.push(timeIntervalKey);
          responseTimeSlots.forEach((timeSlotMap: any) => {
            if (timeSlotMap.has(timeSlotKey)) {
              const timeIntervals = timeSlotMap.get(timeSlotKey);
              timeIntervals.push(timeIntervalKey);
              timeSlotMap.set(timeSlotKey, timeIntervals);
            }
          });
          setStartTime(startTime.set(timeIntervalKey, timeInterval.start.toString()));
          setEndTime(endTime.set(timeIntervalKey, timeInterval.end.toString().slice(0, 5)));
          setDaysValue(
            daysValue.set(timeIntervalKey, convertDay(timeInterval.day.toString()))
          );
        });
      });
    }
    setTimeSlots(responseTimeSlots);
    setTimeInterval(responseTimeIntervals);
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

  const buildDataTimeIntervals = (timeSlotKey: any) => {
    const _timeIntervals: any = [];
    const timeSlotIntervals: any = [];
    timeSlots.forEach((timeSlot: any) => {
      if (timeSlot.has(timeSlotKey)) timeSlotIntervals.push(...timeSlot.get(timeSlotKey));
    });
    timeSlotIntervals.forEach((key: any) => {
      if (daysValue.get(key)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        daysValue.get(key).forEach((day: any) => {
          _timeIntervals.push({
            day: day.value,
            start: startTime.get(key),
            end: endTime.get(key)
          });
        });
      }
    });
    return _timeIntervals;
  };

  const addTimeSlot = async (timeSlotKey: any) => {
    const dataTimeIntervals = buildDataTimeIntervals(timeSlotKey);
    if (fromServer.get(timeSlotKey)) {
      await axios({
        url:
          "/notificationprofiles/timeslots/" +
          timeSlotPK.get(timeSlotKey),
        method: "PUT",
        headers: {
          Authorization: "Token " + localStorage.getItem("token")
        },
        // eslint-disable-next-line @typescript-eslint/camelcase
        data: { name: nameField.get(timeSlotKey), time_intervals: dataTimeIntervals }
      });
    } else {
      await axios({
        url: "/notificationprofiles/timeslots/",
        method: "POST",
        headers: {
          Authorization: "Token " + localStorage.getItem("token")
        },
        // eslint-disable-next-line @typescript-eslint/camelcase
        data: { name: nameField.get(timeSlotKey), time_intervals: dataTimeIntervals }
      }).then(() => {
        const timeSlotKey = uuidv1();
        const timeIntervalKey = uuidv1();
        resetView(timeSlotKey, timeIntervalKey);
        getTimeSlot(false, timeSlotKey, timeIntervalKey);
      });
    }
  };

  const resetView = (timeSlotKey: string, timeIntervalKey: string) => {
    const serverBoolean = fromServer;
    serverBoolean.set(timeSlotKey, false);
    setFromServer(serverBoolean);

    setNameField(nameField.set(timeSlotKey, ""));
    setStartTime(startTime.set(timeIntervalKey, "07:30"));
    setEndTime(endTime.set(timeIntervalKey, "16:30"));
    setDaysValue(daysValue.set(timeIntervalKey, []));
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

  const addTimeInterval = (timeSlotKey: any) => {
    const key = uuidv1();
    const initialStartTime = "07:30";
    const initialEndTime = "16:30";

    const newTimeIntervals = [...timeIntervals, key];
    setTimeInterval(newTimeIntervals);
    timeSlots.forEach(timeSlot => {
      if (timeSlot) {
        if (timeSlot.has(timeSlotKey)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          timeSlot.get(timeSlotKey).push(key);
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
      <h1>Time slots</h1>
      {timeSlots.map((element: any) => {
        const key = element.keys().next().value;
        return (
          <TimeSlot
            key={key}
            timeSlotKey={key}
            timeSlotName={nameField.get(key)}
            saveTimeSlot={addTimeSlot}
            timeIntervals={timeIntervals}
            timeSlots={timeSlots}
            handleStartTimeChange={handleStartTimeChange}
            handleEndTimeChange={handleEndTimeChange}
            handleDayChange={handleDayChange}
            startTime={startTime}
            endTime={endTime}
            daysValue={daysValue}
            addTimeInterval={addTimeInterval}
            deleteTimeInterval={deleteTimeInterval}
            handleNameChange={handleNameChange}
            deleteTimeSlot={deleteTimeSlot}
          />
        );
      })}
    </div>
  );
};

export default TimeIntervals;
