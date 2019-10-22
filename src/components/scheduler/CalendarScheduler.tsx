import React, { useEffect, useState } from 'react';
import Paper from '@material-ui/core/Paper';
import {
  Scheduler,
  WeekView,
  Appointments,
  AppointmentTooltip,
  AppointmentForm
} from '@devexpress/dx-react-scheduler-material-ui';
import { ViewState, EditingState } from '@devexpress/dx-react-scheduler';
import axios from 'axios';
import moment from 'moment';

type NotificationProfileType = {
  title: string;
  startDate: Date;
  endDate: Date;
  id: number;
};

type PropType = {
  notificationProfiles: any;
  addElement: any;
};

const CalendarScheduler: React.FC<PropType> = props => {
  const [notificationProfiles, setNotificationProfiles] = useState(
    props.notificationProfiles
  );
  useEffect(() => {
    setNotificationProfiles(props.notificationProfiles);
  }, [props.notificationProfiles]);
  const serializeDataToBeSent = (item: NotificationProfileType) => {
    const start = moment(item.startDate).format('YYYY-MM-DD HH:mm:ss');
    const stop = moment(item.endDate).format('YYYY-MM-DD HH:mm:ss');

    const profile = {
      name: item.title,
      interval_start: start,
      interval_stop: stop
    };
    return profile;
  };

  async function onCommitChanges({ added, changed, deleted }: any) {
    if (typeof added !== 'undefined') {
      const item = serializeDataToBeSent(added);
      await postNotificationProfile(item);

      props.addElement();
      //add element to state in View

      // TODO: Serialize the new object and
      // TODO: Add to state so that it is updated
      // const newItem = postNotificationProfile(iten);
      // const serializedNewItem = serialiace(newItem)
      // Add serializedNewItem to notificationProfiles in state
    }
  }

  const postNotificationProfile = async (item: any) => {
    await axios({
      url: 'http://localhost:8000/notificationprofiles/',
      method: 'POST',
      headers: {
        Authorization: 'Token ' + localStorage.getItem('token'),
        'content-type': 'application/json'
      },
      data: `{
        "name": "${item.name}",
        "interval_start": "${item.interval_start}",
        "interval_stop": "${item.interval_stop}"
      }`
    }).then((response: any) => {
      return response.data;
    });
  };

  return (
    <Paper>
      <Scheduler data={notificationProfiles} height={660}>
        <EditingState onCommitChanges={onCommitChanges} />
        <ViewState defaultCurrentDate={new Date(2019, 10, 24, 0, 0)} />
        <WeekView startDayHour={0} endDayHour={24} cellDuration={60} />
        <Appointments />
        <AppointmentTooltip />
        <AppointmentForm />
      </Scheduler>
    </Paper>
  );
};

export default CalendarScheduler;
