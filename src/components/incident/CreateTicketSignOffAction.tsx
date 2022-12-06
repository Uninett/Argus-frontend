import React from "react";

import Button, { ButtonProps } from "@material-ui/core/Button";

import { useStyles } from "./styles";

import ConfirmationButton from "../../components/buttons/ConfirmationButton";

type CreateTicketPropsType = {
    onCreateTicket: () => void;

    createTicketButtonText?: string;

    createTicketButtonProps?: Partial<ButtonProps>;
    ButtonComponent?: React.ElementType<{ onClick: ButtonProps["onClick"] }>;
    isBulk: boolean;
};

const CreateTicket: React.FC<CreateTicketPropsType> = ({
                                                         onCreateTicket,
                                                         createTicketButtonText = "Create ticket",
                                                         createTicketButtonProps = {},
                                                         ButtonComponent = Button,
                                                         isBulk,
                                                     }: CreateTicketPropsType) => {
    const classes = useStyles();

    const createTicketButtonDefaultProps = {
        title: "Create ticket",
        question: "Are you sure you want to create ticket from this incident?",
        onConfirm: onCreateTicket,
        ButtonComponent: ButtonComponent,
    }

    const createTicketButtonPluralProps = {
        title: "Create tickets",
        question: "Are you sure you want to create tickets from the selected incidents?",
    }


    return(
        <ConfirmationButton
            className={classes.dangerousButton}
            buttonProps={{
                variant: "contained",
            }}
            {...createTicketButtonDefaultProps}
            {...(isBulk && createTicketButtonPluralProps)}
            {...createTicketButtonProps}
        >
            {createTicketButtonText}
        </ConfirmationButton>
    );
};

export default CreateTicket;