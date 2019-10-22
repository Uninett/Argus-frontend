import React, { useState, useEffect } from "react";
import "./ActiveProfile.css";
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

type NotificationProfileType = {
  title: string;
  startDate: Date;
  endDate: Date;
  id: number;
};

// returns "cards" of all the active profiles
const ActiveProfile: React.FC = () => {
  const classes = useStyles();
  const [profiles, setProfiles] = useState<any>([]);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    await axios({
      url: "http://localhost:8000/notificationprofiles/",
      method: "GET",
      headers: {
        Authorization: "Token " + localStorage.getItem("token")
      }
    }).then((response: any) => {
      const data = response.data;
      console.log(data);
      const profilesList = serializeData(data);
      setProfiles(profilesList);
    });
  };

  const handleRemoveProfile = (itemToRemove: NotificationProfileType) => {
    setProfiles(
      profiles.filter(
        (item: NotificationProfileType) => item.id !== itemToRemove.id
      )
    );
  };

  const deleteProfile = async (item: any) => {
    console.log("Delete profile", item.id);
    await axios({
      url: "http://localhost:8000/notificationprofiles/" + item.id,
      method: "DELETE",
      headers: {
        Authorization: "Token " + localStorage.getItem("token")
      }
    }).then((response: any) => {
      handleRemoveProfile(item);
    });
  };

  // Helper function: Format JSON from API
  const serializeData = (dataFromAPI: any) => {
    const profilesList: any = [];
    for (let i = 0; i < dataFromAPI.length; i++) {
      let profile = dataFromAPI[i];
      let startDate = moment(dataFromAPI[i].interval_start)
        .format("YYYY MM DD HH mm")
        .split(" ")
        .map(function(item) {
          return parseInt(item, 10);
        });
      let endDate = moment(dataFromAPI[i].interval_stop)
        .format("YYYY MM DD HH mm")
        .split(" ")
        .map(function(item) {
          return parseInt(item, 10);
        });
      //Creating a javascript object to fit the mapping of rendered items
      let object = {
        id: dataFromAPI[i].pk,
        title: profile.name,
        startDate: new Date(
          startDate[0],
          startDate[1],
          startDate[2],
          startDate[3]
        ),
        endDate: new Date(endDate[0], endDate[1], endDate[2], endDate[3])
      };
      profilesList.push(object);
    }
    return profilesList;
  };

  const weekList = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  return (
    <div className="profile-container">
      {profiles.map((item: any) => {
        return (
          <div className="item-container" key={item.id}>
            <h3>{item.title}</h3>
            <h4>{`${
              weekList[item.startDate.getDay()]
            } ${item.startDate.getHours()} – ${
              weekList[item.endDate.getDay()]
            } ${item.endDate.getHours()}`}</h4>
            <Button
              variant="contained"
              color="secondary"
              className={classes.button}
              onClick={() => deleteProfile(item)}
            >
              Delete
            </Button>
          </div>
        );
      })}
    </div>
  );
};

export default ActiveProfile;
