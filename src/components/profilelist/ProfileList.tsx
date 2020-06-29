import React, { useState, useEffect } from "react";
import "./ProfileList.css";
import Profile from "../profile/Profile";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";

import ActionDialog from "../../components/actiondialog/ActionDialog";
import api, {
  NotificationProfile,
  NotificationProfilePK,
  NotificationProfileKeyed,
  Filter,
  FilterPK,
  Timeslot,
  TimeslotPK,
  MediaAlternative,
} from "../../api";
import { createUsePromise, useApiNotificationProfiles, useApiFilters, useApiTimeslots } from "../../api/hooks";
import { toMap, pkGetter, removeUndefined } from "../../utils";

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

const ProfileList: React.FC = () => {
  const [profiles, setProfiles] = useState<Map<NotificationProfilePK, NotificationProfile>>(
    new Map<NotificationProfilePK, NotificationProfile>(),
  );
  const [timeslots, setTimeslots] = useState<Map<TimeslotPK, Timeslot>>(new Map<TimeslotPK, Timeslot>());
  const [availableTimeslots, setAvailableTimeslots] = useState<Set<TimeslotPK>>(new Set<TimeslotPK>());

  const [action, setAction] = useState<Action>({ message: "", success: false, completed: false });

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

  const onResult = (combined: ProfilesTimeslots) => {
    console.log("got combined", combined);
    calculateAvailableTimeslots(combined.profiles, combined.timeslots);
    setProfiles(combined.profiles || new Map<NotificationProfilePK, NotificationProfile>());
    setTimeslots(combined.timeslots || new Map<TimeslotPK, Timeslot>());
  };

  const useCombined = createUsePromise<[NotificationProfile[], Timeslot[]], ProfilesTimeslots>(mapper, onResult);

  const [
    { result: combinedResult, isLoading: combinedIsLoading, isError: combinedIsError },
    setCombinedPromise,
  ] = useCombined();

  const [newProfile, setNewProfile] = useState<Partial<NotificationProfile> | undefined>(undefined);
  const [usedTimeslots, setUsedTimeslots] = useState<Set<Timeslot["name"]>>(new Set<Timeslot["name"]>());

  useEffect(() => {
    console.log("updating used timeslots");
    const newUsedTimeslots = new Set<Timeslot["name"]>(
      [...profiles.values()].map((profile: NotificationProfile) => profile.timeslot.name),
    );
    setUsedTimeslots(newUsedTimeslots);
  }, [profiles]);

  const [{ result: filters, isLoading: filtersIsLoading, isError: filtersIsError }, setFiltersPromise] = useApiFilters(
    (result: Map<FilterPK, Filter>) => {
      console.log("got filter result", result);
    },
  )();

  const mediaOptions: { label: string; value: MediaAlternative }[] = [
    { label: "Slack", value: "SL" },
    { label: "SMS", value: "SM" },
    { label: "Email", value: "EM" },
  ];

  useEffect(() => {
    setFiltersPromise(api.getAllFilters());
    const promise = Promise.all([api.getAllNotificationProfiles(), api.getAllTimeslots()]);
    setCombinedPromise(promise);
  }, [setFiltersPromise, setCombinedPromise]);

  function doAction(message: string, completed: boolean, success = true) {
    setAction({ success, completed, message });
  }

  const deleteSavedProfile = (pk: NotificationProfilePK) => {
    api.deleteNotificationProfile(pk).then((success: boolean) => {
      setProfiles((profiles: Map<NotificationProfilePK, NotificationProfile>) => {
        const newProfiles = new Map<NotificationProfilePK, NotificationProfile>(profiles);
        newProfiles.delete(pk);
        return newProfiles;
      });
      doAction(success ? "Deleted notification profile" : "Unable to delete profile", true, success);
    });
  };

  const deleteNewProfile = () => {
    setNewProfile(undefined);
  };

  const updateSavedProfile = (profile: NotificationProfile) => {
    doAction(`Updating profile: ${profile.pk}`, false);
    console.log("upadting profile", profile);
    api
      .putNotificationProfile(
        profile.timeslot.pk,
        removeUndefined(profile.filters).map((filter: Filter): FilterPK => filter.pk),
        profile.media,
        profile.active,
      )
      .then((profile: NotificationProfile) => {
        setProfiles((profiles: Map<NotificationProfilePK, NotificationProfile>) => {
          const newProfiles = new Map<NotificationProfilePK, NotificationProfile>(profiles);
          newProfiles.set(profile.pk, profile);
          return newProfiles;
        });
        doAction(`Updated profile: ${profile.pk}`, false);
      });
  };

  const createNewProfile = (profile: Omit<NotificationProfileKeyed, "pk">) => {
    console.log("createNewProfile", profile);
    doAction(`Creating new profile`, false);
    api
      .postNotificationProfile(profile.timeslot, profile.filters, profile.media, profile.active)
      .then((profile: NotificationProfile) => {
        setProfiles((profiles: Map<NotificationProfilePK, NotificationProfile>) => {
          const newProfiles = new Map<NotificationProfilePK, NotificationProfile>(profiles);
          newProfiles.set(profile.pk, profile);
          return newProfiles;
        });
        doAction(`Create new profile: ${profile.pk}`, true);
      });
    setNewProfile(undefined);
  };

  const addProfileClick = () => {
    if (availableTimeslots.size < 1 || !timeslots) {
      alert("All timeslots are in use");
    } else if (newProfile === undefined) {
      setNewProfile({ media: [], active: false, filters: [], timeslot: timeslots.values().next().value });
    } else {
      alert("Already working on new filter");
      return;
    }
  };

  const profilesKeys = [...((profiles && profiles.keys()) || [])];

  const newProfileComponent = newProfile ? (
    <Profile
      active={newProfile.active || false}
      filters={filters || new Map<FilterPK, Filter>()}
      timeslots={timeslots || new Map<TimeslotPK, Timeslot>()}
      mediums={mediaOptions}
      selectedMediums={newProfile?.media || []}
      selectedFilters={newProfile?.filters || []}
      selectedTimeslot={newProfile.timeslot}
      isTimeslotInUse={(timeslot: Timeslot) => usedTimeslots.has(timeslot.name)}
      onNewDelete={deleteNewProfile}
      onSavedDelete={deleteSavedProfile}
      onNewCreate={createNewProfile}
      onSavedUpdate={updateSavedProfile}
      onUpdate={(newProfile: Partial<NotificationProfile>) => {
        console.log("got new profile");
        setNewProfile((profile?: Partial<NotificationProfile>) => {
          if (!profile) {
            return newProfile;
          }
          return {
            timeslot: newProfile.timeslot ? newProfile.timeslot : profile.timeslot,
            filters: newProfile.filters ? newProfile.filters : profile.filters,
            media: newProfile.media ? newProfile.media : profile.media,
            active: newProfile.active ? newProfile.active : profile.active,
          };
        });
      }}
    />
  ) : (
    <></>
  );

  return (
    <div className="profile-container">
      <ActionDialog
        message={action.message}
        show={action.completed}
        success={action.success}
        onClose={() => setAction((action: Action) => ({ ...action, completed: false }))}
      />
      {combinedIsLoading || filtersIsLoading ? (
        <h5>Loading...</h5>
      ) : profiles && profilesKeys.length > 0 ? (
        profilesKeys.map((pk: NotificationProfilePK) => {
          const profile: NotificationProfile | undefined = profiles.get(pk);
          if (!profile) {
            return;
          }

          return (
            <Profile
              exists
              active={profile.active}
              filters={filters || new Map<FilterPK, Filter>()}
              timeslots={timeslots || new Map<TimeslotPK, Timeslot>()}
              isTimeslotInUse={(timeslot: Timeslot): boolean => {
                console.log("is timeslot in use", timeslot, usedTimeslots.has(timeslot.name));
                return usedTimeslots.has(timeslot.name);
              }}
              key={profile.pk}
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
        })
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
  );
};

export default ProfileList;
