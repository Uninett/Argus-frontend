import React, { useState, useEffect } from 'react';
import Profile from '../profile/Profile';
import axios from 'axios';

const ProfileList: React.FC = () => {
  const [profiles, setProfiles] = useState<any>([]);
  const [timeslots, setTimeSlot] = useState([
    { value: 'timeslot1', label: 'timeslot1' },
    { value: 'timeslot2', label: 'timeslot2' },
    { value: 'timeslot3', label: 'timeslot3' },
    { value: 'timeslot4', label: 'timeslot4' },
    { value: 'timeslot5', label: 'timeslot5' }
  ]);

  useEffect(() => {
    getProfiles();
  }, []);

  const getProfiles = async () => {
    await axios({
      url: 'http://localhost:8000/notificationprofiles/filters',
      method: 'GET',
      headers: {
        Authorization: 'Token ' + localStorage.getItem('token')
      }
    }).then((response: any) => {
      setProfiles(formatData(response.data));
    });
  };
  console.log('dette er profilene våre', profiles);

  const formatData = (data: any) => {
    const formattedList: any = [];
    data.map((element: any) => {
      const object: any = {
        value: element.name.replace(' ', ''),
        label: element.name
      };
      formattedList.push(object);
    });
    return formattedList;
  };

  return (
    <div>
      <h1>Profiler:</h1>
      {profiles.map((profile: any, index: any ) => {
        return (
          <Profile key={index} profileNames={profiles} timeslots={timeslots} />
        );
      })}
    </div>
  );
};

export default ProfileList;
