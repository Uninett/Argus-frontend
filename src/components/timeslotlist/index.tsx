import React, { useState, useEffect } from "react";

import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

import TimeslotComponent from "../timeslot/index";
import { TimeslotIntervalDay } from "../timeslotdayselector";

import { toMap, removeUndefined } from "../../utils";

import api, {
  defaultErrorHandler,
  TimeslotPK,
  Timeslot,
  TimeInterval,
  TimeIntervalDay,
  TIME_INTERVAL_DAY_IN_ORDER,
  TimeIntervalDayNameMap,
} from "../../api";
import { useApiTimeslots } from "../../api/hooks";
import { debuglog, dateFromTimeOfDayString } from "../../utils";

import {
  useAlertSnackbar,
  UseAlertSnackbarResultType,
  AlertSnackbarState,
  AlertSnackbarSeverity,
} from "../../components/alertsnackbar";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    timeslot: {
      alignItems: "center",
      padding: theme.spacing(3),
    },
  }),
);

// Used internally in this file
type InternalTimeslot = {
  days: Partial<Record<TimeIntervalDay, TimeslotIntervalDay>>;
  pk: Timeslot["pk"];
  name: Timeslot["name"];

  revision?: number;
};

type TimeslotListPropsType = {};

const TimeslotList: React.FC<TimeslotListPropsType> = () => {
  const classes = useStyles();

  const [{ result: timeslotsResponse }, setTimeslotsPromise] = useApiTimeslots(() => undefined)();

  useEffect(() => {
    setTimeslotsPromise(api.getAllTimeslots());
  }, [setTimeslotsPromise]);

  const [timeslots, setTimeslots] = useState<Map<TimeslotPK, InternalTimeslot>>(
    new Map<TimeslotPK, InternalTimeslot>(),
  );

  const newTimeslotDefault = { exists: false, pk: undefined };
  const [newTimeslot, setNewTimeslot] = useState<Partial<InternalTimeslot>>({ ...newTimeslotDefault });

  const [unsavedTimeslots, setUnsavedTimeslots] = useState<Set<TimeslotPK>>(new Set());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [alertSnackbar, alertSnackbarState, setAlertSnackbarState]: UseAlertSnackbarResultType = useAlertSnackbar();

  function displaySnackbar(message: string, severity?: AlertSnackbarSeverity) {
    debuglog(`Displaying message with severity ${severity}: ${message}`);
    setAlertSnackbarState((state: AlertSnackbarState) => {
      return { ...state, open: true, message, severity: severity || "success" };
    });
  }

  const responseToInternalTimeslot = (timeslot: Timeslot): InternalTimeslot => {
    const days: Partial<Record<TimeIntervalDay, TimeslotIntervalDay>> = {};
    for (const interval of timeslot.time_intervals) {
      const startTime = dateFromTimeOfDayString(interval.start);
      const endTime = dateFromTimeOfDayString(interval.end);
      const allDay = false;

      days[interval.day] = {
        pk: interval.day,
        name: TimeIntervalDayNameMap[interval.day],
        startTime,
        endTime,
        allDay,
      };
    }

    return {
      days,
      pk: timeslot.pk,
      name: timeslot.name,
    };
  };

  const dateTimeToTimeOfDay = (date: Date): string => {
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  };

  const timeslotIntervalDayToTimeInterval = (interval: TimeslotIntervalDay): TimeInterval => {
    const start = (!interval.allDay && interval.startTime && dateTimeToTimeOfDay(interval.startTime)) || "0:0:0";
    const end = (!interval.allDay && interval.endTime && dateTimeToTimeOfDay(interval.endTime)) || "23:59:59:999999";

    return {
      day: interval.pk,
      start,
      end,
    };
  };

  const daysToTimeInterval = (days: Partial<Record<TimeIntervalDay, TimeslotIntervalDay>>): TimeInterval[] => {
    return removeUndefined(
      TIME_INTERVAL_DAY_IN_ORDER.map((day: TimeIntervalDay): TimeInterval | undefined => {
        const intervalDay = days[day];
        return intervalDay && timeslotIntervalDayToTimeInterval(intervalDay);
      }),
    );
  };

  // TODO: use memo?
  useEffect(() => {
    if (!timeslotsResponse) return;

    // map to internal types
    const mappedTimeslots = [...timeslotsResponse.values()].map(responseToInternalTimeslot);
    setTimeslots(toMap<TimeslotPK, InternalTimeslot>(mappedTimeslots, (timeslot: InternalTimeslot) => timeslot.pk));
  }, [timeslotsResponse]);

  const resetNewTimeslot = () => {
    setNewTimeslot((timeslot: Partial<InternalTimeslot>) => {
      return { ...timeslot, revision: (timeslot.revision || 0) + 1 };
    });
  };

  const updateSavedTimeslot = (
    pk: TimeslotPK,
    name: string,
    days: Partial<Record<TimeIntervalDay, TimeslotIntervalDay>>,
  ) => {
    api
      .putTimeslot(pk, name, daysToTimeInterval(days))
      .then((newTimeslot: Timeslot) => {
        // Special case: handle when the save function failes.
        if (unsavedTimeslots.has(pk)) {
          setUnsavedTimeslots((unsavedProfiles: Set<TimeslotPK>) => {
            const newSet = new Set<TimeslotPK>(unsavedProfiles);
            newSet.delete(pk);
            return newSet;
          });
        }

        setTimeslots((timeslots: Map<TimeslotPK, InternalTimeslot>) => {
          const newTimeslots = new Map<TimeslotPK, InternalTimeslot>(timeslots);
          const revisedTimeslot: InternalTimeslot | undefined = timeslots.get(pk);
          newTimeslots.set(pk, {
            ...responseToInternalTimeslot(newTimeslot),
            revision: (revisedTimeslot?.revision || 0) + 1,
          });
          return newTimeslots;
        });
        displaySnackbar(`Updated timeslot: ${name}`, "success");
      })
      .catch(
        defaultErrorHandler((msg: string) => {
          displaySnackbar(msg, "error");

          // Special case: handle when the update function failes.
          setUnsavedTimeslots((unsavedTimeslots: Set<TimeslotPK>) => {
            const newSet = new Set<TimeslotPK>(unsavedTimeslots);
            newSet.add(pk);
            return newSet;
          });
        }),
      );
  };

  const createNewTimeslot = (name: string, days: Partial<Record<TimeIntervalDay, TimeslotIntervalDay>>) => {
    api
      .postTimeslot(name, daysToTimeInterval(days))
      .then((newTimeslot: Timeslot) => {
        resetNewTimeslot();
        setTimeslots((timeslots: Map<TimeslotPK, InternalTimeslot>) => {
          const newTimeslots = new Map<TimeslotPK, InternalTimeslot>(timeslots);
          newTimeslots.set(newTimeslot.pk, { ...responseToInternalTimeslot(newTimeslot), revision: 1 });
          return newTimeslots;
        });
        displaySnackbar(`Created new timeslot: ${newTimeslot.name}`, "success");
      })
      .catch(
        defaultErrorHandler((msg: string) => {
          displaySnackbar(msg, "error");
        }),
      );
  };

  const deleteSavedTimeslot = (pk: TimeslotPK, name: string) => {
    api
      .deleteTimeslot(pk)
      .then(() => {
        setTimeslots((timeslots: Map<TimeslotPK, InternalTimeslot>) => {
          const newTimeslots = new Map<TimeslotPK, InternalTimeslot>(timeslots);
          newTimeslots.delete(pk);
          return newTimeslots;
        });
        displaySnackbar(`Deleted timeslot: ${name}`, "warning");
      })
      .catch(
        defaultErrorHandler((msg: string) => {
          displaySnackbar(msg, "error");
        }),
      );
  };

  const onSave = (
    pk: TimeslotPK | undefined,
    name: string,
    days: Partial<Record<TimeIntervalDay, TimeslotIntervalDay>>,
  ) => {
    if (pk) {
      updateSavedTimeslot(pk, name, days);
    } else createNewTimeslot(name, days);
  };

  const onDelete = (pk: TimeslotPK | undefined, name: string) => {
    if (pk) {
      deleteSavedTimeslot(pk, name);
    } else {
      resetNewTimeslot();
    }
  };

  const newTimeslotComponent = newTimeslot && (
    <TimeslotComponent
      key={`newtimeslot-${newTimeslot.revision}`}
      pk={newTimeslot.pk}
      name={newTimeslot.name}
      days={{ ...(newTimeslot.days || {}) }}
      onSave={onSave}
      onDelete={onDelete}
      unsavedChanges={false}
    />
  );

  return (
    <div className={classes.root}>
      {alertSnackbar}
      <Grid key="new-timeslot-grid-item" item xs={12} className={classes.timeslot}>
        <Typography>Create new timeslot</Typography>
        {newTimeslotComponent}
      </Grid>
      {[...timeslots.values()].map((timeslot: InternalTimeslot) => {
        return (
          <Grid key={`${timeslot.pk}-grid-item`} item xs={12} className={classes.timeslot}>
            <TimeslotComponent
              exists
              key={`key-${timeslot.pk}-${timeslot.revision}`}
              pk={timeslot.pk}
              name={timeslot.name}
              days={timeslot.days}
              onSave={onSave}
              onDelete={onDelete}
              unsavedChanges={false}
            />{" "}
          </Grid>
        );
      })}
    </div>
  );
};

export default TimeslotList;
