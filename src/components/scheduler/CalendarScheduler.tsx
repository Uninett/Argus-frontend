import * as React from "react";
import Paper from "@material-ui/core/Paper";
import {
  Scheduler,
  WeekView,
  Appointments,
  AllDayPanel,
  AppointmentTooltip,
  AppointmentForm
} from "@devexpress/dx-react-scheduler-material-ui";

import appointments from "./data_copy";
import { ViewState, EditingState } from "@devexpress/dx-react-scheduler";
import { useState } from "react";

type PropType = {};

const CalendarScheduler: React.FC<PropType> = props => {
  const [notificationProfiles, setNotificationsProfiles] = useState<Object[]>(
    []
  );

  React.useEffect(() => {
    fetchNotificationProfiles();
  }, []);

  const fetchNotificationProfiles = async () => {
    // Do axios fetch to API
  };

  function onCommitChanges({ added, changed, deleted }: any) {
    console.log(
      "commit changes",
      "added",
      added,
      "changed",
      changed,
      "deleted",
      deleted
    );
  }

  function onAddedAppointmentChange(addedAppointment: any) {
    console.log("Added appointment", addedAppointment);
  }

  function onAppointmentChangesChange(changedAppointment: any) {
    console.log("Changed appointment", changedAppointment);
  }

  return (
    <Paper>
      <Scheduler data={appointments} height={660}>
        <EditingState
          onCommitChanges={onCommitChanges}
          onAddedAppointmentChange={onAddedAppointmentChange}
          onAppointmentChangesChange={onAppointmentChangesChange}
        />
        <ViewState defaultCurrentDate={new Date(2018, 5, 25, 9, 30)} />
        <WeekView startDayHour={0} endDayHour={24} cellDuration={60} />
        <Appointments />
        <AppointmentTooltip />
        <AppointmentForm />
        <AllDayPanel />
      </Scheduler>
    </Paper>
  );
};

export default CalendarScheduler;
