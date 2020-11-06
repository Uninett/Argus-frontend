import React from "react";
import { withRouter } from "react-router-dom";

import TimeslotList from "../../components/timeslotlist";

const TimeslotView: React.FC = () => {
  return <TimeslotList />;
};

export default withRouter(TimeslotView);
