/**  * @jest-environment jsdom-sixteen  */

import React from "react";
import {render, screen, waitFor, within} from "@testing-library/react";

import IncidentDetails from "../IncidentDetails";
import {Incident, IncidentTag, IncidentTicketUrlBody, SourceSystem} from "../../../api/types";
import * as utils from "../../../utils";
import userEvent from "@testing-library/user-event";
import client from "../../../api/client";

// Utils
const formatDurationSpy = jest.spyOn(utils, "formatDuration");

// Mocks
const onIncidentChange = jest.fn();

const sourceSystemMock: SourceSystem = {
    pk: 100,
    name: 'Test Source System',
    type: 'Test Type'
}

const incidentTagsMock: IncidentTag[] = [
    {added_by: 1, added_time: '2021-06-28 08:29:06', tag: 'Test tag'}
]

let resolvedIncidentMock: Incident = {
    level: 1,
    pk: 1000,
    start_time: '2021-06-28 08:29:06',
    end_time: '2021-08-28 08:29:06',
    stateful: true,
    details_url: '',
    description: 'Test resolved (closed) incident',
    ticket_url: '',
    open: false,
    acked: false,

    source: sourceSystemMock,
    source_incident_id: '1001',

    tags: incidentTagsMock
}

let openIncidentMock: Incident = {
    level: 1,
    pk: 2000,
    start_time: '2021-06-28 08:29:06',
    end_time: 'infinity',
    stateful: true,
    details_url: '',
    description: 'Test open incident',
    ticket_url: '',
    open: true,
    acked: false,

    source: sourceSystemMock,
    source_incident_id: '2001',

    tags: incidentTagsMock
}

let statelessIncidentMock: Incident = {
    level: 5,
    pk: 3000,
    start_time: '2021-06-28 08:29:06',
    end_time: undefined,
    stateful: false,
    details_url: '',
    description: 'Test stateless incident',
    ticket_url: '',
    open: false,
    acked: false,

    source: sourceSystemMock,
    source_incident_id: '3001',

    tags: incidentTagsMock
}

let incidentWithoutTicketMock: Incident = {
    level: 1,
    pk: 4000,
    start_time: '2021-06-28 08:29:06',
    end_time: 'infinity',
    stateful: true,
    details_url: '',
    description: 'Test incident without ticket',
    ticket_url: '',
    open: true,
    acked: false,

    source: sourceSystemMock,
    source_incident_id: '4001',

    tags: incidentTagsMock
}

describe('Incident Details: end time and duration are displayed correctly, depending on incident status',() => {
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    it("should display both end time and duration (closed incident)", () => {
        render(
            <IncidentDetails
                incident={resolvedIncidentMock}
                onIncidentChange={onIncidentChange}
            />
        )

        // Primary details section is rendered correctly
        const primaryDetailsContainer = screen.getByTestId(/primary-details-container/i)
        expect(primaryDetailsContainer).toBeInTheDocument()
        expect(within(primaryDetailsContainer).getByText(/primary details/i)).toBeInTheDocument() // title
        expect(within(primaryDetailsContainer).getByRole('list')).toBeInTheDocument()
        expect(within(primaryDetailsContainer).getAllByRole('listitem').length).toBeGreaterThanOrEqual(6)

        // End time item is displayed
        const endTimeItem = within(primaryDetailsContainer).getByTitle(/end-time/i)
        expect(endTimeItem).toBeInTheDocument()

        // end_time is always defined for resolvedIncidentMock
        // @ts-ignore
        expect(within(endTimeItem).getByText(resolvedIncidentMock.end_time)).toBeInTheDocument()

        // Duration item is displayed
        const durationItem = within(primaryDetailsContainer).getByTitle(/duration/i)
        expect(durationItem).toBeInTheDocument()

        // Duration value is displayed correctly
        const durationValue = formatDurationSpy
            .getMockImplementation()(resolvedIncidentMock.start_time, resolvedIncidentMock.end_time);
        // @ts-ignore
        expect(within(durationItem).getByText(durationValue)).toBeInTheDocument();
    });

    it("should display duration, but not end time (open incident)", () => {
        render(
            <IncidentDetails
                incident={openIncidentMock}
                onIncidentChange={onIncidentChange}
            />
        )

        // Primary details section is rendered correctly
        const primaryDetailsContainer = screen.getByTestId(/primary-details-container/i)
        expect(primaryDetailsContainer).toBeInTheDocument()
        expect(within(primaryDetailsContainer).getByText(/primary details/i)).toBeInTheDocument() // title
        expect(within(primaryDetailsContainer).getByRole('list')).toBeInTheDocument()
        expect(within(primaryDetailsContainer).getAllByRole('listitem').length).toBeGreaterThanOrEqual(6)

        // End time item is not displayed
        const endTimeItem = within(primaryDetailsContainer).queryByTitle(/end-time/i)
        expect(endTimeItem).toBeNull()
        expect(endTimeItem).not.toBeInTheDocument()

        // Duration item is displayed
        const durationItem = within(primaryDetailsContainer).getByTitle(/duration/i)
        expect(durationItem).toBeInTheDocument()


        // Duration value is displayed correctly
        const durationValue = formatDurationSpy
            .getMockImplementation()(openIncidentMock.start_time, openIncidentMock.end_time);
        // @ts-ignore
        expect(within(durationItem).getByText(durationValue)).toBeInTheDocument();
    });

    it("should display neither duration, nor end time (stateless incident)", () => {
        render(
            <IncidentDetails
                incident={statelessIncidentMock}
                onIncidentChange={onIncidentChange}
            />
        )

        // Primary details section is rendered correctly
        const primaryDetailsContainer = screen.getByTestId(/primary-details-container/i)
        expect(primaryDetailsContainer).toBeInTheDocument()
        expect(within(primaryDetailsContainer).getByText(/primary details/i)).toBeInTheDocument() // title
        expect(within(primaryDetailsContainer).getByRole('list')).toBeInTheDocument()
        expect(within(primaryDetailsContainer).getAllByRole('listitem').length).toBeGreaterThanOrEqual(6)

        // End time item is not displayed
        const endTimeItem = within(primaryDetailsContainer).queryByTitle(/end-time/i)
        expect(endTimeItem).toBeNull()
        expect(endTimeItem).not.toBeInTheDocument()

        // Duration item is not displayed
        const durationItem = within(primaryDetailsContainer).queryByTitle(/duration/i)
        expect(durationItem).toBeNull()
        expect(durationItem).not.toBeInTheDocument()
    });
});

describe('Incident Details: Create Ticket button',() => {
    const generatedTicketUrlMockValue = "https://create-ticket-test.com/";

    const createTicketSpy = jest.spyOn(client, 'putCreateTicketEvent');


    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});

        onIncidentChange.mockImplementation((incident: Incident) => { return incident});
        createTicketSpy.mockResolvedValue({ ticket_url: generatedTicketUrlMockValue } as IncidentTicketUrlBody)
        jest.spyOn(client, 'getIncident').mockResolvedValue(incidentWithoutTicketMock);
        jest.spyOn(client, 'getUser')
            .mockResolvedValue({username: 'username', first_name: 'test', last_name: 'test', email: 'test'})
        jest.spyOn(client, 'getIncidentEvents').mockResolvedValue([])
        jest.spyOn(client, 'getIncidentAcks').mockResolvedValue([])
    })

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    })

    it("should render Create Ticket button when incident does not have a ticket url", async () => {
        await waitFor(() => {
            render(
                <IncidentDetails
                    incident={incidentWithoutTicketMock}
                    onIncidentChange={onIncidentChange}
                />
            )
        })

        const createTicketButton = screen.getByRole('button', {name: /create ticket/i});
        expect(createTicketButton).toBeInTheDocument();
    });

    it("should correctly call create-ticket endpoint after user clicks on Create Ticket button " +
        "and then confirms action in the dialog", async () => {

        await waitFor(() => {
            render(
                <IncidentDetails
                    incident={incidentWithoutTicketMock}
                    onIncidentChange={onIncidentChange}
                />
            )
        })


        // Ticket URL field is empty in incidents primary details
        const primaryDetailsContainer = screen.getByTestId(/primary-details-container/i)
        expect(primaryDetailsContainer).toBeInTheDocument();
        const ticketUrlField = await within(primaryDetailsContainer).findByRole("textbox");
        expect(ticketUrlField).toBeInTheDocument();
        expect(ticketUrlField).toHaveTextContent(/^/); // empty string

        // User clicks on the Create Ticket button
        const createTicketButton = screen.getByRole('button', {name: /create ticket/i});
        userEvent.click(createTicketButton);

        // Create Ticket confirmation dialog appears on the screen
        const createTicketDialog = screen.getByRole('dialog')
        expect(createTicketDialog).toBeInTheDocument();
        expect(within(createTicketDialog).getByText(/are you sure you want to automatically generate ticket from this incident?/i)).toBeInTheDocument();
        const dialogSubmitButton = within(createTicketDialog).getByRole('button', {name: /yes/i});
        expect(dialogSubmitButton).toBeInTheDocument();

        // User confirms create ticket action
        userEvent.click(dialogSubmitButton);

        //Create Ticket confirmation dialog disappears
        expect(createTicketDialog).not.toBeInTheDocument();

        // Create ticket endpoint was called with correct incident pk
        expect(createTicketSpy).toHaveBeenCalledTimes(1)
        expect(createTicketSpy).toHaveBeenCalledWith(4000)
        expect(createTicketSpy).toHaveReturnedWith(Promise.resolve({ticket_url: generatedTicketUrlMockValue}))

        await waitFor(() => expect(onIncidentChange).toHaveBeenCalledWith({...incidentWithoutTicketMock, ticket_url: generatedTicketUrlMockValue}))
    });

    it("should not call create-ticket endpoint to the incident after user clicks on Create Ticket button " +
        "and then cancels action in the dialog", async () => {
        await waitFor(() => {
            render(
                <IncidentDetails
                    incident={incidentWithoutTicketMock}
                    onIncidentChange={onIncidentChange}
                />
            )
        })

        // Ticket URL field is empty in incidents primary details
        const primaryDetailsContainer = screen.getByTestId(/primary-details-container/i)
        expect(primaryDetailsContainer).toBeInTheDocument();
        const ticketUrlField = within(primaryDetailsContainer).getByRole("textbox");
        expect(ticketUrlField).toBeInTheDocument();
        expect(ticketUrlField).toHaveTextContent(/^/); // empty string

        // User clicks on the Create Ticket button
        const createTicketButton = screen.getByRole('button', {name: /create ticket/i});
        userEvent.click(createTicketButton);

        // Create Ticket confirmation dialog appears on the screen
        const createTicketDialog = screen.getByRole('dialog')
        expect(createTicketDialog).toBeInTheDocument();
        expect(within(createTicketDialog).getByText(/are you sure you want to automatically generate ticket from this incident?/i)).toBeInTheDocument();
        const dialogCancelButton = within(createTicketDialog).getByRole('button', {name: /no/i});
        expect(dialogCancelButton).toBeInTheDocument();

        // User cancels create ticket action
        userEvent.click(dialogCancelButton);

        // Create Ticket confirmation dialog disappears
        expect(createTicketDialog).not.toBeInTheDocument();

        // Ticket URL field is still empty
        expect(ticketUrlField).toHaveTextContent(/^/); // empty string

        // Create ticket endpoint was not called
        expect(createTicketSpy).toHaveBeenCalledTimes(0);
    });
});

