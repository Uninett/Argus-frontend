import React, { useState, useEffect, useMemo } from "react";
import "./ProfileList.css";
import Profile, { NotificationProfileCard } from "../profile/Profile";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";

import ActionDialog from "../../components/actiondialog/ActionDialog";

import type {
  NotificationProfile,
  NotificationProfilePK,
  NotificationProfileKeyed,
  Filter,
  FilterPK,
  Timeslot,
  TimeslotPK,
  MediaAlternative,
  PhoneNumber,
} from "../../api/types.d";

import api from "../../api";
import { defaultErrorHandler } from "../../api/utils";

import { createUsePromise, useApiFilters } from "../../api/hooks";
import { toMap, pkGetter, removeUndefined } from "../../utils";

import { useAlerts, useAlertSnackbar, UseAlertSnackbarResultType } from "../../components/alertsnackbar";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import Modal from "../modal/Modal";
import Typography from "@material-ui/core/Typography";
import { TextField, createStyles } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

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
    createProfileButton: {
      marginLeft: "auto",
    },
    loadingText: {
      marginTop: "30px",
    },
  }),
);

interface FilterData {
  label: string;
  value: string;
}

interface TimeslotData {
  label: string;
  value: string;
}

interface Data {
  label: string;
  value: string | number;
}

type Action = {
  message: string;
  success: boolean;
  completed: boolean;
};

// To correctly update the list of profiles with the updated ones
// we store a revision number with the profiles. When an update occours
// old profile component instance is replaced with a new one with a
// higher revision number. We need the revision number to detect
// that it has changed.
interface RevisedNotificationProfile extends NotificationProfile {
  revision?: number;
}

const ProfileList: React.FC = () => {
  const [profiles, setProfiles] = useState<Map<NotificationProfilePK, RevisedNotificationProfile>>(
    new Map<NotificationProfilePK, RevisedNotificationProfile>(),
  );
  const [timeslots, setTimeslots] = useState<Map<TimeslotPK, Timeslot>>(new Map<TimeslotPK, Timeslot>());
  const [availableTimeslots, setAvailableTimeslots] = useState<Set<TimeslotPK>>(new Set<TimeslotPK>());

  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);

  useEffect(() => {
    api
      .getAllPhoneNumbers()
      .then((phoneNumbers: PhoneNumber[]) => {
        setPhoneNumbers(phoneNumbers);
      })
      .catch((error: Error) => {
        console.error(`Error occured while fetching phone numbers: ${error}`);
      });
  }, []);

  const [action, setAction] = useState<Action>({ message: "", success: false, completed: false });

  type ProfilesTimeslots = {
    profiles: Map<NotificationProfilePK, NotificationProfile>;
    timeslots: Map<TimeslotPK, Timeslot>;
  };

  const mapper = ([profiles, timeslots]: [NotificationProfile[], Timeslot[]]): ProfilesTimeslots => {
    return {
      profiles: toMap<NotificationProfilePK, NotificationProfile>(profiles, pkGetter),
      timeslots: toMap<TimeslotPK, Timeslot>(timeslots, pkGetter),
    };
  };

  const useCombined = createUsePromise<[NotificationProfile[], Timeslot[]], ProfilesTimeslots>(mapper);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { incidentSnackbar, displayAlertSnackbar }: UseAlertSnackbarResultType = useAlertSnackbar();

  const [
    { result: combinedResult, isLoading: combinedIsLoading, isError: combinedIsError },
    setCombinedPromise,
  ] = useCombined();

  useEffect(() => {
    if (combinedResult === undefined) {
      return;
    }
    setProfiles(combinedResult.profiles || new Map<NotificationProfilePK, RevisedNotificationProfile>());
    setTimeslots(combinedResult.timeslots || new Map<TimeslotPK, Timeslot>());
  }, [combinedResult]);

  const [newProfile, setNewProfile] = useState<Partial<NotificationProfile> | undefined>(undefined);
  const [unsavedProfiles, setUnsavedProfiles] = useState<Set<TimeslotPK>>(new Set());
  const [usedTimeslots, setUsedTimeslots] = useState<Set<Timeslot["name"]>>(new Set<Timeslot["name"]>());

  useEffect(() => {
    const newUsedTimeslots = new Set<Timeslot["name"]>(
      [...profiles.values()].map((profile: NotificationProfile) => profile.timeslot.name),
    );
    setUsedTimeslots(newUsedTimeslots);
    const calculateAvailableTimeslots = (
      profiles: Map<NotificationProfilePK, NotificationProfile>,
      timeslots: Map<TimeslotPK, Timeslot>,
    ) => {
      const avail: Set<TimeslotPK> = new Set<TimeslotPK>([...timeslots.keys()]);
      for (const profile of profiles.values()) {
        avail.delete(profile.pk);
      }
      setAvailableTimeslots(avail);
    };

    calculateAvailableTimeslots(profiles, timeslots);
  }, [profiles, timeslots]);

  const [{ result: filters, isLoading: filtersIsLoading, isError: filtersIsError }, setFiltersPromise] = useApiFilters(
    () => undefined,
  )();

  // useMemo(() => {
  //   if (!filtersIsError) return;
  //   displayAlertSnackbar("Unable to fetch filters", "error");
  // }, [filtersIsError, displayAlertSnackbar]);

  useMemo(() => {
    if (!combinedIsError && !filtersIsError) return;
    displayAlertSnackbar("Unable to get profiles and timeslots, or filters", "error");
  }, [filtersIsError, combinedIsError, displayAlertSnackbar]);

  const mediaOptions: { label: string; value: MediaAlternative }[] = [
    { label: "SMS", value: "SM" },
    { label: "Email", value: "EM" },
  ];

  useEffect(() => {
    setFiltersPromise(api.getAllFilters());
    const promise = Promise.all([api.getAllNotificationProfiles(), api.getAllTimeslots()]);
    setCombinedPromise(promise);
  }, [setFiltersPromise, setCombinedPromise]);

  const deleteSavedProfile = (pk: NotificationProfilePK) => {
    api
      .deleteNotificationProfile(pk)
      .then((success: boolean) => {
        setProfiles((profiles: Map<NotificationProfilePK, RevisedNotificationProfile>) => {
          const newProfiles = new Map<NotificationProfilePK, RevisedNotificationProfile>(profiles);
          newProfiles.delete(pk);
          return newProfiles;
        });
        const profileName = profiles.get(pk)?.timeslot.name || "<unknown>";
        displayAlertSnackbar(
          success ? `Deleted notification profile: ${profileName}` : `Unable to delete profile: ${profileName}`,
          success ? "warning" : "error",
        );
      })
      .catch(defaultErrorHandler((msg: string) => displayAlertSnackbar(msg, "error")));
  };

  const deleteNewProfile = () => {
    setNewProfile(undefined);
  };

  const updateSavedProfile = (profile: NotificationProfile) => {
    api
      .putNotificationProfile(
        profile.timeslot.pk,
        removeUndefined(profile.filters).map((filter: Filter): FilterPK => filter.pk),
        profile.media,
        profile.active,
        profile.phone_number?.pk || null,
      )
      .then((newProfile: NotificationProfile) => {
        // Special case: handle when the update function failes.
        if (unsavedProfiles.has(profile.timeslot.pk)) {
          setUnsavedProfiles((unsavedProfiles: Set<TimeslotPK>) => {
            const newSet = new Set<TimeslotPK>(unsavedProfiles);
            newSet.delete(profile.timeslot.pk);
            return newSet;
          });
        }

        setProfiles((profiles: Map<NotificationProfilePK, RevisedNotificationProfile>) => {
          const newProfiles = new Map<NotificationProfilePK, RevisedNotificationProfile>(profiles);
          const revisedProfile = profiles.get(profile.pk);
          newProfiles.set(profile.pk, { ...newProfile, revision: (revisedProfile?.revision || 0) + 1 });
          return newProfiles;
        });
        displayAlertSnackbar(`Updated profile: ${profile.timeslot.name}`, "success");
      })
      .catch(
        defaultErrorHandler((msg: string) => {
          displayAlertSnackbar(msg, "error");

          // Special case: handle when the update function failes.
          setUnsavedProfiles((unsavedProfiles: Set<TimeslotPK>) => {
            const newSet = new Set<TimeslotPK>(unsavedProfiles);
            newSet.add(profile.timeslot.pk);
            return newSet;
          });
        }),
      );
  };

  const createNewProfile = (profile: Omit<NotificationProfileKeyed, "pk">) => {
    api
      .postNotificationProfile(
        profile.timeslot,
        profile.filters,
        profile.media,
        profile.active,
        profile?.phone_number || null,
      )
      .then((profile: NotificationProfile) => {
        setNewProfile(undefined);
        setProfiles((profiles: Map<NotificationProfilePK, RevisedNotificationProfile>) => {
          const newProfiles = new Map<NotificationProfilePK, RevisedNotificationProfile>(profiles);
          newProfiles.set(profile.pk, { ...profile, revision: 1 });
          return newProfiles;
        });
        displayAlertSnackbar(`Created new profile: ${profile.timeslot.name}`, "success");
      })
      .catch(
        defaultErrorHandler((msg: string) => {
          displayAlertSnackbar(msg, "error");
        }),
      );
  };

  const addProfileClick = () => {
    if (availableTimeslots.size < 1 || !timeslots) {
      alert("All timeslots are in use");
    } else if (newProfile === undefined) {
      const firstAvailable = availableTimeslots.values().next().value;
      setNewProfile({ media: [], active: true, filters: [], timeslot: timeslots.get(firstAvailable) });
    } else {
      displayAlertSnackbar("Already working on new filter. Create or delete that one first!", "error");
      return;
    }
  };

  const profilesKeys = [...((profiles && profiles.keys()) || [])];

  const newProfileComponent = newProfile ? (
    <Profile
      unsavedChanges={true}
      active={newProfile.active || false}
      filters={filters || new Map<FilterPK, Filter>()}
      timeslots={timeslots || new Map<TimeslotPK, Timeslot>()}
      mediums={mediaOptions}
      phoneNumbers={phoneNumbers || []}
      selectedMediums={newProfile?.media || []}
      selectedFilters={newProfile?.filters || []}
      selectedTimeslot={newProfile.timeslot}
      phoneNumber={newProfile?.phone_number || null}
      isTimeslotInUse={(timeslot: Timeslot) => usedTimeslots.has(timeslot.name)}
      onNewDelete={deleteNewProfile}
      onSavedDelete={deleteSavedProfile}
      onNewCreate={createNewProfile}
      onSavedUpdate={updateSavedProfile}
    />
  ) : (
    <></>
  );

  return (
    <>
      <div className="profile-container">
        {incidentSnackbar}
        <ActionDialog
          key="actiondialog"
          message={action.message}
          show={action.completed}
          success={action.success}
          onClose={() => setAction((action: Action) => ({ ...action, completed: false }))}
        />
        {combinedIsLoading || filtersIsLoading ? (
          <h5>Loading...</h5>
        ) : profiles && profilesKeys.length > 0 ? (
          removeUndefined(
            profilesKeys.map((pk: NotificationProfilePK) => {
              const profile: RevisedNotificationProfile | undefined = profiles.get(pk);
              if (!profile) {
                return undefined;
              }

              const unsavedChanges = unsavedProfiles.has(profile.timeslot.pk);

              return (
                <Profile
                  unsavedChanges={unsavedChanges}
                  exists
                  active={profile.active}
                  filters={filters || new Map<FilterPK, Filter>()}
                  timeslots={timeslots || new Map<TimeslotPK, Timeslot>()}
                  phoneNumbers={phoneNumbers || []}
                  phoneNumber={profile.phone_number}
                  isTimeslotInUse={(timeslot: Timeslot): boolean => usedTimeslots.has(timeslot.name)}
                  key={`${profile.pk}-${profile.revision}`}
                  pk={profile.pk}
                  mediums={mediaOptions}
                  selectedMediums={profile.media}
                  selectedFilters={profile.filters}
                  selectedTimeslot={profile.timeslot}
                  onNewDelete={deleteNewProfile}
                  onSavedDelete={deleteSavedProfile}
                  onNewCreate={createNewProfile}
                  onSavedUpdate={updateSavedProfile}
                />
              );
            }),
          )
        ) : newProfile ? (
          <></>
        ) : (
          <h5>No profiles</h5>
        )}
        {newProfileComponent}
        {!newProfile && (
          <div className="add-button">
            <Fab color="primary" aria-label="add" size="large" onClick={addProfileClick}>
              <AddIcon />
            </Fab>
          </div>
        )}
      </div>
    </>
  );
};

type AddPhoneNumberDialogPropsType = {
  open: boolean;
  onSave: (phoneNumber: string) => void;
  onCancel: () => void;
};

const AddPhoneNumberDialog = ({ open, onSave, onCancel }: AddPhoneNumberDialogPropsType) => {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  const handleSave = () => {
    if (phoneNumber) {
      setError(false);
      onSave(phoneNumber);
    } else {
      setError(true);
    }
  };

  const handleCancel = () => {
    setError(false);
    setPhoneNumber("");
    onCancel();
  };

  return (
    <Modal
      title="Add phone number"
      content={
        <TextField
          value={phoneNumber}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(event.target.value)}
          error={error}
          helperText={error ? "This field cannot be empty." : null}
        />
      }
      actions={
        <div>
          <Button onClick={handleCancel} color="primary" autoFocus>
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" autoFocus>
            Save
          </Button>
        </div>
      }
      open={open}
      onClose={handleCancel}
    />
  );
};

export const NotificationProfileList = () => {
  const style = useStyles();

  // State
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [availableTimeslots, setAvailableTimeslots] = useState<Timeslot[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [profiles, setProfiles] = useState<NotificationProfileKeyed[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [createProfileVisible, setCreateProfileVisible] = useState<boolean>(false);
  const [showNoTimeslotsLeftDialog, setShowNoTimeslotsLeftDialog] = useState<boolean>(false);
  const [showAddPhoneNumberDialog, setShowAddPhoneNumberDialog] = useState<boolean>(false);

  // Create alert instance
  const displayAlert = useAlerts();

  // TODO: fetch these from backend instead when an endpoint for MediaAlternatives is created
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
      timeslot: profile.timeslot.pk,
      filters: profile.filters.map((filter: Filter) => filter.pk),
      media: profile.media,
      active: profile.active,
      // eslint-disable-next-line @typescript-eslint/camelcase
      phone_number: profile.phone_number ? profile.phone_number.pk : null,
      pk: profile.pk,
    };
  };

  // Fetch data from API
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

        const availableTimeslots = timeslotResponse.filter((timeslot) => {
          return keyedProfileResponse.every((profile) => profile.timeslot !== timeslot.pk);
        });

        setTimeslots(timeslotResponse);
        setAvailableTimeslots(availableTimeslots);
        setFilters(filterResponse);
        setProfiles(keyedProfileResponse);
        setPhoneNumbers(phoneNumberResponse);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log("Error");
        console.error(error);
      });
  }, []);

  // Update list of available timeslots every time profiles or timeslots change
  useEffect(() => {
    const availableTimeslots = timeslots.filter((timeslot) =>
      profiles.every((profile) => profile.timeslot !== timeslot.pk),
    );
    setAvailableTimeslots(availableTimeslots);
  }, [profiles, timeslots]);

  // Handle user interaction
  const handleCreate = (profile: NotificationProfileKeyed) => {
    api
      .postNotificationProfile(profile.timeslot, profile.filters, profile.media, profile.active, profile.phone_number)
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
      .putNotificationProfile(profile.timeslot, profile.filters, profile.media, profile.active, profile.phone_number)
      .then(() => displayAlert("Notification profile successfully updated", "success"))
      .catch((error: Error) => displayAlert(error.message, "error"));
  };

  // Workaround
  const handleSaveTimeslotChanged = (profile: NotificationProfileKeyed) => {
    api
      .deleteNotificationProfile(Number(profile.pk))
      .then(() =>
        api
          .postNotificationProfile(
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
        setShowAddPhoneNumberDialog(false);
      })
      .catch((error: Error) => displayAlert(error.message, "error"));
  };

  const newProfile: NotificationProfileKeyed = {
    timeslot: availableTimeslots.length > 0 ? availableTimeslots[0].pk : 0,
    filters: [],
    media: [],
    // eslint-disable-next-line @typescript-eslint/camelcase
    phone_number: phoneNumbers.length > 0 ? phoneNumbers[0].pk : 0,
    active: true,
  };

  const getAvailableTimeslots = (profile: NotificationProfileKeyed): Timeslot[] => {
    const currentTimeslot = timeslots.find((timeslot) => timeslot.pk === profile.timeslot);
    if (currentTimeslot) {
      return [currentTimeslot, ...availableTimeslots];
    }
    return availableTimeslots;
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
        <Button onClick={() => setShowNoTimeslotsLeftDialog(false)} color="primary" autoFocus>
          OK
        </Button>
      }
      open={showNoTimeslotsLeftDialog}
      onClose={() => setShowNoTimeslotsLeftDialog(false)}
    />
  );

  return isLoading ? (
    <Typography className={style.loadingText} variant="h6" align="center">
      Loading...
    </Typography>
  ) : (
    <div>
      {createProfileVisible ? (
        <div>
          <div className={style.header}>
            <Typography variant="h5" className={style.headerText}>
              Create new profile
            </Typography>
          </div>
          <NotificationProfileCard
            profile={newProfile}
            timeslots={availableTimeslots}
            filters={filters}
            mediaOptions={mediaOptions}
            phoneNumbers={phoneNumbers}
            exists={false}
            onSave={handleCreate}
            onDelete={handleDiscard}
            onAddPhoneNumber={() => setShowAddPhoneNumberDialog(true)}
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
              onClick={() =>
                availableTimeslots.length > 0 ? setCreateProfileVisible(true) : setShowNoTimeslotsLeftDialog(true)
              }
            >
              Create new profile
            </Button>
          </div>
          {profiles.map((profile) => (
            <NotificationProfileCard
              key={profile.pk}
              profile={profile}
              timeslots={getAvailableTimeslots(profile)}
              filters={filters}
              mediaOptions={mediaOptions}
              phoneNumbers={phoneNumbers}
              exists={true}
              onSave={handleSave}
              onDelete={handleDelete}
              onAddPhoneNumber={() => setShowAddPhoneNumberDialog(true)}
              onSaveTimeslotChanged={handleSaveTimeslotChanged}
            />
          ))}
        </div>
      )}
      <AddPhoneNumberDialog
        open={showAddPhoneNumberDialog}
        onSave={handleAddPhoneNumber}
        onCancel={() => setShowAddPhoneNumberDialog(false)}
      />
      {noTimeslotsLeftDialog}
    </div>
  );
};

export default ProfileList;
