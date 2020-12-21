import React from "react";
import { withRouter } from "react-router-dom";
import Grid from "@material-ui/core/Grid";

import TimeslotList from "../../components/timeslotlist";

const TimeslotView: React.FC = () => {
  return (
    <div className="timeslot-view-container">
      <Grid container direction="column" justify="space-evenly" alignItems="center">
        <TimeslotList />
      </Grid>
    </div>
  );
};

export default withRouter(TimeslotView);
