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
  index?: number;
  deleteProfile: any;
  media?: any;
  mediaKey?: any;
  exist: boolean;
  unusedTimeSlots: any;
  getNotificationprofiles: any;
  removeTimeslot: any;
  changesMade: boolean;
};

const Profile: React.SFC<ProfileProps> = (props: ProfileProps) => {
  const [filterOptions, setFilterOptions] = useState(props.filters);
  const [selectedFilters, setSelectedFilters] = useState(props.selectedFilters);
  const [mediaOptions, setMediaOptions] = useState([
    { label: 'Slack', value: 'SL' },
    { label: 'Sms', value: 'SM' },
    { label: 'Email', value: 'EM' }
  ]);
  const [exist, setExist] = useState(props.exist);
  const [mediaSelected, setMediaSelected] = useState(props.media);
  const [selectedTimeslots, setSelectedTimeslots] = useState(
    props.selectedTimeslots
  );
  const [id, setId] = useState(null);
  const [timeOptions, setTimeOptions] = useState<any>(props.timeslots);
  const [loading, setLoading] = useState(false);
  const [checkBox, setCheckBox] = useState(props.active);
  const [changesMade, setChangesMade] = useState(props.changesMade);

  useEffect(() => {
    if (props.exist) {
      setTimeOptions([props.selectedTimeslots]);
    } else if (!props.exist) {
      const timeslots: any = props.unusedTimeSlots();
      setTimeOptions(timeslots);
    }
  }, []);

  const postNewProfile = async () => {
    if (
      selectedTimeslots &&
      mediaSelected.length > 0 &&
      selectedFilters.length > 0
    ) {
      if (exist || id) {
        setLoading(!loading);
        setTimeout(() => {
          setLoading(false);
        }, 1000);
        setChangesMade(false);
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
            media: mediaSelected.map((media: any) => {
              return media.value;
            }),
            active: checkBox
          }
        }).catch((response: any) => {
          alert('Timeslot is already in use or profile could not be saved');
        });
      } else {
        setLoading(!loading);
        setTimeout(() => {
          setLoading(false);
        }, 1000);
        await axios({
          url: `http://localhost:8000/notificationprofiles/`,
          method: 'POST',
          headers: {
            Authorization: 'Token ' + localStorage.getItem('token')
          },
          data: {
            time_slot_group: selectedTimeslots.value,
            filters: selectedFilters.map((f: any) => {
              return f.value;
            }),
            media: mediaSelected.map((media: any) => {
              return media.value;
            }),
            active: checkBox
          }
        })
          .then((response: any) => {
            setId(response.data.pk);
            setTimeOptions([selectedTimeslots]);
            props.removeTimeslot(selectedTimeslots);
          })
          .catch((error: any) => {
            alert('Timeslot is already in use or profile could not be saved');
          });
      }
    } else alert('Missing values');
  };

  const handleChange = (event: any) => {
    setChangesMade(true);
    setCheckBox(event.target.checked);
  };
  const onChangeMedia = (e: any) => {
    setChangesMade(true);
    setMediaSelected(e);
  };

  const onChangeFilters = (e: any) => {
    setChangesMade(true);
    setSelectedFilters(e);
  };

  const onChangeTimeslots = (e: any) => {
    setChangesMade(true);
    setSelectedTimeslots(e);
  };

  const handleDelete = async () => {
    //slett fra database her:
    if (props.mediaKey) {
      await axios({
        url: `http://localhost:8000/notificationprofiles/${selectedTimeslots.value}`,
        method: 'DELETE',
        headers: {
          Authorization: 'Token ' + localStorage.getItem('token')
        }
      }).then((response: any) => {
        props.deleteProfile(props.index, false);
      });
    } else {
      props.deleteProfile(props.index, true);
    }
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
        <div className='filter-dropdown multi-select'>
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
        <div className='media-dropdown multi-select'>
          <Select
            isMulti
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
          ) : (changesMade ? (
            <Button
              variant='contained'
              color='primary'
              size='small'
              onClick={postNewProfile}
              startIcon={<SaveIcon />}>
              Save
            </Button>) : (
              <Button
              disabled
              variant='contained'
              color='primary'
              size='small'
              startIcon={<SaveIcon />}>
              Save
            </Button>
            ))
          }
        </div>
        <div className='button-delete'>
          <Dialogue handleDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
