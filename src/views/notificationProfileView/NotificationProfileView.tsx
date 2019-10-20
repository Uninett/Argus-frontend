import React from "react";
import Header from "../../components/header/Header";
import "../../components/react-table/table.css";
import { withRouter } from "react-router-dom";
import CalendarScheduler from "../../components/scheduler/CalendarScheduler";

import appointments from "./../../components/scheduler/data_copy";

type PropType = {
  history: any;
};

const NotificationProfileView: React.FC<PropType> = props => {
  return (
    <div>
      <Header />
      <h1>Notification Profile View</h1>
      <div>
        {" "}
        {appointments.map(a => (
          <div key={a.id}>
            <h2>{a.title}</h2>
            <p style={{ fontSize: "14px" }}>
              {"" + a.startDate + " " + a.endDate}
            </p>
          </div>
        ))}{" "}
      </div>
      <div style={{ maxWidth: "75%" }}>
        <CalendarScheduler />
      </div>
    </div>
  );
};

export default withRouter(NotificationProfileView);
