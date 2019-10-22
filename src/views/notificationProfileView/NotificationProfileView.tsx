import React from "react";
import Header from "../../components/header/Header";
import "../../components/react-table/table.css";
import { withRouter } from "react-router-dom";
import CalendarScheduler from "../../components/scheduler/CalendarScheduler";
import ActiveProfile from "../../components/active-profiles/ActiveProfile";

import appointments from "./../../components/scheduler/data_copy";

type PropType = {
  history: any;
};

const NotificationProfileView: React.FC<PropType> = props => {
  return (
    <div>
      <Header />
      <h1>My Active Notificiation Profiles</h1>
      <ActiveProfile />
      <div>
        <CalendarScheduler />
      </div>
    </div>
  );
};

export default withRouter(NotificationProfileView);
