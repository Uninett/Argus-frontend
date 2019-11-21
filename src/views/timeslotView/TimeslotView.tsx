import React from "react";
import { withRouter } from "react-router-dom";
import TimeIntervals from "../../components/time-interval/TimeIntervals";
import Header from "../../components/header/Header";

const TimeslotView: React.FC = () => {
  return (
    <div className="timeslot-view-container">
      <Header />
      <TimeIntervals />
    </div>
  );
};

export default withRouter(TimeslotView);
