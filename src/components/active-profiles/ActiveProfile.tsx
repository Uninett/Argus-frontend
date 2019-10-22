import React, { useState, useEffect } from 'react';
import './ActiveProfile.css';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import axios from 'axios';

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1)
  },
  input: {
    display: 'none'
  }
}));

type NotificationProfileType = {
  title: string;
  startDate: Date;
  endDate: Date;
  id: number;
};
type NotificationProps = {
  notificationProfiles: any;
  removeItem: any;
};

// returns "cards" of all the active profiles
const ActiveProfile: React.FC<NotificationProps> = props => {
  const classes = useStyles();
  const [profiles, setProfiles] = useState<any>(props.notificationProfiles);

  useEffect(() => {
    setProfiles(props.notificationProfiles);
  }, [props.notificationProfiles]);

  const handleRemoveProfile = (itemToRemove: NotificationProfileType) => {
    props.removeItem(itemToRemove);
  };

  const deleteProfile = async (item: any) => {
    await axios({
      url: 'http://localhost:8000/notificationprofiles/' + item.id,
      method: 'DELETE',
      headers: {
        Authorization: 'Token ' + localStorage.getItem('token')
      }
    }).then((response: any) => {
      handleRemoveProfile(item);
    });
  };

  const weekList = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  return (
    <div className='profile-container'>
      {profiles.map((item: any) => {
        return (
          <div className='item-container' key={item.id}>
            <h3>{item.title}</h3>
            <h4>{`${
              weekList[item.startDate.getDay()]
            } ${item.startDate.getHours()} – ${
              weekList[item.endDate.getDay()]
            } ${item.endDate.getHours()}`}</h4>
            <Button
              variant='contained'
              color='secondary'
              className={classes.button}
              onClick={() => deleteProfile(item)}>
              Delete
            </Button>
          </div>
        );
      })}
    </div>
  );
};

export default ActiveProfile;
