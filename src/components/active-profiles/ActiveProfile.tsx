import React, { useState, useEffect } from "react";
import "./ActiveProfile.css";
//import data from "../scheduler/data_copy";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import axios from "axios";
import moment from "moment";

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1)
  },
  input: {
    display: "none"
  }
}));

const ActiveProfile: React.FC = () => {
  const classes = useStyles();
  const [profiles, setProfiles] = useState<any>([]);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    await axios({
      url: "http://localhost:8000/notificationprofile/all",
      method: "GET",
      headers: {
        Authorization: "Token " + localStorage.getItem("token")
      }
    }).then((response: any) => {
      const data = response.data;
      const profilesList = serializeData(data);
      setProfiles(profilesList);
    });
  };

  // Format JSON from API
  const serializeData = (dataFromAPI: any) => {
    const profilesList: any = [];
    for (let i = 0; i < dataFromAPI.length; i++) {
      let profile = dataFromAPI[i].fields;
      let startDate = moment(dataFromAPI[i].fields.interval_start).format(
        "YYYY-MM-DD HH:mm"
      );
      let endDate = moment(dataFromAPI[i].fields.interval_stop).format(
        "YYYY-MM-DD HH:mm"
      );

      profile.startDate = startDate;
      profile.endDate = endDate;

      profilesList.push(dataFromAPI[i].fields);
    }

    return profilesList;
  };

  const weekList = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  return (
    <div className="profile-container">
      {/* {profiles.map((item: any) => {
        return (
          <div className="item-container" key={item.id}>
            <h3>{item.title}</h3>
            <h4>{`${
              weekList[item.startDate.getDay()]
            } ${item.startDate.getHours()} - ${
              weekList[item.endDate.getDay()]
            } ${item.endDate.getHours()}`}</h4>
            <Button
              variant="contained"
              color="secondary"
              className={classes.button}
            >
              Delete
            </Button>
          </div>
        );
      })} */

      profiles.map((item: any) => {
        return <div key={item.id}>{item.name}</div>;
      })}
    </div>
  );
};

export default ActiveProfile;
