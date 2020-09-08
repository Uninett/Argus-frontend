import React from "react";
import "./SettingsView.css";
import Header from "../../components/header/Header";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { withRouter } from "react-router-dom";

import PhoneNumberList from "../../components/phonenumberlist";

const SettingsView: React.FC = () => {
  return (
    <div>
      <header>
        <Header />
      </header>
      <h1>Settings</h1>
      <Grid container direction="column" justify="space-evenly" alignItems="center">
        <Typography variant="h5">Phone numbers</Typography>
        <PhoneNumberList />
      </Grid>
    </div>
  );
};

export default withRouter(SettingsView);
