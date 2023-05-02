import React, { useState, useEffect, useMemo } from "react";

import './timeslotlist.css';

import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

import TimeslotComponent from "../timeslot";
import { toMap } from "../../utils";

import type { TimeslotPK, Timeslot, TimeRecurrence } from "../../api/types.d";
import api from "../../api";
import { defaultErrorHandler } from "../../api/utils";
import { useApiTimeslots } from "../../api/hooks";

import { useAlertSnackbar, UseAlertSnackbarResultType } from "../../components/alertsnackbar";
import {Button} from "@material-ui/core";
import {Create, UnfoldLess} from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "column",
      flexGrow: 1,
      maxWidth: "900px",
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    timeslot: {
      alignSelf: "stretch",
      alignItems: "center",
      padding: theme.spacing(3),
    },
  }),
);

// Used internally in this file
type InternalTimeslot = Timeslot & {
  revision?: number;
};

type TimeslotListPropsType = {};

const TimeslotList: React.FC<TimeslotListPropsType> = () => {
  const classes = useStyles();

  const [{ result: timeslotsResponse, error: timeslotsIsError }, setTimeslotsPromise] = useApiTimeslots(
    () => undefined,
  )();

  const [isHiddenNewTimeslotForm, setIsHiddenNewTimeslotForm] = useState<boolean | null>(null);

  useEffect(() => {
    setTimeslotsPromise(api.getAllTimeslots());
  }, [setTimeslotsPromise]);

  const [timeslots, setTimeslots] = useState<Map<TimeslotPK, InternalTimeslot>>(
    new Map<TimeslotPK, InternalTimeslot>(),
  );

  const newTimeslotDefault: Partial<InternalTimeslot> = {
    pk: undefined,
    // eslint-disable-next-line
    time_recurrences: [{ days: [1, 2, 3, 4, 5], start: "08:00:00", end: "16:00:00", all_day: false }],
  };
  const [newTimeslot, setNewTimeslot] = useState<Partial<InternalTimeslot>>({ ...newTimeslotDefault });

  const [unsavedTimeslots, setUnsavedTimeslots] = useState<Set<TimeslotPK>>(new Set());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { incidentSnackbar, displayAlertSnackbar }: UseAlertSnackbarResultType = useAlertSnackbar();

  const responseToInternalTimeslot = (timeslot: Timeslot): InternalTimeslot => {
    return timeslot;
  };

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

  const updateSavedTimeslot = (pk: TimeslotPK, name: string, recurrences: TimeRecurrence[]) => {
    api
      .putTimeslot(pk, name, recurrences)
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

  const createNewTimeslot = (name: string, recurrences: TimeRecurrence[]) => {
    api
      .postTimeslot(name, recurrences)
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
          resetNewTimeslot();
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

  const handleSave = (pk: TimeslotPK | undefined, name: string, recurrences: TimeRecurrence[]) => {
    if (pk) {
      updateSavedTimeslot(pk, name, recurrences);
      return;
    }
    createNewTimeslot(name, recurrences);
  };

  const handleDelete = (pk: TimeslotPK | undefined, name: string) => {
    if (pk) {
      deleteSavedTimeslot(pk, name);
      return;
    }
    resetNewTimeslot();
  };

  const newTimeslotComponent = newTimeslot && (
    <TimeslotComponent
      key={`newtimeslot-${newTimeslot.revision}`}
      pk={newTimeslot.pk}
      name={newTimeslot.name}
      // eslint-disable-next-line
      recurrences={newTimeslot?.time_recurrences || []}
      unsavedChanges={true}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );

  return (
    <div className={`${classes.root} root`}>
      {incidentSnackbar}
      <div className="new-timeslot-button" hidden>
        <Button
            variant="contained"
            onClick={(event) => {
                if (isHiddenNewTimeslotForm || isHiddenNewTimeslotForm === null) {
                    // @ts-ignore
                    document.querySelector(".new-timeslot").style.display = "block";
                    setIsHiddenNewTimeslotForm(false);
                } else {
                    // @ts-ignore
                    document.querySelector(".new-timeslot").style.display = "none";
                    setIsHiddenNewTimeslotForm(true);
                }
            }}
        >
            {isHiddenNewTimeslotForm || isHiddenNewTimeslotForm === null ? <Create /> : <UnfoldLess />}
        </Button>
      </div>

      <Grid key="new-timeslot-grid-item" item xs={12} className={`${classes.timeslot} timeslot new-timeslot`}>
        <Typography className="new-timeslot-paragraph">Create new timeslot</Typography>
        {newTimeslotComponent}
      </Grid>
      {[...timeslots.values()].map((timeslot: InternalTimeslot) => {
        return (
          <Grid key={`${timeslot.pk}-${timeslot.revision}-grid-item`} item xs={12} className={`${classes.timeslot} timeslot`}>
            <TimeslotComponent
              exists
              revision={timeslot.revision}
              pk={timeslot.pk}
              name={timeslot.name}
              recurrences={timeslot.time_recurrences}
              onSave={handleSave}
              onDelete={handleDelete}
              unsavedChanges={false}
            />
          </Grid>
        );
      })}
    </div>
  );
};

export default TimeslotList;
