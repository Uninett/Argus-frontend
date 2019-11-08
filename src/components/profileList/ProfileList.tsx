import React, { useState, useEffect } from 'react';
import './ProfileList.css';
import Profile from '../profile/Profile';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import axios from 'axios';

const ProfileList: React.FC = () => {
  const [notificationprofiles, setNotificationprofiles] = useState([]);
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
      console.log(response.data);
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
      console.log('dette er filterene vi får:', response.data);
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
      console.log('dette er timeslots vi får:', response.data);
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

  const deleteProfile = (num: number) => {
    const prof: any = notificationprofiles;
    console.log('Dette er orginallista', notificationprofiles);
    prof.splice(num, 1);
    console.log('Dette er listen uten elementet', prof);
    setNotificationprofiles(prof);
  };

  const addNotificationprofile = () => {
    const profiles: any = notificationprofiles;
    const object: any = { active: false, filters: [], time_slot_group: [] };
    profiles.push();
  };
  const formatMedia = (media: string) => {
    for (let i = 0; i < mediaOptions.length; i++) {
      const item = mediaOptions[i];
      if (item.value === media) {
        return {
          value: item.value,
          label: item.label
        };
      }
    }
  };

  return (
    <div className='profile-container'>
      <h1>Profiler:</h1>
      {notificationprofiles.map((profile: any, index: any) => {
        const timeslot: any = {
          value: profile.time_slot_group.pk,
          label: profile.time_slot_group.name
        };
        return (
          <Profile
            key={profile.pk}
            deleteProfile={deleteProfile}
            filters={filters}
            selectedFilters={formatData(profile.filters)}
            selectedTimeslots={timeslot}
            timeslots={timeslots}
            active={profile.active}
            media={formatMedia(profile.media[0])}
            mediaKey={profile.time_slot_group.pk}
          />
        );
      })}
      <div className='add-button'>
        <Fab color='primary' aria-label='add' size='large'>
          <AddIcon />
        </Fab>
      </div>
    </div>
  );
};

export default ProfileList;
