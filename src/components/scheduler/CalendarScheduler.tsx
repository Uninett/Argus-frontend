import * as React from "react";
import Paper from "@material-ui/core/Paper";
import {
  Scheduler,
  WeekView,
  Appointments,
  AllDayPanel,
  DragDropProvider,
  AppointmentTooltip,
  AppointmentForm
} from "@devexpress/dx-react-scheduler-material-ui";

import appointments from "./data";
import { ViewState, EditingState } from "@devexpress/dx-react-scheduler";

type PropType = {};

const CalendarScheduler: React.FC<PropType> = props => {
  function onCommitChanges() {
    console.log("commit changes");
  }

  function onAddedAppointmentChange() {
    console.log("Added appointment");
  }

  return (
    <Paper>
      <Scheduler data={appointments} height={660}>
        <EditingState
          onCommitChanges={onCommitChanges}
          onAddedAppointmentChange={onAddedAppointmentChange}
        />
        <ViewState defaultCurrentDate={new Date(2018, 5, 25, 9, 30)} />
        <WeekView startDayHour={0} endDayHour={24} cellDuration={60} />
        <Appointments />
        <AppointmentTooltip showOpenButton showDeleteButton />
        <AppointmentForm />
        <AllDayPanel />
      </Scheduler>
    </Paper>
  );
};

export default CalendarScheduler;
