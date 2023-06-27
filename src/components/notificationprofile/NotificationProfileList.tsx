import React, { useState, useEffect } from "react";

import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import { createStyles, makeStyles } from "@material-ui/core/styles";

import Modal from "../modal/Modal";
import NotificationProfileCard from "./NotificationProfileCard";
import { useAlerts } from "../alertsnackbar";

import api from "../../api";

import type {
  NotificationProfile,
  NotificationProfileKeyed,
  Filter,
  Timeslot,
  Media,
  Destination,
} from "../../api/types";
import { useDestinations } from "../../state/hooks";
import AddDestinationDialog from "./AddDestinationDialog";
import { NewDestination } from "../../api/types";

const useStyles = makeStyles(() =>
  createStyles({
    header: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    headerText: {
      marginTop: "10px",
      marginBottom: "10px",
    },
    loadingText: {
      marginTop: "30px",
    },
    createProfileButton: {
      marginLeft: "auto",
    },
    noProfilesCard: {
      marginTop: "10px",
      padding: "20px",
    },
  }),
);

const NotificationProfileList = () => {
  const style = useStyles();

  // Create alert instance
  const displayAlert = useAlerts();

  // State
  const [
    { configuredMedia, destinations },
    { fetchConfiguredMedia, loadDestinations, createDestination },
  ] = useDestinations();

  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [profiles, setProfiles] = useState<NotificationProfileKeyed[]>([]);

  const [createProfileVisible, setCreateProfileVisible] = useState<boolean>(false);
  const [noAvailableTimeslotsDialogOpen, setNoAvailableTimeslotsDialogOpen] = useState<boolean>(false);
  const [addDestinationDialogOpen, setAddDestinationDialogOpen] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Function for converting NotificationProfile to a keyed object (NotificationProfileKeyed)
  const profileToKeyed = (profile: NotificationProfile): NotificationProfileKeyed => {
    return {
      timeslot: profile.timeslot.pk,
      filters: profile.filters.map((filter: Filter) => filter.pk),
      active: profile.active,
      // eslint-disable-next-line
      destinations: profile.destinations ? profile.destinations : null,
      pk: profile.pk,
    };
  };

  const fetchAllDestinations = () => {
    api
      .getAllDestinations()
      .then((res: Destination[]) => {
        loadDestinations(res);
      })
      .catch((error) => {
        displayAlert(error.message, "error");
        setIsLoading(false);
      });
  };

  // On known media types update
  useEffect(() => {
    fetchAllDestinations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuredMedia, destinations]);

  // Fetch data from API on mount
  useEffect(() => {
    Promise.all([api.getAllTimeslots(), api.getAllFilters(), api.getAllNotificationProfiles(), api.getAllMedia(), api.getAllDestinations()])
      .then(([timeslotResponse, filterResponse, profileResponse, mediaResponse, destinationsResponse]) => {
        // Convert response to keyed profile
        const keyedProfileResponse = profileResponse.map((profile) => profileToKeyed(profile));

        // Populate destinations global state
        fetchConfiguredMedia(mediaResponse);
        loadDestinations(destinationsResponse);

        setTimeslots(timeslotResponse);
        setFilters(filterResponse);
        setProfiles(keyedProfileResponse);
        setIsLoading(false);
      })
      .catch((error) => {
        displayAlert(error.message, "error");
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayAlert]);

  // Action handlers
  const handleCreate = (profile: NotificationProfileKeyed) => {
    api
      .postNotificationProfile(
        profile.timeslot,
        profile.filters,
        profile.active,
        profile.destinations?.map((d) => d.pk),
      )
      .then((newProfile) => {
        // Add the new notification profile to the list
        const newProfileKeyed = profileToKeyed(newProfile);
        setProfiles([...profiles, newProfileKeyed]);

        setCreateProfileVisible(false);
        displayAlert("Notification profile successfully created", "success");
      })
      .catch((error: Error) => {
        displayAlert(error.message, "error");
      });
  };

  const handleSave = (profile: NotificationProfileKeyed) => {
    if (profile.pk) {
      api
        .putNotificationProfile(
          profile.pk,
          profile.timeslot,
          profile.filters,
          profile.active,
          profile.destinations?.map((d) => d.pk),
        )
        .then(() => displayAlert("Notification profile successfully updated", "success"))
        .catch((error: Error) => displayAlert(error.message, "error"));
    }
  };

  const handleDelete = (profile: NotificationProfileKeyed) => {
    if (profile.pk) {
      api
        .deleteNotificationProfile(profile.pk)
        .then(() => {
          // Remove deleted notification profile from list
          setProfiles(profiles.filter((p) => p.pk !== profile.pk));

          displayAlert("Notification profile successfully deleted", "success");
        })
        .catch((error: Error) => {
          displayAlert(error.message, "error");
        });
    }
  };

  const handleDiscard = () => {
    setCreateProfileVisible(false);
  };

  const handleAddDestination = (newDestination: NewDestination): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      api
        .postDestination(newDestination)
        .then((destination: Destination) => {
          createDestination(destination);
          displayAlert(
            `Created new destination: 
                ${
                  destination.label !== undefined && destination.label !== null
                    ? destination.label
                    : destination.suggested_label
                }`,
            "success",
          );
          setAddDestinationDialogOpen(false);
          resolve();
        })
        .catch((error: Error) => {
          displayAlert(error.message, "error");
          reject();
        });
    });
  };

  // Default profile provided to NotificationProfileCard-component when creating a new profile
  const newProfile: NotificationProfileKeyed = {
    timeslot: timeslots.length > 0 ? timeslots[0].pk : 0,
    filters: [],
    // eslint-disable-next-line
    destinations: null,
    active: true,
  };

  // Dialog shown if trying to create a new profile when all timeslots are in use
  const noTimeslotsLeftDialog = (
    <Modal
      title="No timeslots available"
      content={
        <Typography>
          You have not created any timeslots yet. Create a new timeslot if you want to register a new profile.
        </Typography>
      }
      actions={
        <Button onClick={() => setNoAvailableTimeslotsDialogOpen(false)} color="primary" autoFocus>
          OK
        </Button>
      }
      open={noAvailableTimeslotsDialogOpen}
      onClose={() => setNoAvailableTimeslotsDialogOpen(false)}
    />
  );

  return isLoading ? (
    <Typography className={style.loadingText} variant="h6" align="center">
      Loading...
    </Typography>
  ) : (
    <>
      {createProfileVisible ? (
        <div>
          <div className={style.header}>
            <Typography variant="h5" className={style.headerText}>
              Create new profile
            </Typography>
          </div>
          <NotificationProfileCard
            profile={newProfile}
            timeslots={timeslots}
            filters={filters}
            destinations={destinations}
            mediaOptions={configuredMedia}
            exists={false}
            onSave={handleCreate}
            onDelete={handleDiscard}
            onAddDestination={() => setAddDestinationDialogOpen(true)}
          />
        </div>
      ) : (
        <div>
          <div className={style.header}>
            <Typography variant="h5" className={style.headerText}>
              Notification profiles
            </Typography>
            <Button
              className={style.createProfileButton}
              variant="contained"
              color="primary"
              startIcon={<AddCircleIcon />}
              onClick={() =>
                timeslots.length > 0 ? setCreateProfileVisible(true) : setNoAvailableTimeslotsDialogOpen(true)
              }
            >
              Create new profile
            </Button>
          </div>
          {profiles.length > 0 ? (
            profiles.map((profile) => (
              <NotificationProfileCard
                key={profile.pk}
                profile={profile}
                timeslots={timeslots}
                filters={filters}
                destinations={destinations}
                mediaOptions={configuredMedia}
                exists={true}
                onSave={handleSave}
                onDelete={handleDelete}
                onAddDestination={() => setAddDestinationDialogOpen(true)}
              />
            ))
          ) : (
            <Card className={style.noProfilesCard}>
              <Typography align="center">No notification profiles</Typography>
            </Card>
          )}
        </div>
      )}
      <AddDestinationDialog
        open={addDestinationDialogOpen}
        configuredMedia={configuredMedia}
        onSave={handleAddDestination}
        onCancel={() => setAddDestinationDialogOpen(false)}
      />
      {noTimeslotsLeftDialog}
    </>
  );
};

export default NotificationProfileList;
