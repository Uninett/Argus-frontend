import React, { useState, useEffect } from 'react';
import './ProfileList.css';
import Profile from '../profile/Profile';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import axios from 'axios';

const ProfileList: React.FC = () => {
  const [notificationprofiles, setNotificationprofiles] = useState([]);
  const [addedNotificationprofiles, setaddedNotificationprofiles] = useState(
    []
  );
  const [newProfileCounter, setNewProfileCounter] = useState(0);
  const [filters, setFilters] = useState<any>([]);
  const [timeslots, setTimeslots] = useState<any>([]);
  const [mediaOptions, setMediaOptions] = useState([
    { label: 'Slack', value: 'SL' },
    { label: 'Sms', value: 'SM' },
    { label: 'Email', value: 'EM' }
  ]);

  useEffect(() => {
    getNotificationprofiles();
    getFilters();
    getTimeslots();
  }, []);

  //fetch all notificationprofiles
  const getNotificationprofiles = async () => {
    await axios({
      url: 'http://localhost:8000/notificationprofiles/',
      method: 'GET',
      headers: {
        Authorization: 'Token ' + localStorage.getItem('token')
      }
    }).then((response: any) => {
      setNotificationprofiles(response.data);
    });
  };
  //fetch all filters
  const getFilters = async () => {
    await axios({
      url: 'http://localhost:8000/notificationprofiles/filters/',
      method: 'GET',
      headers: {
        Authorization: 'Token ' + localStorage.getItem('token')
      }
    }).then((response: any) => {
      setFilters(formatData(response.data));
    });
  };

  //fetch all timeslots
  const getTimeslots = async () => {
    await axios({
      url: 'http://localhost:8000/notificationprofiles/timeslotgroups/',
      method: 'GET',
      headers: {
        Authorization: 'Token ' + localStorage.getItem('token')
      }
    }).then((response: any) => {
      setTimeslots(formatData(response.data));
    });
  };

  const formatData = (data: any) => {
    const formattedList: any = [];
    data.map((element: any) => {
      const object: any = {
        value: element.pk,
        label: element.name
      };
      formattedList.push(object);
    });
    return formattedList;
  };

  const deleteProfile = (num: number, isNew: boolean) => {
    if (isNew) {
      const prof: any = [...addedNotificationprofiles];
      const index: number = prof.indexOf(num);
      prof.splice(index, 1);

      setaddedNotificationprofiles(prof);
    } else {
      const prof: any = [...notificationprofiles];
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
            label: item.label
          };
          matchedMedia.push(object);
        }
      }
    }
    return matchedMedia;
  };

  const addProfileClick = () => {
    console.log(timeslots.length);
    if (getUnusedTimeslots().length > 0) {
      const newProfiles: number[] = addedNotificationprofiles;
      newProfiles.push(newProfileCounter);
      setNewProfileCounter(newProfileCounter + 1);
    } else alert('All timeslots are in use');
  };

  const getUnusedTimeslots = () => {
    if (notificationprofiles.length > 0 && timeslots.length > 0) {
      const timeslotsProfile: any = [];
      for (let i = 0; i < notificationprofiles.length; i++) {
        const element: any = notificationprofiles[i];
        timeslotsProfile.push(element.time_slot_group.pk);
      }
      const timeslotNames: any = [];
      timeslots.map((timeslot: any) => {
        timeslotNames.push(timeslot.value);
      });

      console.log('dette er timeslotNames:', timeslotNames);
      const difference: any = timeslotsProfile
        .filter((x: any) => !timeslotNames.includes(x))
        .concat(
          timeslotNames.filter((x: any) => !timeslotsProfile.includes(x))
        );
      console.log('dette er forskjellen i lista', difference);
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
      console.log(newList);
      return newList;
    }
  };
  const removeTimeslot = (item: any) => {
    const list: any = [];
    for (let i = 0; i < timeslots.length; i++) {
      const element: any = timeslots[i];
      if (element.value != item.value) {
        list.push(element);
      }
    }
    setTimeslots(list);
  };

  return (
    <div className='profile-container'>
      {notificationprofiles.length > 0 ? (
        notificationprofiles.map((profile: any, index: any) => {
          const timeslot: any = {
            value: profile.time_slot_group.pk,
            label: profile.time_slot_group.name
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
              mediaKey={profile.time_slot_group.pk}
              unusedTimeSlots={getUnusedTimeslots}
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
              selectedTimeslots={{ value: '', label: '' }}
              timeslots={timeslots}
              removeTimeslot={removeTimeslot}
              media={[]}
              getNotificationprofiles={getNotificationprofiles}
              active={false}
              unusedTimeSlots={getUnusedTimeslots}
            />
          );
        })
      ) : (
        <h1></h1>
      )}
      <div className='add-button'>
        <Fab
          color='primary'
          aria-label='add'
          size='large'
          onClick={addProfileClick}>
          <AddIcon />
        </Fab>
      </div>
    </div>
  );
};

export default ProfileList;