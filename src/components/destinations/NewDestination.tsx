import React, {useEffect, useState} from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import DeleteIcon from "@material-ui/icons/Delete";
import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";

import { BEIGE, WHITE } from "../../colorscheme";
import {DestinationSettings, Media, MediaSchema, NewDestination} from "../../api/types";
import api from "../../api/client";
import Grid from "@material-ui/core/Grid";
import {DestinationComponentMediaProperty} from "./Destination";
import {makeConfirmationButton} from "../buttons/ConfirmationButton";
import Typography from "@material-ui/core/Typography";
import {Radio, RadioGroup} from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import {useStateWithDynamicDefault} from "../../utils";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        phoneField: {
            margin: theme.spacing(),
        },
        form: {
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
        },
        root: {
            flexGrow: 1,
            padding: "2em 0 0 2em"
        },
        paper: {
            p: 2,
            margin: 'auto',
            maxWidth: 500,
            flexGrow: 1,
            backgroundColor: BEIGE + '70',
            padding: theme.spacing(3),
            color: theme.palette.text.primary,
            minWidth: 30,
        },
        dangerousButton: {
            background: theme.palette.warning.main,
            color: WHITE,
        },
        saveButton: {
            background: theme.palette.primary.main,
            color: WHITE,
        },
        destination: {
            alignItems: "center",
            padding: theme.spacing(3),
        },
        createDeleteButtonGroup: {
            margin: theme.spacing(1),
            padding: theme.spacing(3),
        },
        radio: {
            '&$checked': {
                color: theme.palette.primary.dark,
            }
        },
        checked: {},
    }),
);

type NewDestinationFieldsPropsType = {
    properties: DestinationComponentMediaProperty[];
    selectedMediaValue: string;
    isDiscard: boolean;

    // Propagating to parent component
    onTitleChange: (newTitle: string) => void;
    onChanged: (hasChanges: boolean) => void;
    onIsInvalid: (isInvalid: boolean) => void;
    onPropertyValuesChanges: (newPropertyValues: Map<string, {value: string, isInvalid: boolean}>) => void;
};

export const NewDestinationFields: React.FC<NewDestinationFieldsPropsType> = ({
                                                                                  properties,
                                                                                  selectedMediaValue,
                                                                                  isDiscard,
                                                                                  onTitleChange,
                                                                                  onChanged,
                                                                                  onPropertyValuesChanges,
                                                                                  onIsInvalid,
                                                                              }: NewDestinationFieldsPropsType) => {
    const classes = useStyles();

    const [isReset, setIsReset] = useStateWithDynamicDefault(isDiscard);
    const [title, setTitle] = useState<string>();
    const [propertyValues, setPropertyValues] = useState<Map<string, {value: string, isInvalid: boolean}>>(new Map<string, {value: string, isInvalid: boolean}>());

    // On selected media change
    useEffect( () => () => {
        resetState();
    }, [selectedMediaValue]);

    // On unmount
    useEffect( () => () => {
        resetState();
    }, [] );

    const handleTitleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const newValue = event.target.value;

        onChanged(true);

        setTitle(newValue);
        onTitleChange(newValue);
    };

    const handlePropertyChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, propertyName: string, isRequired: boolean) => {
        const newValue = event.target.value;

        onChanged(true);

        const newValues = new Map<string, {value: string, isInvalid: boolean}>(propertyValues)
        newValues.set(propertyName, { value: newValue, isInvalid: (isRequired && newValue === "") });

        setPropertyValues(newValues);
        onPropertyValuesChanges(newValues)
        if (isRequired && newValue === "") {
            onIsInvalid(true)
        } else {
            onIsInvalid(false)
        }
    };

    const resetState = () => {
        setPropertyValues(new Map<string, {value: string, isInvalid: boolean}>());
        setTitle("");
        onChanged(false)
        onIsInvalid(false)
        onTitleChange("")
        onPropertyValuesChanges(new Map<string, {value: string, isInvalid: boolean}>())
        setIsReset(false);
    };

    return (
        <div>
            <TextField
                label="Title"
                variant="standard"
                className={classes.phoneField}
                value={isReset ? "" : title || ""}
                onChange={(event) => handleTitleChange(event)}
                key={`title-of-${selectedMediaValue}`}
            />

            {properties.map((property: DestinationComponentMediaProperty, index) => {
                const { property_name, required, title } = property;

                if (property) {
                    return (
                        <TextField
                            error={{...propertyValues.get(property.property_name)}.isInvalid || false}
                            required={required}
                            label={title}
                            variant="standard"
                            className={classes.phoneField}
                            value={isReset ? "" : {...propertyValues.get(property.property_name)}.value || ""}
                            onChange={(event) => handlePropertyChange(event, property_name, required)}
                            key={`${property_name}-${index}`}
                            type={property.format ? property.format : "text"}
                            helperText={{...propertyValues.get(property.property_name)}.isInvalid ? "Required" : ""}
                        />
                    );
                }

            })}
        </div>
    );
};

type NewDestinationComponentPropsType = {
    destination?: NewDestination;
    configuredMedia: Media[];

    onCreate: (destination: NewDestination) => void;
};

const NewDestinationComponent: React.FC<NewDestinationComponentPropsType> = ({
                                                                                 configuredMedia,
                                                                                 onCreate,
                                                                             }) => {

    const classes = useStyles();

    const [mediaSchemas, setMediaSchemas] = useState<MediaSchema[]>([]);
    const [destinationPropertiesPerMediaType, setDestinationPropertiesPerMediaType] = useState<Map<string, DestinationComponentMediaProperty[]>>(new Map<string, DestinationComponentMediaProperty[]>())
    const [selectedMediaValue, setSelectedMediaValue] = useState<string>("email");

    const [title, setTitle] = useState<string>();
    const [propertyValues, setPropertyValues] = useState<Map<string, {value: string, isInvalid: boolean}>>(new Map<string, {value: string, isInvalid: boolean}>());
    const [isInvalidDestination, setIsInvalidDestination] = useState<boolean>(false);
    const [isDiscard, setIsDiscard] = useState(false);
    const [hasChanged, setHasChanged] = useState<boolean>(false);

    // On mount
    useEffect(() => {
        fetchMediaSchemas();
    }, []);

    // On unmount
    useEffect(() => () => {
        resetState();
    }, []);

    // On reset changes
    useEffect(() => () => {
        setIsDiscard(false)
    }, [isDiscard, setIsDiscard]);

    // On configured media update
    useEffect(() => {
        fetchMediaSchemas();
    }, [configuredMedia]);

    // On media schemas update
    useEffect(() => {
        mediaSchemas.forEach((schema) => {
            setDestinationPropertiesPerMediaType(() => {

                if (destinationPropertiesPerMediaType !== undefined &&
                    destinationPropertiesPerMediaType.values() !== undefined &&
                    schema.json_schema.$id !== undefined) {
                    const propertiesByMediaType = new Map<string, DestinationComponentMediaProperty[]>(destinationPropertiesPerMediaType);

                    const schemasID = schema.json_schema.$id.split('/');
                    const schemasSlug = schemasID[schemasID.length - 1];

                    const mediaProperties = Object.entries(schema.json_schema.properties)
                    const property =  mediaProperties.map((p) => {
                        return {
                            ...p[1],
                            property_name: p[0],
                            required: schema.json_schema.required !== undefined &&
                                schema.json_schema.required.filter(r => r === p[0]).length > 0
                        }
                    })
                    propertiesByMediaType.set(schemasSlug, property);
                    return propertiesByMediaType;
                } else {
                    return new Map<string, DestinationComponentMediaProperty[]>()
                }
            })
        })

    }, [mediaSchemas, setMediaSchemas]);

    const fetchMediaSchemas = () => {
        configuredMedia.forEach((media) => {
            api.getMediaSchemaBySlug(media.slug)
                .then((res: MediaSchema) => {
                    setMediaSchemas([...mediaSchemas, res])
                })
                .catch((error) => {
                })
        })
    }

    const handleSelectedMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedMediaValue((event.target as HTMLInputElement).value);
    };

    const handleCreateClick = ()  => {
        setIsDiscard(true)
        resetState();

        let settings: DestinationSettings = {};
        for (const entry of propertyValues.entries()) {
            settings[entry[0]] = entry[1].value
        }
        const newDestination: NewDestination = {
            media: selectedMediaValue,
            label: title,
            settings: settings,
        }

        onCreate(newDestination);
    };

    const handleDiscardClick = ()  => {
        setIsDiscard(true);
        resetState();
    };

    const resetState = () => {
        setHasChanged(false);
        setIsInvalidDestination(false);
        setTitle("");
        setPropertyValues(new Map<string, {value: string, isInvalid: boolean}>());
    };


    const RemoveDestinationButton = makeConfirmationButton({
        title: `Discard`,
        question: "Are you sure you want to discard changes?",
        onConfirm: () => handleDiscardClick(),
    });

    return (
        <div className={classes.root}>
            <Grid container spacing={2}>

                <Grid item>
                    <Typography gutterBottom variant="h5" component="div">
                        Create new destination
                    </Typography>
                </Grid>

                <Grid item container spacing={5}>
                    <Grid item>
                        <FormControl>
                            <RadioGroup
                                aria-labelledby="demo-controlled-radio-buttons-group"
                                name="controlled-radio-buttons-group"
                                value={selectedMediaValue}
                                onChange={handleSelectedMediaChange}
                            >
                                {[...configuredMedia.values()].map((media) => {
                                    return (
                                        <FormControlLabel value={media.slug} control={<Radio classes={{root: classes.radio, checked: classes.checked}}/>} label={media.name} />
                                    );
                                })}
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm container>
                        <Grid item xs container direction="column" spacing={3}>
                            <Grid item xs>
                                {!isDiscard && destinationPropertiesPerMediaType.get(selectedMediaValue) &&
                                    <NewDestinationFields
                                        properties={destinationPropertiesPerMediaType.get(selectedMediaValue) as DestinationComponentMediaProperty[]}
                                        selectedMediaValue={selectedMediaValue}
                                        isDiscard={isDiscard}
                                        onTitleChange={setTitle}
                                        onChanged={setHasChanged}
                                        onIsInvalid={setIsInvalidDestination}
                                        onPropertyValuesChanges={setPropertyValues}
                                    />
                                }
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    size="small"
                                    className={classes.saveButton}
                                    onClick={handleCreateClick}
                                    startIcon={<SaveIcon />}
                                    disabled={!hasChanged || isInvalidDestination || false}
                                >
                                    Create
                                </Button>
                                <RemoveDestinationButton
                                    variant="contained"
                                    size="small"
                                    className={classes.dangerousButton}
                                    startIcon={<DeleteIcon />}
                                >
                                    Discard
                                </RemoveDestinationButton>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

            </Grid>
        </div>
    );
};

export default NewDestinationComponent;
