import React from "react";
import { withRouter } from "react-router-dom";
import Header from "../../components/header/Header";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

import TimeslotList from "../../components/timeslotlist";
import TimeslotListNew from "../../components/timeslotlist/new";
import NewTimeslotComponent from "../../components/timeslot/new";

const TimeslotView: React.FC = () => {
  return (
    <div className="timeslot-view-container">
      <Header />
      <Grid container direction="column" justify="space-evenly" alignItems="center">
        <Typography variant="h3">Timeslots</Typography>
        <TimeslotList />
        <Typography variant="h3">New Timeslots</Typography>
        <TimeslotListNew />
      </Grid>
    </div>
  );
};

export default withRouter(TimeslotView);
