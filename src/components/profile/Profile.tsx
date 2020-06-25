import React, { useState, useEffect } from "react";
import Select from "react-select";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import Dialogue from "../dialogue/Dialogue";
import Spinner from "../spinners/Spinner";
import "./Profile.css";
import api, { NotificationProfilePK } from "../../api";

type ProfileProps = {
  filters: { value: string; label: string }[];
  timeslots: { value: string; label: string }[];
  selectedFilters: { value: string; label: string }[];
  selectedTimeslots: { value: string; label: string };
  active: boolean;
  index?: number;
  deleteProfile: (index: number, something: boolean) => void;
  media?: any;
  mediaKey?: any;
  exist: boolean;
  unusedTimeslots: any;
  getNotificationprofiles: any;
  removeTimeslot: any;
  changesMade: boolean;
};

const Profile: React.SFC<ProfileProps> = (props: ProfileProps) => {
  const filterOptions = props.filters;
  const [selectedFilters, setSelectedFilters] = useState(props.selectedFilters);
  const mediaOptions = [
    { label: "Slack", value: "SL" },
    { label: "SMS", value: "SM" },
    { label: "Email", value: "EM" },
  ];
  const exist = props.exist;
  const [mediaSelected, setMediaSelected] = useState(props.media);
  const [selectedTimeslots, setSelectedTimeslots] = useState(props.selectedTimeslots);
  const [notificationProfileId, setNotificationProfileId] = useState<NotificationProfilePK | undefined>(undefined);
  const [timeOptions, setTimeOptions] = useState<any>(props.timeslots);
  const [loading, setLoading] = useState(false);
  const [checkBox, setCheckBox] = useState(props.active);
  const [changesMade, setChangesMade] = useState(props.changesMade);

  useEffect(() => {
    if (props.exist) {
      setTimeOptions([props.selectedTimeslots]);
    } else if (!props.exist) {
      const timeslots: any = props.unusedTimeslots();
      setTimeOptions(timeslots);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const postNewProfile = async () => {
    if (selectedTimeslots && mediaSelected.length > 0 && selectedFilters.length > 0) {
      setLoading(!loading);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
      setChangesMade(false);

      const timeslot = selectedTimeslots.value;
      const filters = selectedFilters.map((f: any) => {
        return f.value;
      });
      const media = mediaSelected.map((media: any) => {
        return media.value;
      });
      const active = checkBox;

      const promise =
        exist || notificationProfileId
          ? api.putNotificationProfile(timeslot, filters, media, active)
          : api.postNotificationProfile(timeslot, filters, media, active);

      promise
        .then((notificationProfile) => {
          setNotificationProfileId(notificationProfile.pk);
          setTimeOptions([selectedTimeslots]);
          props.removeTimeslot(selectedTimeslots);
        })
        .catch((error) => {
          alert(`Timeslot is already in use or profile could not be saved: ${error}`);
        });
    } else {
      alert("Missing values");
      return;
    }
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
    if (props.index === undefined) {
      // Why is this nullable
      return;
    }

    const index: number = props.index;

    //slett fra database her:
    if (props.mediaKey) {
      api
        .deleteNotificationProfile(selectedTimeslots.value)
        .then((success) => success && props.deleteProfile(index, false));
    } else if (props.index !== undefined) {
      props.deleteProfile(index, true);
    }
  };

  return (
    <div className="notification-container">
      <div className="check-box">
        <h4 className="activate-box">Active:</h4>
        <Checkbox
          checked={checkBox}
          onChange={handleChange}
          value="checkBox"
          color="primary"
          inputProps={{
            "aria-label": "secondary checkbox",
          }}
        />
      </div>
      <div className="filtername-box">
        <div className="filtername">
          <h4>Filtername:</h4>
        </div>
        <div className="filter-dropdown multi-select">
          <Select
            isMulti
            defaultValue={selectedFilters}
            onChange={onChangeFilters}
            name="filters"
            label="Single select"
            options={filterOptions}
          />
        </div>
      </div>
      <div className="dropdown-timeslots">
        <h4>Timeslots:</h4>
        <div className="timeslot-dropdown">
          <Select
            onChange={onChangeTimeslots}
            defaultValue={selectedTimeslots}
            name="timeslots"
            options={timeOptions}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
      </div>
      <div className="dropdown-media">
        <h4>Media:</h4>
        <div className="media-dropdown multi-select">
          <Select
            isMulti
            onChange={onChangeMedia}
            defaultValue={mediaSelected}
            name="timeslots"
            options={mediaOptions}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
      </div>
      <div className="buttons-container">
        <div className="button-save">
          {loading ? (
            <Spinner />
          ) : changesMade ? (
            <Button variant="contained" color="primary" size="small" onClick={postNewProfile} startIcon={<SaveIcon />}>
              Save
            </Button>
          ) : (
            <Button disabled variant="contained" color="primary" size="small" startIcon={<SaveIcon />}>
              Save
            </Button>
          )}
        </div>
        <div className="button-delete">
          <Dialogue handleDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
