import * as React from "react";
import Paper from "@material-ui/core/Paper";
import {
  Scheduler,
  WeekView,
  Appointments,
  AppointmentTooltip,
  AppointmentForm
} from "@devexpress/dx-react-scheduler-material-ui";

import appointments from "./data_copy";
import { ViewState, EditingState } from "@devexpress/dx-react-scheduler";
import { useState } from "react";

type NotificationProfilesTypes = {
  title: string;
  startDate: Date;
  endDate: Date;
  id: number;
}[];

type PropType = {};

const CalendarScheduler: React.FC<PropType> = props => {
  const [notificationProfiles, setNotificationsProfiles] = useState<
    NotificationProfilesTypes
  >(appointments);

  React.useEffect(() => {
    fetchNotificationProfiles();
  }, [notificationProfiles]);

  const fetchNotificationProfiles = async () => {
    // TODO: Do axios fetch to API
    const prof = notificationProfiles;
    setNotificationsProfiles(prof);
  };

  function onCommitChanges({ added, changed, deleted }: any) {
    if (typeof added !== "undefined") {
      const profiles = notificationProfiles;
      profiles.push(added);
      setNotificationsProfiles(profiles);

      // TODO: Save new profile to backend
    }
  }

  function onAddedAppointmentChange(addedAppointment: any) {
    console.log("Added appointment", addedAppointment);
  }

  return (
    <Paper>
      <Scheduler data={notificationProfiles} height={660}>
        <EditingState
          onCommitChanges={onCommitChanges}
          onAddedAppointmentChange={onAddedAppointmentChange}
        />
        <ViewState defaultCurrentDate={new Date(2018, 5, 25, 9, 30)} />
        <WeekView startDayHour={0} endDayHour={24} cellDuration={60} />
        <Appointments />
        <AppointmentTooltip />
        <AppointmentForm />
      </Scheduler>
    </Paper>
  );
};

export default CalendarScheduler;
