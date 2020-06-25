import React, { useState, useEffect } from "react";
import "./ProfileList.css";
import Profile from "../profile/Profile";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import api, { NotificationProfile, NotificationProfilePK, Filter, Timeslot } from "../../api";

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

const ProfileList: React.FC = () => {
  const [notificationprofiles, setNotificationprofiles] = useState<NotificationProfile[]>([]);
  const [addedNotificationprofiles, setAddedNotificationprofiles] = useState<NotificationProfilePK[]>([]);
  const [newProfileCounter, setNewProfileCounter] = useState<number>(0);
  const [filters, setFilters] = useState<FilterData[]>([]);
  const [timeslots, setTimeslots] = useState<TimeslotData[]>([]);
  const mediaOptions = [
    { label: "Slack", value: "SL" },
    { label: "SMS", value: "SM" },
    { label: "Email", value: "EM" },
  ];

  function formatData<T extends Data>(input: (Filter | Timeslot)[]): T[] {
    return input.map((elem: Filter | Timeslot) => ({ value: elem.pk, label: elem.name } as T));
  }

  const getNotificationprofiles = async () => {
    api.getAllNotificationProfiles().then((profiles: NotificationProfile[]) => {
      setNotificationprofiles(profiles);
    });
  };

  useEffect(() => {
    //fetch all notificationprofiles
    getNotificationprofiles();
    api.getAllFilters().then((filters: Filter[]) => {
      setFilters(formatData<FilterData>(filters));
    });
    api.getAllTimeslots().then((timeslots: Timeslot[]) => {
      setTimeslots(formatData<TimeslotData>(timeslots));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteProfile = (num: number, isNew: boolean) => {
    if (isNew) {
      const prof: NotificationProfilePK[] = [...addedNotificationprofiles];
      const index: number = prof.indexOf(num);
      prof.splice(index, 1);

      setAddedNotificationprofiles(prof);
    } else {
      const prof = [...notificationprofiles];
      for (let i = 0; i < prof.length; i++) {
        const element: any = prof[i];
        if (element.pk === num) {
          prof.splice(i, 1);
        }
      }
      setNotificationprofiles(prof);
    }
  };

  const formatMedia = (media: string[]) => {
    const matchedMedia: any = [];
    for (let i = 0; i < mediaOptions.length; i++) {
      const item = mediaOptions[i];
      for (let j = 0; j < media.length; j++) {
        if (item.value === media[j]) {
          const object: any = {
            value: item.value,
            label: item.label,
          };
          matchedMedia.push(object);
        }
      }
    }
    return matchedMedia;
  };

  const getUnusedTimeslots = () => {
    if (notificationprofiles.length > 0 && timeslots.length > 0) {
      const timeslotsProfile: string[] = [];
      for (let i = 0; i < notificationprofiles.length; i++) {
        const element = notificationprofiles[i];
        timeslotsProfile.push(String(element.timeslot.pk));
      }
      const timeslotNames: string[] = [];
      timeslots.map((timeslot: TimeslotData) => {
        return timeslotNames.push(timeslot.value);
      });

      const difference: any = timeslotsProfile
        .filter((x: any) => !timeslotNames.includes(x))
        .concat(timeslotNames.filter((x: any) => !timeslotsProfile.includes(x)));
      const newList: any = [];
      for (let i = 0; i < timeslots.length; i++) {
        const element1: any = timeslots[i];
        for (let j = 0; j < difference.length; j++) {
          const element2: any = difference[j];
          if (element1.value === element2) {
            newList.push({ value: element1.value, label: element1.label });
          }
        }
      }
      return newList;
    } else {
      return timeslots;
    }
  };

  const addProfileClick = () => {
    if (getUnusedTimeslots().length > 0) {
      const newProfiles: number[] = addedNotificationprofiles;
      newProfiles.push(newProfileCounter);
      setNewProfileCounter(newProfileCounter + 1);
    } else alert("All timeslots are in use");
  };

  const removeTimeslot = (item: any) => {
    const list: any = [];
    for (let i = 0; i < timeslots.length; i++) {
      const element: any = timeslots[i];
      if (element.value !== item.value) {
        list.push(element);
      }
    }
    setTimeslots(list);
  };

  return (
    <div className="profile-container">
      {notificationprofiles.length > 0 ? (
        notificationprofiles.map((profile: NotificationProfile, index: any) => {
          const timeslot: TimeslotData = {
            value: String(profile.timeslot.pk),
            label: profile.timeslot.name,
          };
          return (
            <Profile
              key={profile.pk}
              index={profile.pk}
              getNotificationprofiles={getNotificationprofiles}
              exist={true}
              deleteProfile={deleteProfile}
              filters={filters}
              selectedFilters={formatData(profile.filters)}
              selectedTimeslots={timeslot}
              timeslots={timeslots}
              active={profile.active}
              removeTimeslot={removeTimeslot}
              media={formatMedia(profile.media)}
              mediaKey={profile.timeslot.pk}
              unusedTimeslots={getUnusedTimeslots}
              changesMade={false}
            />
          );
        })
      ) : (
        <h5>No profiles</h5>
      )}

      {addedNotificationprofiles.length > 0 ? (
        addedNotificationprofiles.map((profile: any) => {
          return (
            <Profile
              exist={false}
              key={profile}
              index={profile}
              deleteProfile={deleteProfile}
              filters={filters}
              selectedFilters={[]}
              selectedTimeslots={{ value: "", label: "" }}
              timeslots={timeslots}
              removeTimeslot={removeTimeslot}
              media={[]}
              getNotificationprofiles={getNotificationprofiles}
              active={false}
              unusedTimeslots={getUnusedTimeslots}
              changesMade={false}
            />
          );
        })
      ) : (
        <div></div>
      )}
      <div className="add-button">
        <Fab color="primary" aria-label="add" size="large" onClick={addProfileClick}>
          <AddIcon />
        </Fab>
      </div>
    </div>
  );
};

export default ProfileList;
