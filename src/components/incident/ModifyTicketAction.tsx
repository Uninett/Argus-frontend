import React, { useEffect } from "react";

import Button, { ButtonProps } from "@material-ui/core/Button";

import { useStyles } from "./styles";

import ConfirmationButton from "../../components/buttons/ConfirmationButton";
import {hyperlinkIfAbsoluteUrl, isValidUrl} from "../../utils";
import ListItem from "@material-ui/core/ListItem";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import {Alert} from "@material-ui/lab";
import {IncidentDetailsListItem} from "./IncidentDetails";
import {useTicket} from "../../state/hooks";

interface ModifyTicketPropsType  {
    ticketUrl: string | undefined;

    isBulk: boolean;
}


interface TicketModifiableFieldPropsType extends ModifyTicketPropsType {}
export const TicketModifiableField: React.FC<TicketModifiableFieldPropsType> = ({
                                                                             ticketUrl: urlProp
                                                                         }: TicketModifiableFieldPropsType) => {

    const [ticketUrl, { initTicketState, changeUrl, resetTicketState }] = useTicket();

    // On mount
    useEffect(() => {
        initTicketState(urlProp);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // On unmount
    useEffect(() => () => {
        resetTicketState(null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // On incident ticket url update (effectively, on successful API call)
    useEffect(() => {
        initTicketState(urlProp);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [urlProp])


    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        changeUrl(event.target.value);
    };

    if (ticketUrl.incidentTicketUrl && !ticketUrl.isManuallyEditingTicket) {
        return (
            <IncidentDetailsListItem
                title="Ticket"
                detail={hyperlinkIfAbsoluteUrl(ticketUrl.incidentTicketUrl)}
                html_title_attr={"ticket-url-item"}
            />
        )
    } else {
        return (
            <ListItem>
                <Grid container direction="row" wrap="wrap">
                    <Grid item container direction="row" wrap="nowrap" justify="space-between" className="ticket-input-button-container">
                        <TextField
                            label="Ticket"
                            value={ticketUrl.ticketUrl || ""}
                            onChange={handleChange}
                            error={ticketUrl.isInvalidAbsoluteUrl}
                            helperText={ticketUrl.isInvalidAbsoluteUrl && "Invalid absolute URL"}
                            className="ticket-url-input-field"
                        />
                    </Grid>
                    {(ticketUrl.incidentTicketUrl && ticketUrl.isManuallyEditingTicket) && (
                        <Grid item>
                            <Alert severity="info">Leave this field empty in order to remove ticket url from the incident</Alert>
                        </Grid>
                    )}
                </Grid>
            </ListItem>
        );
    }
};

interface ModifyTicketButtonPropsType extends ModifyTicketPropsType {
    onCreateTicket: () => void;
    onSaveTicket: (url?: string) => void;

    modifyTicketButtonText?: string;

    modifyTicketButtonProps?: Partial<ButtonProps>;
    ButtonComponent?: React.ElementType<{ onClick: ButtonProps["onClick"] }>;
}
export const ModifyTicketButton: React.FC<ModifyTicketButtonPropsType> = ({
                                                           ticketUrl: urlProp,
                                                           onCreateTicket,
                                                           onSaveTicket,
                                                           modifyTicketButtonText,
                                                           modifyTicketButtonProps = {},
                                                           ButtonComponent,
                                                           isBulk,
                                                       }: ModifyTicketButtonPropsType) => {
    const classes = useStyles();

    const [ticketUrl, { initTicketState, invalidUrl, manuallyEditTicket, resetTicketState }] = useTicket();

    // On mount
    useEffect(() => {
        initTicketState(urlProp);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    // On unmount
    useEffect(() => () => {
        resetTicketState(null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // On incident ticket url update (effectively, on successful API call)
    useEffect(() => {
        initTicketState(urlProp);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [urlProp])

    const handleEditTicket = () => {
        manuallyEditTicket();
    }

    const handleSaveTicket = () => {
        if (ticketUrl.ticketUrl && ticketUrl.isChangedUrl && !isValidUrl(ticketUrl.ticketUrl)) {
            invalidUrl();
        } else if (ticketUrl.isChangedUrl) {
            onSaveTicket(ticketUrl.ticketUrl || undefined);
        } else {
            resetTicketState(ticketUrl.incidentTicketUrl || undefined);
        }
    }

    const handleCreateTicket = () => {
        onCreateTicket();
    }

    const createTicketButtonDefaultProps = {
        title: "Create ticket",
        question: "Are you sure you want to automatically generate ticket from this incident?",
        onConfirm: handleCreateTicket,
        ButtonComponent: ButtonComponent,
    }

    const createTicketButtonPluralProps = {
        title: "Create tickets",
        question: "Are you sure you want to automatically generate tickets from the selected incidents?",
    }

    if (!ticketUrl.incidentTicketUrl && !ticketUrl.isManuallyEditingTicket) {
        return(
            <ConfirmationButton
                className={classes.dangerousButton}
                {...createTicketButtonDefaultProps}
                {...(isBulk && createTicketButtonPluralProps)}
                {...modifyTicketButtonProps}
            >
                Create ticket
            </ConfirmationButton>
        );
    } else {
        return(
            <Button
                className={classes.safeButton}
                onClick={() => {
                    if (ticketUrl.incidentTicketUrl && !ticketUrl.isManuallyEditingTicket) {
                        handleEditTicket();
                    } else if (ticketUrl.isManuallyEditingTicket) {
                        handleSaveTicket()
                    }
                }}
            >
                {(ticketUrl.incidentTicketUrl && !ticketUrl.isManuallyEditingTicket) && "Edit Ticket Url"}
                {(ticketUrl.isManuallyEditingTicket) && "Save Ticket Url"}
            </Button>
        );
    }
};