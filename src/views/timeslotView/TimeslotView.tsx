import React from "react";
import { withRouter } from "react-router-dom";
import Timeslots from "../../components/timeslots/Timeslots";
import Header from "../../components/header/Header";

const TimeslotView: React.FC = () => {
  return (
    <div className="timeslot-view-container">
      <Header />
      <Timeslots />
    </div>
  );
};

export default withRouter(TimeslotView);
