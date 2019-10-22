import React, { useState, useEffect } from 'react';
import './NotificationProfileView.css';
import Header from '../../components/header/Header';
import { withRouter } from 'react-router-dom';
import CalendarScheduler from '../../components/scheduler/CalendarScheduler';
import ActiveProfile from '../../components/active-profiles/ActiveProfile';
import axios from 'axios';
import moment from 'moment';

type PropType = {
  history: any;
};
type NotificationProfileType = {
  title: string;
  startDate: Date;
  endDate: Date;
  id: number;
};

const NotificationProfileView: React.FC<PropType> = props => {
  const [notificationProfiles, setNotificationProfiles] = useState<any>([]);

  useEffect(() => {
    fetchProfiles();
  }, []);
  const fetchProfiles = async () => {
    await axios({
      url: 'http://localhost:8000/notificationprofiles/',
      method: 'GET',
      headers: {
        Authorization: 'Token ' + localStorage.getItem('token')
      }
    }).then((response: any) => {
      const data = response.data;
      const profilesList = serializeDataList(data);
      setNotificationProfiles(profilesList);
    });
  };
  // Helper function: Format JSON from API
  const serializeDataList = (dataFromAPI: any) => {
    const profilesList: any = [];
    for (let i = 0; i < dataFromAPI.length; i++) {
      let object = serializeData(dataFromAPI[i]);
      profilesList.push(object);
    }
    return profilesList;
  };

  function serializeData(datapoint: any) {
    let startDate = moment(datapoint.interval_start)
      .format('YYYY MM DD HH mm')
      .split(' ')
      .map(function(item) {
        return parseInt(item, 10);
      });
    let endDate = moment(datapoint.interval_stop)
      .format('YYYY MM DD HH mm')
      .split(' ')
      .map(function(item) {
        return parseInt(item, 10);
      });
    //Creating a javascript object to fit the mapping of rendered items
    let object = {
      id: datapoint.pk,
      title: datapoint.name,
      startDate: new Date(
        startDate[0],
        startDate[1],
        startDate[2],
        startDate[3]
      ),
      endDate: new Date(endDate[0], endDate[1], endDate[2], endDate[3])
    };
    return object;
  }
  // passed as props to ActiveProfile component. Removes item from notificationProfile
  const removeItem = (itemToRemove: NotificationProfileType) => {
    setNotificationProfiles(
      notificationProfiles.filter(
        (item: NotificationProfileType) => item.id !== itemToRemove.id
      )
    );
  };

  //Method is passed as props to Calendar component and called when new element has been added to database
  const addElement = () => {
    fetchProfiles();
  };

  return (
    <div className='notification-container'>
      <Header />
      <h1>My Active Notification Profiles</h1>
      <ActiveProfile
        notificationProfiles={notificationProfiles}
        removeItem={removeItem}
      />
      <div className='calendar'>
        <CalendarScheduler
          notificationProfiles={notificationProfiles}
          addElement={addElement}
        />
      </div>
    </div>
  );
};

export default withRouter(NotificationProfileView);
