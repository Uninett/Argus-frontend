import React, {useEffect, useState} from "react";
import {Destination, DestinationRequest, Media, MediaSchema} from "../../api/types";

import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import List from "@material-ui/core/List";
import {ListItem} from "@material-ui/core";
import api from "../../api/client";
import DestinationComponent, {DestinationComponentMediaProperty} from "./Destination";
import {defaultErrorHandler} from "../../api/utils";
import {useAlertSnackbar, UseAlertSnackbarResultType} from "../alertsnackbar";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
        },
        heading: {
            fontSize: theme.typography.pxToRem(20),
            fontWeight: theme.typography.fontWeightMedium,
        },
    }),
);

type DestinationGroupPropsType = {
    name: string;
    media: Media;
    destinations: Destination[] | undefined;

    onDestinationUpdate: (destination: DestinationRequest) => Promise<void>;
    onDestinationDelete: (destination: Destination, label: string) => void;
};

const DestinationGroup: React.FC<DestinationGroupPropsType> = ({
                                                                   name,
                                                                   media,
                                                                   destinations,
                                                                   onDestinationUpdate,
                                                                   onDestinationDelete,
                                                               }) => {

    const classes = useStyles();
    const { displayAlertSnackbar }: UseAlertSnackbarResultType = useAlertSnackbar();

    const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    const [mediaSchema, setMediaSchema] = useState<MediaSchema | undefined>(undefined);
    const [destinationProperties, setDestinationProperties] = useState<DestinationComponentMediaProperty[]>([])

    const [expanded, setExpanded] = React.useState<string | boolean>((destinations !== undefined && destinations.length > 0));

    // On mount
    useEffect(() => {
        fetchMediaSchema();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // On media schema update
    useEffect(() => {
        setDestinationProperties(() => {
            if (mediaSchema !== undefined) {
                const mediaProperties = Object.entries(mediaSchema.json_schema.properties)
                return mediaProperties.map((p) => {
                    return {
                        ...p[1],
                        property_name: p[0],
                        required: mediaSchema.json_schema.required !== undefined &&
                            mediaSchema.json_schema.required.filter(r => r === p[0]).length > 0
                    }
                })
            } else {
                return [];
            }

        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mediaSchema, setMediaSchema]);

    const fetchMediaSchema = () => {
        api.getMediaSchemaBySlug(media.slug)
            .then((res: MediaSchema) => {
                setMediaSchema(res);
                console.log("getMediaSchema res", res)
            })
            .catch(defaultErrorHandler((msg: string) => {
                displayAlertSnackbar(msg, "error");
            }),)
    }

    return (
        <div className={classes.root}>
            <Accordion
                expanded={expanded === 'panel1' || expanded === true}
                onChange={handleChange('panel1')}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                >
                    <Typography className={classes.heading}>{name} ({destinations !== undefined ? destinations.length : 0})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <List>
                        {destinations?.map((dest) => (
                            <ListItem button key={dest.pk} disableTouchRipple={true}>
                                <DestinationComponent
                                    properties={destinationProperties}
                                    destination={dest}
                                    onSave={onDestinationUpdate}
                                    onDelete={onDestinationDelete}
                                />
                            </ListItem>
                        ))}
                    </List>
                </AccordionDetails>
            </Accordion>
        </div>
    );
};

export default DestinationGroup;
