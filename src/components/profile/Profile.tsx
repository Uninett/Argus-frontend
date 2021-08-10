import React, { useState } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import DeleteIcon from "@material-ui/icons/Delete";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import Spinning from "../spinning";
import { makeConfirmationButton } from "../buttons/ConfirmationButton";

import "./Profile.css";
import type {
  NotificationProfile,
  NotificationProfilePK,
  NotificationProfileKeyed,
  Filter,
  FilterPK,
  Timeslot,
  TimeslotPK,
  MediaAlternative,
  PhoneNumber,
  TimeRecurrence,
} from "../../api/types.d";
import { useStateWithDynamicDefault, pkGetter, toMap } from "../../utils";
import Selector from "../selector";
import { Box, Card, CardActions, createStyles, FormControlLabel, MenuItem, TextField } from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Select from "@material-ui/core/Select";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Autocomplete } from "@material-ui/lab";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";

const useStyles = makeStyles(() =>
  createStyles({
    cardActions: {
      display: "flex",
      flexWrap: "wrap",
    },
    gridItem: {
      display: "flex",
      flexDirection: "column",
    },
    itemHeader: {
      paddingBottom: "5px",
      fontWeight: 600,
    },
    phoneNumber: {
      display: "flex",
      alignItems: "flex-start",
    },
    phoneNumberSelect: {
      flexGrow: 1,
      marginRight: "10px",
    },
    buttonGroup: {
      marginLeft: "auto",
    },
    deleteButton: {
      marginLeft: "8px",
      color: "white",
      backgroundColor: "var(--warning)",
    },
    addPhoneNumberButton: {
      padding: "4px",
    },
  }),
);

type ProfileProps = {
  // if not set this means that it doesn't exist in the database
  pk?: NotificationProfilePK;
  disabled?: boolean;

  active: boolean;
  exists?: boolean;
  unsavedChanges: boolean;

  filters: Map<FilterPK, Filter>;
  timeslots: Map<TimeslotPK, Timeslot>;
  phoneNumbers: PhoneNumber[];

  // TODO: Rename to media here (plural of medium),
  // and rename MediaAlternative to Medium
  mediums: { label: string; value: MediaAlternative }[];

  selectedFilters: Filter[];
  selectedMediums: MediaAlternative[];
  selectedTimeslot?: Timeslot;

  phoneNumber: PhoneNumber | null;

  isTimeslotInUse: (timeslot: Timeslot) => boolean;

  onSavedDelete: (pk: NotificationProfilePK) => void;
  onNewDelete: (pk?: NotificationProfilePK) => void;

  onSavedUpdate: (profile: NotificationProfile) => void;
  onNewCreate: (profile: Omit<NotificationProfileKeyed, "pk">) => void;

  onUpdate?: (profile: Partial<NotificationProfile>) => void;
};

const Profile: React.FC<ProfileProps> = ({
  pk,
  disabled,
  active,
  exists,
  unsavedChanges,

  filters,
  timeslots,
  mediums,
  phoneNumbers,

  selectedMediums,
  selectedFilters,
  selectedTimeslot,

  phoneNumber,
  isTimeslotInUse,

  onNewDelete,
  onSavedDelete,

  onNewCreate,
  onSavedUpdate,
}: ProfileProps) => {
  const [hasChanged, setHasChanged] = useStateWithDynamicDefault<boolean>(unsavedChanges);
  const [isDisabled, setIsDisabled] = useStateWithDynamicDefault<boolean | undefined>(disabled);

  const [changedTimeslot, setChangedTimeslot] = useState<boolean>(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [profile, setProfile] = useState<Partial<NotificationProfile>>({
    active,
    filters: [...selectedFilters.values()],
    timeslot: selectedTimeslot,
    media: [...selectedMediums.values()],
    // eslint-disable-next-line @typescript-eslint/camelcase
    phone_number: phoneNumber,
  });

  const saveProfile = async (profile: Partial<NotificationProfile>) => {
    if (
      profile &&
      profile.active !== undefined &&
      profile.filters !== undefined &&
      profile.media !== undefined &&
      profile.timeslot !== undefined &&
      profile.phone_number !== undefined
    ) {
      if (exists && pk !== undefined && !changedTimeslot) {
        setIsDisabled(true);
        onSavedUpdate({
          pk: pk,
          timeslot: profile.timeslot,
          filters: profile.filters,
          media: profile.media,
          active: profile.active,
          // eslint-disable-next-line @typescript-eslint/camelcase
          phone_number: profile.phone_number,
        });
      } else {
        setIsDisabled(true);
        if (exists && pk !== undefined && changedTimeslot) {
          // Delete the previous profile using the old timeslot.
          // TODO: This could probably be done better.
          onSavedDelete(pk);
          setChangedTimeslot(false);
        }
        onNewCreate({
          timeslot: profile.timeslot.pk,
          filters: profile.filters.map((filter: Filter): FilterPK => pkGetter<FilterPK, Filter>(filter)),
          media: profile.media,
          active: profile.active,
          // eslint-disable-next-line @typescript-eslint/camelcase
          phone_number: profile.phone_number ? profile.phone_number.pk : null,
        });
      }
      // setHasChanged(false);
    } else {
      // TODO: maybe disable the save button or something?
      console.log("not all values set, cannot create");
      console.log(profile);
      setProfile(profile);
    }
  };

  function onSelectTimeslot(timeslot?: Timeslot | Timeslot[]) {
    if (Array.isArray(timeslot)) {
      return;
    }

    if (selectedTimeslot === undefined || (timeslot && selectedTimeslot.pk !== timeslot.pk)) {
      setHasChanged(true);
      setChangedTimeslot(true); // this requires a post instead of a put
      setProfile((profile: Partial<NotificationProfile>) => ({ ...profile, timeslot }));
    }
  }

  function onSelectFilters(selectedFilters?: Filter | Filter[]) {
    if (!Array.isArray(selectedFilters) || !selectedFilters) {
      setHasChanged(true);
      setProfile((profile: Partial<NotificationProfile>) => {
        return { ...profile, filters: [] };
      });
      return;
    }

    if (selectedFilters !== profile.filters) {
      setHasChanged(true);
      setProfile((profile: Partial<NotificationProfile>) => {
        return { ...profile, filters: selectedFilters || [] };
      });
    }
  }

  function onSelectMediums(selectedMediums?: SelectorMediaAlternative | SelectorMediaAlternative[]) {
    if (!Array.isArray(selectedMediums) || !selectedMediums) {
      setHasChanged(true);
      setProfile((profile: Partial<NotificationProfile>) => {
        return { ...profile, media: [] };
      });
      return;
    }

    const mediums = (selectedMediums || []).map((medium: SelectorMediaAlternative) => medium.pk);
    if (mediums !== profile.media) {
      setHasChanged(true);
      setProfile((profile: Partial<NotificationProfile>) => {
        return { ...profile, media: mediums };
      });
    }
  }

  function onSelectPhoneNumber(phoneNumbers?: SelectorPhoneNumberAlternative | SelectorPhoneNumberAlternative[]) {
    if (Array.isArray(phoneNumbers)) {
      // NOT SUPPORTED ?
      return;
    }

    setHasChanged(true);
    setProfile((profile: Partial<NotificationProfile>) => {
      // eslint-disable-next-line @typescript-eslint/camelcase
      return { ...profile, phone_number: phoneNumbers?.phoneNumber || null || null };
    });
    return;
  }

  function onActiveChanged() {
    setHasChanged(true);
    setProfile((profile: Partial<NotificationProfile>) => {
      return { ...profile, active: !!!profile.active };
    });
  }

  // TODO: only temporary for testing with already used ProfileList
  const enabledFiltersKeys: Set<FilterPK> = new Set<FilterPK>(
    (profile.filters || []).map((filter: Filter) => filter.pk),
  );
  const enabledTimeslotKeys: Set<TimeslotPK> = new Set<TimeslotPK>(profile.timeslot ? [profile.timeslot.pk] : []);

  type SelectorMediaAlternative = {
    pk: MediaAlternative;
    name: string;
  };
  function mediumsToOptions(mediums: { label: string; value: MediaAlternative }[]): SelectorMediaAlternative[] {
    return mediums.map((medium: { label: string; value: MediaAlternative }) => ({
      pk: medium.value,
      name: medium.label,
    }));
  }

  type SelectorPhoneNumberAlternative = {
    pk: string;
    name: string;
    phoneNumber: PhoneNumber;
  };

  function phoneNumbersToOptions(phoneNumbers: PhoneNumber[]): SelectorPhoneNumberAlternative[] {
    return phoneNumbers.map((phoneNumber: PhoneNumber) => ({
      pk: phoneNumber.pk.toString(), // must convert to string and back...
      name: phoneNumber.phone_number,
      phoneNumber,
    }));
  }

  const isNew = (): boolean => {
    return (!exists && !pk) || changedTimeslot;
  };

  const saveButtonMsg = (): string => {
    return isNew() ? (updateLoading ? "Creating" : "Create") : updateLoading ? "Saving" : "Save";
  };

  const deleteButtonMsg = (): string => {
    return isNew() ? (deleteLoading ? "Aborting" : "Abort") : deleteLoading ? "Deleting" : "Delete";
  };

  const DeleteProfileConfirmationButton = makeConfirmationButton({
    title: `${deleteButtonMsg()} profile`,
    question: "Are you sure you want to remove this profile?",
    onConfirm: () => {
      setIsDisabled(true);
      setDeleteLoading(true);
      if (pk) {
        onSavedDelete(pk);
      } else onNewDelete(undefined);
    },
  });

  return (
    <div className="notification-container">
      <div className="check-box">
        <h4 className="activate-box">Active:</h4>
        <Checkbox
          checked={profile.active}
          onChange={onActiveChanged}
          value="checkBox"
          color="primary"
          inputProps={{
            "aria-label": "secondary checkbox",
          }}
          disabled={isDisabled}
        />
      </div>
      <div className="filtername-box">
        <div className="filtername">
          <h4>Filtername:</h4>
        </div>
        <div className="filter-dropdown multi-select">
          <Selector<Filter, FilterPK>
            key={"filterselector"}
            multiSelect
            options={filters}
            enabledOptionsKeys={enabledFiltersKeys}
            onSelectChange={onSelectFilters}
            disabled={isDisabled}
          />
        </div>
      </div>
      <div className="dropdown-timeslots">
        <h4>Timeslots:</h4>
        <div className="timeslot-dropdown">
          <Selector<Timeslot, TimeslotPK>
            key={"timeslotselector"}
            options={timeslots}
            enabledOptionsKeys={enabledTimeslotKeys}
            onSelectChange={onSelectTimeslot}
            isOptionDisabled={(timeslot: Timeslot): boolean => isTimeslotInUse(timeslot)}
            disabled={isDisabled}
          />
        </div>
      </div>
      <div className="dropdown-media">
        <h4>Media:</h4>
        <div className="dropdown-media multi-select">
          <Selector<SelectorMediaAlternative, MediaAlternative>
            multiSelect
            key={"mediaselector"}
            options={toMap<MediaAlternative, SelectorMediaAlternative>(
              mediumsToOptions(mediums),
              (mediumOption: SelectorMediaAlternative) => mediumOption.pk,
            )}
            enabledOptionsKeys={new Set<MediaAlternative>([...selectedMediums.values()])}
            onSelectChange={onSelectMediums}
            disabled={isDisabled}
          />
        </div>
      </div>
      <div className="dropdown-phonenumber">
        <h4>Phone number:</h4>
        <div className="dropdown-media multi-select">
          <Selector<SelectorPhoneNumberAlternative, PhoneNumber["phone_number"]>
            key={"phonenumberselector"}
            options={toMap<string, SelectorPhoneNumberAlternative>(phoneNumbersToOptions(phoneNumbers), pkGetter)}
            enabledOptionsKeys={
              profile.phone_number ? new Set<string>([profile.phone_number.pk.toString()]) : new Set()
            }
            onSelectChange={onSelectPhoneNumber}
            disabled={isDisabled}
          />
        </div>
      </div>
      <div className="buttons-container">
        <div className="button-save">
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => {
              setUpdateLoading(true);
              saveProfile(profile);
            }}
            startIcon={updateLoading ? <Spinning shouldSpin /> : <SaveIcon />}
            disabled={!hasChanged || isDisabled}
          >
            {saveButtonMsg()}
          </Button>
        </div>
        <div className="button-delete">
          <DeleteProfileConfirmationButton
            variant="contained"
            color="secondary"
            size="small"
            startIcon={deleteLoading ? <Spinning shouldSpin /> : <DeleteIcon />}
            disabled={isDisabled}
          >
            {deleteButtonMsg()}
          </DeleteProfileConfirmationButton>
        </div>
      </div>
    </div>
  );
};

type NotificationProfileCardPropsType = {
  profile: NotificationProfileKeyed;
  timeslots: Timeslot[];
  filters: Filter[];
  // TODO: create new type?
  mediaOptions: { label: string; value: MediaAlternative }[];
  phoneNumbers: PhoneNumber[];
  exists: boolean;

  onSave: (profile: NotificationProfileKeyed) => void;
  onDelete: (profile: NotificationProfileKeyed) => void;

  // Workaround
  onSaveTimeslotChanged: (profile: NotificationProfileKeyed) => void;
};

export const NotificationProfileCard = ({
  profile,
  timeslots,
  filters,
  mediaOptions,
  phoneNumbers,
  exists,
  onSave,
  onDelete,
  onSaveTimeslotChanged,
}: NotificationProfileCardPropsType) => {
  const style = useStyles();

  // State
  const [profileState, setProfileState] = useState<NotificationProfileKeyed>(profile);
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);

  // Action handlers
  const handleTimeslotChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setUnsavedChanges(true);
    setProfileState({ ...profileState, timeslot: event.target.value as number });
  };

  const handleFiltersChange = (event: React.ChangeEvent<{}>, value: unknown) => {
    setUnsavedChanges(true);
    setProfileState({ ...profileState, filters: (value as Filter[]).map((filter: Filter) => filter.pk) });
  };

  const handleMediaChange = (event: React.ChangeEvent<{}>, value: unknown) => {
    setUnsavedChanges(true);
    setProfileState({
      ...profileState,
      media: (value as { label: string; value: MediaAlternative }[]).map((mediaOption) => mediaOption.value),
    });
  };

  const handlePhoneNumberChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setUnsavedChanges(true);
    // eslint-disable-next-line @typescript-eslint/camelcase
    setProfileState({ ...profileState, phone_number: event.target.value as number });
  };

  const handleActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUnsavedChanges(true);
    setProfileState({ ...profileState, active: event.target.checked });
  };

  const handleSave = () => {
    setUnsavedChanges(false);
    if (exists && profileState.pk !== profileState.timeslot) {
      onSaveTimeslotChanged(profileState);
    } else {
      onSave(profileState);
    }
  };

  const handleDelete = () => {
    onDelete(profileState);
  };

  const handleAddPhoneNumberClick = () => {
    console.log("ADD PHONE NUMBER!");
  };

  const DeleteProfileConfirmationButton = makeConfirmationButton({
    title: "Delete notification profile",
    question: "Are you sure you want to delete this notification profile?",
    onConfirm: () => onDelete(profileState),
  });

  return (
    <Card>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3} className={style.gridItem}>
            <Typography className={style.itemHeader}>Timeslot</Typography>
            <Select value={profileState.timeslot ? profileState.timeslot : ""} onChange={handleTimeslotChange}>
              {timeslots.map((timeslot: Timeslot) => (
                <MenuItem key={timeslot.pk} value={timeslot.pk}>
                  {timeslot.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} sm={6} md={3} className={style.gridItem}>
            <Typography className={style.itemHeader}>Filters</Typography>
            <Autocomplete
              multiple
              size="small"
              value={filters.filter((filter: Filter) => profileState.filters.includes(filter.pk))}
              options={filters}
              getOptionLabel={(option) => option.name}
              filterSelectedOptions
              onChange={handleFiltersChange}
              renderInput={(params) => <TextField {...params} variant="standard" placeholder="Filter Name" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} className={style.gridItem}>
            <Typography className={style.itemHeader}>Media</Typography>
            <Autocomplete
              multiple
              size="small"
              value={mediaOptions.filter((mediaOption) => profileState.media.includes(mediaOption.value))}
              options={mediaOptions}
              getOptionLabel={(option) => option.label}
              filterSelectedOptions
              onChange={handleMediaChange}
              renderInput={(params) => <TextField {...params} variant="standard" placeholder="Filter Name" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} className={style.gridItem}>
            <Typography className={style.itemHeader}>Phone number</Typography>
            <div className={style.phoneNumber}>
              <Select
                className={style.phoneNumberSelect}
                value={profileState.phone_number ? profileState.phone_number : ""}
                onChange={handlePhoneNumberChange}
              >
                {phoneNumbers.map((phoneNumber: PhoneNumber) => (
                  <MenuItem key={phoneNumber.pk} value={phoneNumber.pk}>
                    {phoneNumber.phone_number}
                  </MenuItem>
                ))}
              </Select>
              <IconButton className={style.addPhoneNumberButton} color="primary" onClick={handleAddPhoneNumberClick}>
                <AddCircleIcon />
              </IconButton>
            </div>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions className={style.cardActions} disableSpacing>
        <FormControlLabel
          control={
            <Checkbox checked={profileState.active} onChange={handleActiveChange} name="Active" color="primary" />
          }
          label="Active"
        />
        <div className={style.buttonGroup}>
          <Button
            onClick={handleSave}
            disabled={exists && !unsavedChanges}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
          >
            {exists ? "Save" : "Create"}
          </Button>
          {exists ? (
            <DeleteProfileConfirmationButton
              className={style.deleteButton}
              variant="contained"
              startIcon={<DeleteIcon />}
            >
              Delete
            </DeleteProfileConfirmationButton>
          ) : (
            <Button className={style.deleteButton} onClick={handleDelete} variant="contained" startIcon={<SaveIcon />}>
              Discard
            </Button>
          )}
        </div>
      </CardActions>
    </Card>
  );
};

Profile.defaultProps = {
  exists: false,
};

export default Profile;
