import React, { useState, useEffect } from 'react';
import './ActiveProfile.css';
import data from '../scheduler/data_copy';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1)
  },
  input: {
    display: 'none'
  }
}));

const ActiveProfile: React.FC = () => {
  const classes = useStyles();
  const [profiles, setProfiles] = useState<any>([]);

  useEffect(() => {
    setProfiles(data);
  }, []);

  const weekList = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  return (
    <div className='profile-container'>
      {profiles.map((item: any) => {
        return (
          <div className='item-container' key={item.id}>
            <h3>{item.title}</h3>
            <h4>{`${
              weekList[item.startDate.getDay()]
            } ${item.startDate.getHours()} - ${
              weekList[item.endDate.getDay()]
            } ${item.endDate.getHours()}`}</h4>
            <Button
              variant='contained'
              color='secondary'
              className={classes.button}>
              Delete
            </Button>
          </div>
        );
      })}
    </div>
  );
};

export default ActiveProfile;
