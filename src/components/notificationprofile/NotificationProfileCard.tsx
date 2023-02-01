import React, {useEffect, useState} from "react";

import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import CardContent from "@material-ui/core/CardContent";
import Select from "@material-ui/core/Select";
import Typography from "@material-ui/core/Typography";
import Autocomplete from "@material-ui/lab/Autocomplete";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";

import SaveIcon from "@material-ui/icons/Save";
import DeleteIcon from "@material-ui/icons/Delete";
import AddCircleIcon from "@material-ui/icons/AddCircle";

import { createStyles, makeStyles } from "@material-ui/core/styles";

import { makeConfirmationButton } from "../buttons/ConfirmationButton";

import type {
  NotificationProfileKeyed,
  Filter,
  Timeslot,
  TimeslotPK,
  Media, DestinationPK,
} from "../../api/types";
import {Destination} from "../../api/types";
import {
  destinationPKsToDestinations,
  destinationPKToSettingsValue,
  mediaSlugToMediaName
} from "../../utils";
import Tooltip from "@material-ui/core/Tooltip";
import {ListSubheader} from "@material-ui/core";
import ListItemText from "@material-ui/core/ListItemText";
import Input from "@material-ui/core/Input";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      marginTop: "10px",
      marginBottom: "10px",
    },
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
      overflowX: "hidden",
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
    formControl: {
      minWidth: 120,
      maxWidth: 300,
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    chip: {
      margin: 2,
    },
  }),
);

type NotificationProfileCardPropsType = {
  profile: NotificationProfileKeyed;
  timeslots: Timeslot[];
  filters: Filter[];
  destinations: Map<Media["slug"], Destination[]>;
  mediaOptions: Media[];
  exists: boolean;

  onSave: (profile: NotificationProfileKeyed) => void;
  onDelete: (profile: NotificationProfileKeyed) => void;
  onAddPhoneNumber: () => void;
};

const NotificationProfileCard = ({
  profile,
  timeslots,
  filters,
  destinations, mediaOptions,
  exists,
  onSave,
  onDelete,
  onAddPhoneNumber,
}: NotificationProfileCardPropsType) => {
  const style = useStyles();

  // State
  const [profileState, setProfileState] = useState<NotificationProfileKeyed>(profile);
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const [filterError, setFilterError] = useState<boolean>(false);
  const [selectedDestinations, setSelectedDestinations] = useState<DestinationPK[]>([]);

  // On mount
  useEffect(() => {
    if (exists) {
      if (profile.destinations !== null) {
        setSelectedDestinations(profile.destinations.map(d => d.pk))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On selected destinations update
  useEffect(() => {
    setProfileState({
      ...profileState,
      destinations: destinationPKsToDestinations(selectedDestinations, destinations),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDestinations]);

  // Action handlers
  const handleTimeslotChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setUnsavedChanges(true);
    setProfileState({ ...profileState, timeslot: event.target.value as number });
  };

  const handleFiltersChange = (event: React.ChangeEvent<{}>, value: unknown) => {
    setUnsavedChanges(true);
    setProfileState({ ...profileState, filters: (value as Filter[]).map((filter: Filter) => filter.pk) });
  };

  const handleDestinationsChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setUnsavedChanges(true);
    setProfileState({
      ...profileState,
      destinations: destinationPKsToDestinations(event.target.value as DestinationPK[], destinations)
    })
    setSelectedDestinations(event.target.value as DestinationPK[])
  };

  const handleActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUnsavedChanges(true);
    setProfileState({ ...profileState, active: event.target.checked });
  };

  const handleSave = () => {
    if (profileState.filters.length === 0) {
      setFilterError(true);
    } else {
      setFilterError(false);
      setUnsavedChanges(false);
      onSave(profileState);
    }
  };

  const handleDelete = () => {
    onDelete(profileState);
  };

  const handleAddPhoneNumber = () => {
    onAddPhoneNumber();
  };

  // Function that returns a valid timeslot value for the timeslot selector
  const getSelectedTimeslot = (timeslot: TimeslotPK) => {
    if (timeslots.length === 0) {
      return "";
    }
    // Return provided timeslot PK if it is in the timeslot list
    if (timeslots.some((t) => t.pk === timeslot)) {
      return timeslot;
    }
    // Else return PK of the first timeslot in the list
    return timeslots[0].pk;
  };

  // Delete button with confirmation dialog
  const DeleteProfileConfirmationButton = makeConfirmationButton({
    title: "Delete notification profile",
    question: "Are you sure you want to delete this notification profile?",
    onConfirm: () => onDelete(profileState),
  });

  return (
    <Card className={style.root}>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3} className={style.gridItem}>
            <Typography className={style.itemHeader}>Timeslot</Typography>
            <Select value={getSelectedTimeslot(profileState.timeslot)} onChange={handleTimeslotChange}>
              {timeslots.map((timeslot: Timeslot) => (
                <MenuItem key={timeslot.pk} value={timeslot.pk}>
                  {timeslot.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} sm={6} md={3} className={style.gridItem}>
            <Typography
              id={`filter-selector-${profileState.pk ? profileState.pk : "create"}-label`}
              className={style.itemHeader}
            >
              Filters
            </Typography>
            <Autocomplete
              aria-labelledby={`filter-selector-${profileState.pk ? profileState.pk : "create"}-label`}
              multiple
              size="small"
              value={filters.filter((filter: Filter) => profileState.filters.includes(filter.pk))}
              options={filters}
              getOptionLabel={(option) => option.name}
              filterSelectedOptions
              onChange={handleFiltersChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  placeholder="Filter Name"
                  error={filterError}
                  helperText={filterError ? "This field cannot be empty." : null}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6} className={style.gridItem}>
            <Typography className={style.itemHeader}>Destinations</Typography>
            <div className={style.phoneNumber}>
              <Select
                  data-testid="destinations-selector"
                  className={style.phoneNumberSelect}
                  labelId="destinations-selector"
                  id="destinations-selector"
                  multiple
                  value={selectedDestinations}
                  onChange={handleDestinationsChange}
                  input={<Input/>}
                  renderValue={(selected) => (destinationPKsToDestinations(selected as DestinationPK[], destinations)).map(d => d.suggested_label).join(', ')}
                  MenuProps={{
                    variant: "menu",
                    getContentAnchorEl: null,
                    PaperProps: {
                      style: {
                        maxHeight: ITEM_HEIGHT * 6.5 + ITEM_PADDING_TOP,
                        width: 350,
                      },
                    },
                  }}
              >

                {Array.from(destinations).map(([slug, dests]) => {
                  return [
                    <ListSubheader>{mediaSlugToMediaName(slug, mediaOptions)}</ListSubheader>,
                    dests.map(destination => (
                          <MenuItem key={destination.pk} value={destination.pk}>
                            <Checkbox checked={selectedDestinations.indexOf(destination.pk) > -1} />
                            <Tooltip
                                title={destinationPKToSettingsValue(destination.pk, destinations)}
                                arrow
                                disableTouchListener
                                placement="bottom-start"
                            >
                              <ListItemText primary={
                                destination.label ?
                                    destination.label :
                                    (destination.suggested_label ?
                                        destination.suggested_label :
                                        destinationPKToSettingsValue(destination.pk, destinations))
                              } />
                            </Tooltip>
                          </MenuItem>
                    ))
                  ]
                })}

              </Select>

              <IconButton
                aria-label="Add phone number"
                className={style.addPhoneNumberButton}
                color="primary"
                onClick={handleAddPhoneNumber}
              >
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
            <Button
              className={style.deleteButton}
              onClick={handleDelete}
              variant="contained"
              startIcon={<DeleteIcon />}
            >
              Discard
            </Button>
          )}
        </div>
      </CardActions>
    </Card>
  );
};

export default NotificationProfileCard;
