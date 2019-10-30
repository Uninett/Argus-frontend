import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';
import Dialogue from '../dialogue/Dialogue';
import Spinner from '../spinners/Spinner';
import './Profile.css';

type ProfileProps = {
  profileNames?: { value: string; label: string }[];
  timeslots?: { value: string; label: string }[];
};

const Profile: React.SFC<ProfileProps> = (props: ProfileProps) => {
  const [filterNameOption, setFilterNameOption] = useState(props.profileNames);
  const [selectedFilterName, setSelectedFilterName] = useState(null);
  const [timeOptions, setTimeOptions] = useState(props.timeslots);
  const [selectedOptions, setSelectedOptions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkBox, setCheckBox] = useState(false);

  const handleChange = (event: any) => {
    setCheckBox(event.target.checked);
  };

  const onChange = (e: any) => {
    setSelectedOptions(e);
  };

  const handleSave = (event: any) => {
    setLoading(!loading);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className='notification-container'>
      <div className='filtername-box'>
        <div className='filtername'>
          <h4>Filtername:</h4>
        </div>
        <div className='filter-dropdown'>
          <Select
            isMulti
            onChange={onChange}
            name='filters'
            label='Single select'
            options={filterNameOption}
          />
        </div>
      </div>
      <div className='dropdown'>
        <h4>Timeslots:</h4>
        <div className='timeslot-dropdown'>
          <Select
            isMulti
            onChange={onChange}
            name='timeslots'
            options={timeOptions}
            className='basic-multi-select'
            classNamePrefix='select'
          />
        </div>
      </div>
      <div className='check-box'>
        <h4 className='activate-box'>active:</h4>
        <Checkbox
          checked={checkBox}
          onChange={handleChange}
          value='checkBox'
          color='primary'
          inputProps={{
            'aria-label': 'secondary checkbox'
          }}
        />
      </div>
      <div className='buttons-container'>
        <div className='button-save'>
          {loading ? (
            <Spinner />
          ) : (
            <Button
              variant='contained'
              color='primary'
              size='small'
              onClick={handleSave}
              startIcon={<SaveIcon />}>
              Save
            </Button>
          )}
        </div>
        <div className='button-delete'>
          <Dialogue />
        </div>
      </div>
    </div>
  );
};

export default Profile;
