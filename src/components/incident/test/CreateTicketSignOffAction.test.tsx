/**  * @jest-environment jsdom-sixteen  */

import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {ModifyTicketButton} from "../ModifyTicketAction";

const onCreateTicketMock = jest.fn();
const onSaveTicketMock = jest.fn();

describe('Singular Create Ticket confirmation dialog test suite', () => {

    let createTicketConfirmationDialog: HTMLElement;

    beforeEach(() => {

        createTicketConfirmationDialog = render(
            <ModifyTicketButton
                onCreateTicket={onCreateTicketMock}
                onSaveTicket={onSaveTicketMock}
                ticketUrl={""}
                isBulk={false}
            />).container;
    });

    afterEach(() => {
        document.body.removeChild(createTicketConfirmationDialog);
        createTicketConfirmationDialog.remove();
        jest.clearAllMocks();
    })

    test('create ticket dialog is rendered correctly', () => {
        const createTicketBtn = screen.getByRole('button', {name: /create ticket/i});
        userEvent.click(createTicketBtn);

        const createTicketDialog = screen.getByRole('dialog')
        expect(createTicketDialog).toBeInTheDocument();
        expect(createTicketDialog).toBeVisible();

        const dialogTitle = within(createTicketDialog).getByRole('heading', {name: /create ticket/i});
        expect(dialogTitle).toBeInTheDocument();
        expect(dialogTitle).toBeVisible();

        const dialogQuestion = within(createTicketDialog).getByText(/are you sure you want to automatically generate ticket from this incident?/i);
        expect(dialogQuestion).toBeInTheDocument();
        expect(dialogQuestion).toBeVisible();

        const dialogSubmitBtn = within(createTicketDialog).getByRole('button', {name: /yes/i});
        expect(dialogSubmitBtn).toBeInTheDocument();
        expect(dialogSubmitBtn).toBeVisible();

        const dialogCancelBtn = within(createTicketDialog).getByRole('button', {name: /no/i});
        expect(dialogCancelBtn).toBeInTheDocument();
        expect(dialogCancelBtn).toBeVisible();
    });
});


describe('Bulk Create Ticket confirmation dialog test suite', () => {

    let createTicketConfirmationDialog: HTMLElement;

    beforeEach(() => {
        createTicketConfirmationDialog = render(
            <ModifyTicketButton
                onCreateTicket={onCreateTicketMock}
                onSaveTicket={onSaveTicketMock}
                ticketUrl={""}
                isBulk={true}
            />).container;
    });

    afterEach(() => {
        document.body.removeChild(createTicketConfirmationDialog);
        createTicketConfirmationDialog.remove();
        jest.clearAllMocks();
    })

    test('create ticket dialog is rendered correctly', () => {
        const createTicketBtn = screen.getByRole('button', {name: /create ticket/i});
        userEvent.click(createTicketBtn);

        const createTicketDialog = screen.getByRole('dialog')
        expect(createTicketDialog).toBeInTheDocument();
        expect(createTicketDialog).toBeVisible();

        const dialogTitle = within(createTicketDialog).getByRole('heading', {name: /create tickets/i});
        expect(dialogTitle).toBeInTheDocument();
        expect(dialogTitle).toBeVisible();

        const dialogQuestion = within(createTicketDialog).getByText(/are you sure you want to automatically generate tickets from the selected incidents?/i);
        expect(dialogQuestion).toBeInTheDocument();
        expect(dialogQuestion).toBeVisible();

        const dialogSubmitBtn = within(createTicketDialog).getByRole('button', {name: /yes/i});
        expect(dialogSubmitBtn).toBeInTheDocument();
        expect(dialogSubmitBtn).toBeVisible();

        const dialogCancelBtn = within(createTicketDialog).getByRole('button', {name: /no/i});
        expect(dialogCancelBtn).toBeInTheDocument();
        expect(dialogCancelBtn).toBeVisible();
    });
});
