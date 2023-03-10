import React, { useEffect, useState } from "react";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Spinning from "../spinning";
import SaveIcon from "@material-ui/icons/Save";
import DeleteIcon from "@material-ui/icons/Delete";
import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";

import { WHITE } from "../../colorscheme";
import { Destination, DestinationRequest, DestinationSettings } from "../../api/types";
import { makeConfirmationButton } from "../buttons/ConfirmationButton";
import Tooltip from "@material-ui/core/Tooltip";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      color: theme.palette.text.secondary,
      minWidth: 30,
      cursor: "default",
    },
    dangerousButton: {
      background: theme.palette.warning.main,
      color: WHITE,
      margin: theme.spacing(),
      "&:disabled": {
        cursor: "not-allowed",
        pointerEvents: "all !important",
      },
    },
    saveButton: {
      background: theme.palette.primary.main,
      color: WHITE,
      margin: theme.spacing(),
      "&:disabled": {
        cursor: "not-allowed",
        pointerEvents: "all !important",
      },
    },
    phoneField: {
      margin: theme.spacing(),
    },
    form: {
      alignItems: "center",
      display: "flex",
      justifyContent: "space-between",
      cursor: "default",
    },
  }),
);

export type DestinationComponentMediaProperty = {
  property_name: string;
  title: string;
  type: string; // value type
  description?: string;
  required: boolean;
  format?: string;
};

type DestinationComponentPropsType = {
  properties: DestinationComponentMediaProperty[];
  destination: Destination;

  onSave: (destination: DestinationRequest) => Promise<void>;
  onDelete: (destination: Destination, label: string) => void;
};

const DestinationComponent: React.FC<DestinationComponentPropsType> = ({
  properties,
  destination,
  onSave,
  onDelete,
}) => {
  const classes = useStyles();

  const [title, setTitle] = useState<string | undefined>();
  const [propertyValues, setPropertyValues] = useState<Map<string, { value: string; isInvalid: boolean }>>(
    new Map<string, { value: string; isInvalid: boolean }>(),
  );
  const [isInvalidDestination, setIsInvalidDestination] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [hasTitleChanges, setHasTitleChanges] = useState<boolean>(false);
  const [hasPropertyValueChanges, setHasPropertyValueChanges] = useState<boolean>(false);

  // On destination update
  useEffect(() => {
    setTitle(destination.label === null ? "" : destination.label);
    setPropertyValues((prevState) => {
      const newValues = new Map<string, { value: string; isInvalid: boolean }>(prevState);

      for (const setting of Object.entries(destination.settings)) {
        if (typeof setting[1] !== "boolean") newValues.set(setting[0], { value: setting[1], isInvalid: false });
      }

      return newValues;
    });
  }, [destination]);

  // On property values update
  useEffect(() => {
    setIsInvalidDestination([...propertyValues.values()].filter((e) => e.isInvalid).length > 0);
  }, [propertyValues]);

  const onTitleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newValue = event.target.value;

    setHasTitleChanges(true);
    setTitle(newValue);
  };

  const handlePropertyChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    propertyName: string,
    isRequired: boolean,
  ) => {
    const newValue = event.target.value;

    setHasPropertyValueChanges(true);
    setPropertyValues((prevState) => {
      const newValues = new Map<string, { value: string; isInvalid: boolean }>(prevState);
      newValues.set(propertyName, { value: newValue, isInvalid: isRequired && newValue === "" });
      return newValues;
    });
  };

  const handleSaveClick = () => {
    let settings: DestinationSettings = {};
    let newDestination: DestinationRequest = {} as DestinationRequest;

    if (hasTitleChanges && hasPropertyValueChanges) {
      for (const entry of propertyValues.entries()) {
        settings[entry[0]] = entry[1].value;
      }
      newDestination = {
        pk: destination.pk,
        label: title === "" ? null : title,
        settings: settings,
        media: destination.media.slug,
      };
    } else if (hasPropertyValueChanges) {
      for (const entry of propertyValues.entries()) {
        settings[entry[0]] = entry[1].value;
      }
      newDestination = {
        pk: destination.pk,
        settings: settings,
        media: destination.media.slug,
      };
    } else if (hasTitleChanges) {
      newDestination = {
        pk: destination.pk,
        label: title === "" ? null : title,
        media: destination.media.slug,
      };
    }

    onSave(newDestination)
      .then(() => {
        resetState();
      })
      .catch();
  };

  const resetState = () => {
    setHasTitleChanges(false);
    setHasPropertyValueChanges(false);
    setIsInvalidDestination(false);
  };

  const RemoveDestinationButton = makeConfirmationButton({
    title: `Delete`,
    question: "Are you sure you want to delete the destination?",
    onConfirm: () => {
      setDeleteLoading(true);
      onDelete(destination, destination.suggested_label);
    },
  });

  return (
    <Paper className={classes.paper}>
      <form
        className={classes.form}
        noValidate
        autoComplete="off"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Tooltip title={"Must be unique per media type"} arrow placement="top" disableHoverListener>
          <TextField
            label="Title"
            variant="standard"
            className={classes.phoneField}
            value={title}
            onChange={onTitleChange}
            key={`title-of-${destination.pk}`}
            id={`title-of-${destination.pk}`}
          />
        </Tooltip>

        {[...properties.values()].map((property: DestinationComponentMediaProperty) => {
          return (
            <TextField
              error={{ ...propertyValues.get(property.property_name) }.isInvalid}
              required={property.required}
              label={property.title}
              variant="standard"
              className={classes.phoneField}
              value={{ ...propertyValues.get(property.property_name) }.value}
              onChange={(event) => {
                handlePropertyChange(event, property.property_name, property.required);
              }}
              key={`${property.property_name}-of-${destination.pk}`}
              id={`${property.property_name}-of-${destination.pk}`}
            />
          );
        })}
        <Button
          variant="contained"
          size="small"
          className={classes.saveButton}
          disabled={(!hasTitleChanges && !hasPropertyValueChanges) || isInvalidDestination}
          startIcon={<SaveIcon />}
          onClick={handleSaveClick}
        >
          Save
        </Button>
        <Tooltip
          disableFocusListener
          disableTouchListener
          title={
            destination.settings.synced === true
              ? "This destination is synchronized with your account and can not be deleted"
              : ""
          }
        >
          <span>
            <RemoveDestinationButton
              variant="contained"
              size="small"
              className={classes.dangerousButton}
              startIcon={deleteLoading ? <Spinning shouldSpin /> : <DeleteIcon />}
              disabled={destination.settings.synced === true}
            >
              Delete
            </RemoveDestinationButton>
          </span>
        </Tooltip>
      </form>
    </Paper>
  );
};

export default DestinationComponent;
