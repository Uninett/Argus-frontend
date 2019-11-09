import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';
import Dialogue from '../dialogue/Dialogue';
import Spinner from '../spinners/Spinner';
import axios from 'axios';
import './Profile.css';

type ProfileProps = {
  filters: { value: string; label: string }[];
  timeslots: { value: string; label: string }[];
  selectedFilters: { value: string; label: string }[];
  selectedTimeslots: { value: string; label: string };
  active: boolean;
  deleteProfile: any;
  media: any;
  mediaKey: any;
};

const Profile: React.SFC<ProfileProps> = (props: ProfileProps) => {
  const [filterOptions, setFilterOptions] = useState(props.filters);
  const [selectedFilters, setSelectedFilters] = useState(props.selectedFilters);
  const [mediaOptions, setMediaOptions] = useState([
    { label: 'Slack', value: 'SL' },
    { label: 'Sms', value: 'SM' },
    { label: 'Email', value: 'EM' }
  ]);
  const [mediaSelected, setMediaSelected] = useState(props.media);
  const [selectedTimeslots, setSelectedTimeslots] = useState(
    props.selectedTimeslots
  );

  const [timeOptions, setTimeOptions] = useState(props.timeslots);
  const [selectedOptions, setSelectedOptions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkBox, setCheckBox] = useState(props.active);

  useEffect(() => {
    formatMedia();
  }, []);

  const formatMedia = () => {
    for (let i = 0; i < mediaOptions.length; i++) {
      const item = mediaOptions[i];
      console.log(props.media);
      console.log(item.value);

      if (item.value === props.media) {
        setMediaSelected({ value: item.value, label: item.label });
        console.log('Dette er mediaobjectet', {
          value: item.value,
          label: item.label
        });
      }
    }
  };

  const postNewProfile = async () => {
    setLoading(!loading);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    await axios({
      url: `http://localhost:8000/notificationprofiles/${selectedTimeslots.value}`,
      method: 'PUT',
      headers: {
        Authorization: 'Token ' + localStorage.getItem('token')
      },
      data: {
        time_slot_group: selectedTimeslots.value,
        filters: selectedFilters.map((f: any) => {
          return f.value;
        }),
        media: ['EM'],
        active: checkBox
      }
    });
  };

  const handleChange = (event: any) => {
    setCheckBox(event.target.checked);
  };
  const onChangeMedia = (e: any) => {
    setMediaSelected(e);
  };

  const onChangeFilters = (e: any) => {
    setSelectedFilters(e);
  };

  const onChangeTimeslots = (e: any) => {
    setSelectedTimeslots(e);
  };

  const handleDelete = async () => {
    //slett fra database her:
    await axios({
      url: `http://localhost:8000/notificationprofiles/${selectedTimeslots.value}`,
      method: 'DELETE',
      headers: {
        Authorization: 'Token ' + localStorage.getItem('token')
      }
    }).then((response: any) => {
      console.log('data er slettet');
    });
  };

  const handleSave = (event: any) => {
    setLoading(!loading);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className='notification-container'>
      <div className='check-box'>
        <h4 className='activate-box'>Active:</h4>
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
      <div className='filtername-box'>
        <div className='filtername'>
          <h4>Filtername:</h4>
        </div>
        <div className='filter-dropdown'>
          <Select
            isMulti
            defaultValue={selectedFilters}
            onChange={onChangeFilters}
            name='filters'
            label='Single select'
            options={filterOptions}
          />
        </div>
      </div>
      <div className='dropdown-timeslots'>
        <h4>Timeslots:</h4>
        <div className='timeslot-dropdown'>
          <Select
            onChange={onChangeTimeslots}
            defaultValue={selectedTimeslots}
            name='timeslots'
            options={timeOptions}
            className='basic-multi-select'
            classNamePrefix='select'
          />
        </div>
      </div>
      <div className='dropdown-media'>
        <h4>Media:</h4>
        <div className='media-dropdown'>
          <Select
            onChange={onChangeMedia}
            defaultValue={mediaSelected}
            name='timeslots'
            options={mediaOptions}
            className='basic-multi-select'
            classNamePrefix='select'
          />
        </div>
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
              onClick={postNewProfile}
              startIcon={<SaveIcon />}>
              Save
            </Button>
          )}
        </div>
        <div className='button-delete'>
          <Dialogue handleDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
