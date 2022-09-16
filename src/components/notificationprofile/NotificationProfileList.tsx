import React, { useState, useEffect } from "react";

import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import { createStyles, makeStyles } from "@material-ui/core/styles";

import Modal from "../modal/Modal";
import NotificationProfileCard from "./NotificationProfileCard";
import AddPhoneNumberDialog from "./AddPhoneNumberDialog";
import { useAlerts } from "../alertsnackbar";

import api from "../../api";

import type {
  NotificationProfile,
  NotificationProfileKeyed,
  Filter,
  Timeslot,
  MediaAlternative,
  PhoneNumber,
} from "../../api/types";

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
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [profiles, setProfiles] = useState<NotificationProfileKeyed[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);

  const [createProfileVisible, setCreateProfileVisible] = useState<boolean>(false);
  const [noAvailableTimeslotsDialogOpen, setNoAvailableTimeslotsDialogOpen] = useState<boolean>(false);
  const [addPhoneNumberDialogOpen, setAddPhoneNumberDialogOpen] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const mediaOptions: { label: string; value: MediaAlternative }[] = [
    {
      label: "Email",
      value: "EM",
    },
    {
      label: "SMS",
      value: "SM",
    },
  ];

  // Function for converting NotificationProfile to a keyed object (NotificationProfileKeyed)
  const profileToKeyed = (profile: NotificationProfile): NotificationProfileKeyed => {
    return {
      name: profile.name,
      timeslot: profile.timeslot.pk,
      filters: profile.filters.map((filter: Filter) => filter.pk),
      media: profile.media,
      active: profile.active,
      // eslint-disable-next-line @typescript-eslint/camelcase
      phone_number: profile.phone_number ? profile.phone_number.pk : null,
      pk: profile.pk,
    };
  };

  // Fetch data from API on mount
  useEffect(() => {
    Promise.all([
      api.getAllTimeslots(),
      api.getAllFilters(),
      api.getAllNotificationProfiles(),
      api.getAllPhoneNumbers(),
    ])
      .then(([timeslotResponse, filterResponse, profileResponse, phoneNumberResponse]) => {
        // Convert response to keyed profile
        const keyedProfileResponse = profileResponse.map((profile) => profileToKeyed(profile));

        setTimeslots(timeslotResponse);
        setFilters(filterResponse);
        setProfiles(keyedProfileResponse);
        setPhoneNumbers(phoneNumberResponse);
        setIsLoading(false);
      })
      .catch((error) => {
        displayAlert(error.message, "error");
        setIsLoading(false);
      });
  }, [displayAlert]);

  // Action handlers
  const handleCreate = (profile: NotificationProfileKeyed) => {
    api
      .postNotificationProfile(profile.name, profile.timeslot, profile.filters, profile.media, profile.active, profile.phone_number)
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
    api
      .putNotificationProfile(profile.name, profile.timeslot, profile.filters, profile.media, profile.active, profile.phone_number)
      .then(() => displayAlert("Notification profile successfully updated", "success"))
      .catch((error: Error) => displayAlert(error.message, "error"));
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

  const handleAddPhoneNumber = (phoneNumber: string) => {
    api
      .postPhoneNumber(phoneNumber)
      .then((phoneNumber) => {
        displayAlert("Phone number successfully added", "success");
        setPhoneNumbers([...phoneNumbers, phoneNumber]);
        setAddPhoneNumberDialogOpen(false);
      })
      .catch((error: Error) => displayAlert(error.message, "error"));
  };

  const handleSaveTimeslotChanged = (profile: NotificationProfileKeyed) => {
    api
      .deleteNotificationProfile(Number(profile.pk))
      .then(() =>
        api
          .postNotificationProfile(
            profile.name,
            profile.timeslot,
            profile.filters,
            profile.media,
            profile.active,
            profile.phone_number,
          )
          .then((newProfile) => {
            // Update notification profile in list
            const newProfileKeyed = profileToKeyed(newProfile);
            setProfiles(profiles.map((p) => (p.pk === profile.pk ? newProfileKeyed : p)));

            displayAlert("Notification profile successfully updated", "success");
          })
          .catch((error: Error) => displayAlert(error.message, "error")),
      )
      .catch((error: Error) => displayAlert(error.message, "error"));
  };

  // Default profile provided to NotificationProfileCard-component when creating a new profile
  const newProfile: NotificationProfileKeyed = {
    name: "",
    timeslot: timeslots.length > 0 ? timeslots[0].pk : 0,
    filters: [],
    media: [],
    // eslint-disable-next-line @typescript-eslint/camelcase
    phone_number: phoneNumbers.length > 0 ? phoneNumbers[0].pk : 0,
    active: true,
  };

  // Dialog shown if trying to create a new profile when all timeslots are in use
  const noTimeslotsLeftDialog = (
    <Modal
      title="No available timeslots left"
      content={
        <Typography>
          All timeslots are currently in use. Create a new timeslot or delete an existing notification profile if you
          want to register a new profile.
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
            mediaOptions={mediaOptions}
            phoneNumbers={phoneNumbers}
            exists={false}
            onSave={handleCreate}
            onDelete={handleDiscard}
            onAddPhoneNumber={() => setAddPhoneNumberDialogOpen(true)}
            onSaveTimeslotChanged={handleSaveTimeslotChanged}
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
              onClick={() => setCreateProfileVisible(true)}
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
                mediaOptions={mediaOptions}
                phoneNumbers={phoneNumbers}
                exists={true}
                onSave={handleSave}
                onDelete={handleDelete}
                onAddPhoneNumber={() => setAddPhoneNumberDialogOpen(true)}
                onSaveTimeslotChanged={handleSaveTimeslotChanged}
              />
            ))
          ) : (
            <Card className={style.noProfilesCard}>
              <Typography align="center">No notification profiles</Typography>
            </Card>
          )}
        </div>
      )}
      <AddPhoneNumberDialog
        open={addPhoneNumberDialogOpen}
        onSave={handleAddPhoneNumber}
        onCancel={() => setAddPhoneNumberDialogOpen(false)}
      />
      {noTimeslotsLeftDialog}
    </>
  );
};

export default NotificationProfileList;
