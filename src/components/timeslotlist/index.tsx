import React, { useState, useEffect, useMemo } from "react";

import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Divider from "@material-ui/core/Divider";

import TimeslotComponent, { DEFAULT_TIMESLOT_RECURRENCE } from "../timeslot";
import { toMap } from "../../utils";

import api, { defaultErrorHandler, TimeslotPK, Timeslot, TimeRecurrence } from "../../api";
import { useApiTimeslots } from "../../api/hooks";

import { useAlertSnackbar, UseAlertSnackbarResultType } from "../../components/alertsnackbar";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      alignItems: "center",
    },
    timeslot: {
      alignItems: "center",
      padding: theme.spacing(3),
      margin: "auto",
      maxWidth: "1000px",
    },
    createNewButton: {
      justifyItems: "center",
      transform: "translate(-50%, -50%)",
      margin: 0,
      left: "50%",
      right: "50%",
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

  useEffect(() => {
    setTimeslotsPromise(api.getAllTimeslots());
  }, [setTimeslotsPromise]);

  const [timeslots, setTimeslots] = useState<Map<TimeslotPK, InternalTimeslot>>(
    new Map<TimeslotPK, InternalTimeslot>(),
  );

  const newTimeslotDefault = { exists: false, pk: undefined };
  const [newTimeslot, setNewTimeslot] = useState<Partial<InternalTimeslot> | undefined>(undefined);

  const [unsavedTimeslots, setUnsavedTimeslots] = useState<Set<TimeslotPK>>(new Set());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { incidentSnackbar, displayAlertSnackbar }: UseAlertSnackbarResultType = useAlertSnackbar();

  // TODO: remove
  const responseToInternalTimeslot = (timeslot: Timeslot): InternalTimeslot => {
    return timeslot;
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
    setNewTimeslot((timeslot: Partial<InternalTimeslot> | undefined) => {
      return { ...timeslot, revision: (timeslot?.revision || 0) + 1 };
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
        // resetNewTimeslot();
        setTimeslots((timeslots: Map<TimeslotPK, InternalTimeslot>) => {
          const newTimeslots = new Map<TimeslotPK, InternalTimeslot>(timeslots);
          newTimeslots.set(newTimeslot.pk, { ...responseToInternalTimeslot(newTimeslot), revision: 1 });
          return newTimeslots;
        });
        displayAlertSnackbar(`Created new timeslot: ${newTimeslot.name}`, "success");
        setNewTimeslot(undefined);
      })
      .catch(
        defaultErrorHandler((msg: string) => {
          resetNewTimeslot(); // FIXME: This is required to re-enable the save buttons
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
    <Box borderRadius={8} bgcolor="primary.main" color="primary.contrastText" p={1}>
      <TimeslotComponent
        key={`newtimeslot-${newTimeslot.revision}`}
        pk={newTimeslot.pk}
        name={newTimeslot.name}
        recurrences={[DEFAULT_TIMESLOT_RECURRENCE]}
        unsavedChanges={true}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </Box>
  );

  return (
    <div className={classes.root}>
      {incidentSnackbar}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Your timeslots
          </Typography>
          <Grid key="new-timeslot-grid-item" item className={classes.timeslot}>
            {(newTimeslotComponent && newTimeslotComponent) || (
              <Grid item>
                <Button
                  className={classes.createNewButton}
                  variant="contained"
                  color="primary"
                  onClick={() => resetNewTimeslot()}
                >
                  Add new timeslot
                </Button>
              </Grid>
            )}
          </Grid>

          {[...timeslots.values()].map((timeslot: InternalTimeslot) => {
            return (
              <Grid key={`${timeslot.pk}-${timeslot.revision}-grid-item`} item className={classes.timeslot}>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeslotList;
