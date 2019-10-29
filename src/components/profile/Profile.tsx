import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';
import Dialogue from '../dialogue/Dialogue';
import Spinner from '../spinners/Spinner';

import './Profile.css';

const Profile: React.SFC = () => {
  const [filterName, setFilterName] = useState(null);
  const [timeOptions, setTimeOptions] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkBox, setCheckBox] = useState(false);

  useEffect(() => {
    setTimeOptions([
      { value: 'per', label: 'Per' },
      { value: 'bjarne', label: 'bjarne' }
    ]);
  }, []);

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
          <Select label='Single select' options={timeOptions} />
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
