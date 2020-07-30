import React, { useState, useEffect, useMemo } from "react";

import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

import TimeslotComponent from "../timeslot/index";
import { TimeslotRecurrenceDay } from "../timeslotdayselector";

import { toMap, removeUndefined } from "../../utils";

import api, {
  defaultErrorHandler,
  TimeslotPK,
  Timeslot,
  TimeRecurrence,
  TimeRecurrenceDay,
  TIME_RECURRENCE_DAY_IN_ORDER,
  TimeRecurrenceDayNameMap,
} from "../../api";
import { useApiTimeslots } from "../../api/hooks";
import { dateFromTimeOfDayString } from "../../utils";

import { useAlertSnackbar, UseAlertSnackbarResultType } from "../../components/alertsnackbar";

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
  days: Partial<Record<TimeRecurrenceDay, TimeslotRecurrenceDay>>;
  pk: Timeslot["pk"];
  name: Timeslot["name"];

  revision?: number;
};

type TimeslotListPropsType = {};

const TimeslotList: React.FC<TimeslotListPropsType> = () => {
  const classes = useStyles();

  const [{ result: timeslotsResponse, error: timeslotsIsError }, setTimeslotsPromise] = useApiTimeslots(
    () => undefined,
  )();

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
  const { incidentSnackbar, displayAlertSnackbar }: UseAlertSnackbarResultType = useAlertSnackbar();

  const responseToInternalTimeslot = (timeslot: Timeslot): InternalTimeslot => {
    const days: Partial<Record<TimeRecurrenceDay, TimeslotRecurrenceDay>> = {};
    for (const interval of timeslot.time_recurrences) {
      const startTime = dateFromTimeOfDayString(interval.start);
      const endTime = dateFromTimeOfDayString(interval.end);
      const allDay = false;

      // FIXME: only cares about the first day.
      days[interval.days[0]] = {
        pk: interval.days[0],
        name: TimeRecurrenceDayNameMap[interval.days[0]],
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

  const timeslotIntervalDayToTimeInterval = (interval: TimeslotRecurrenceDay): TimeRecurrence => {
    const start = (!interval.allDay && interval.startTime && dateTimeToTimeOfDay(interval.startTime)) || "0:0:0";
    const end = (!interval.allDay && interval.endTime && dateTimeToTimeOfDay(interval.endTime)) || "23:59:59:999999";

    return {
      days: [interval.pk],
      start,
      end,
    };
  };

  const daysToTimeInterval = (days: Partial<Record<TimeRecurrenceDay, TimeslotRecurrenceDay>>): TimeRecurrence[] => {
    return removeUndefined(
      TIME_RECURRENCE_DAY_IN_ORDER.map((day: TimeRecurrenceDay): TimeRecurrence | undefined => {
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

  useMemo(() => {
    if (!timeslotsIsError) return;
    displayAlertSnackbar("Unable to fetch timeslots", "error");
  }, [timeslotsIsError, displayAlertSnackbar]);

  const resetNewTimeslot = () => {
    setNewTimeslot((timeslot: Partial<InternalTimeslot>) => {
      return { ...timeslot, revision: (timeslot.revision || 0) + 1 };
    });
  };

  const updateSavedTimeslot = (
    pk: TimeslotPK,
    name: string,
    days: Partial<Record<TimeRecurrenceDay, TimeslotRecurrenceDay>>,
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
        displayAlertSnackbar(`Updated timeslot: ${name}`, "success");
      })
      .catch(
        defaultErrorHandler((msg: string) => {
          displayAlertSnackbar(msg, "error");

          // Special case: handle when the update function failes.
          setUnsavedTimeslots((unsavedTimeslots: Set<TimeslotPK>) => {
            const newSet = new Set<TimeslotPK>(unsavedTimeslots);
            newSet.add(pk);
            return newSet;
          });
        }),
      );
  };

  const createNewTimeslot = (name: string, days: Partial<Record<TimeRecurrenceDay, TimeslotRecurrenceDay>>) => {
    api
      .postTimeslot(name, daysToTimeInterval(days))
      .then((newTimeslot: Timeslot) => {
        resetNewTimeslot();
        setTimeslots((timeslots: Map<TimeslotPK, InternalTimeslot>) => {
          const newTimeslots = new Map<TimeslotPK, InternalTimeslot>(timeslots);
          newTimeslots.set(newTimeslot.pk, { ...responseToInternalTimeslot(newTimeslot), revision: 1 });
          return newTimeslots;
        });
        displayAlertSnackbar(`Created new timeslot: ${newTimeslot.name}`, "success");
      })
      .catch(
        defaultErrorHandler((msg: string) => {
          displayAlertSnackbar(msg, "error");
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
        displayAlertSnackbar(`Deleted timeslot: ${name}`, "warning");
      })
      .catch(
        defaultErrorHandler((msg: string) => {
          displayAlertSnackbar(msg, "error");
        }),
      );
  };

  const onSave = (
    pk: TimeslotPK | undefined,
    name: string,
    days: Partial<Record<TimeRecurrenceDay, TimeslotRecurrenceDay>>,
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
      {incidentSnackbar}
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
