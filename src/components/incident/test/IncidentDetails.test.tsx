/**  * @jest-environment jsdom */

import React from "react";
import {render, screen, waitFor, waitForElementToBeRemoved, within} from "@testing-library/react";

import IncidentDetails from "../IncidentDetails";
import {Incident, IncidentTag, IncidentTicketUrlBody, SourceSystem} from "../../../api/types";
import userEvent from "@testing-library/user-event";
import client from "../../../api/client";
import {formatDuration} from "../../../utils";

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
        const durationValue = formatDuration(resolvedIncidentMock.start_time, resolvedIncidentMock.end_time);

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
        const durationValue = formatDuration(openIncidentMock.start_time, openIncidentMock.end_time);

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
        expect(within(createTicketDialog).getByText(/are you sure you want to automatically generate a ticket from this incident?/i)).toBeInTheDocument();
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
        expect(within(createTicketDialog).getByText(/are you sure you want to automatically generate a ticket from this incident?/i)).toBeInTheDocument();
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

    it("should not display spinner within create ticket button by default in the incident details view", async () => {
        await waitFor(() => {
            render(
              <IncidentDetails
                incident={incidentWithoutTicketMock}
                onIncidentChange={onIncidentChange}
              />
            )
        });

        // Create ticket button is rendered
        const createTicketButton = screen.getByRole('button', {name: /create ticket/i});
        expect(createTicketButton).toBeInTheDocument();

        // Spinner is not present within create ticket button
        expect(within(createTicketButton).queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it("should display spinner within create ticket button after user confirms create ticket action in the dialog", async () => {
        await waitFor(() => {
            render(
              <IncidentDetails
                incident={incidentWithoutTicketMock}
                onIncidentChange={onIncidentChange}
              />
            )
        });

        // User clicks on the Create Ticket button
        const createTicketButton = screen.getByRole('button', {name: /create ticket/i});
        userEvent.click(createTicketButton);

        // User confirms create ticket action in the dialog
        const dialogSubmitButton = screen.getByRole('button', {name: /yes/i});
        expect(dialogSubmitButton).toBeInTheDocument();
        userEvent.click(dialogSubmitButton);

        // Spinner appears within create ticket button
        const createTicketProgress = within(createTicketButton).getByRole('progressbar');
        expect(createTicketProgress).toBeInTheDocument();
    });

    it("should not display spinner within create ticket button after user cancels create ticket action in the dialog", async () => {
        await waitFor(() => {
            render(
              <IncidentDetails
                incident={incidentWithoutTicketMock}
                onIncidentChange={onIncidentChange}
              />
            )
        });

        // User clicks on the Create Ticket button
        const createTicketButton = screen.getByRole('button', {name: /create ticket/i});
        userEvent.click(createTicketButton);

        // User cancels create ticket action in the dialog
        const dialogCancelButton = screen.getByRole('button', {name: /no/i});
        expect(dialogCancelButton).toBeInTheDocument();
        userEvent.click(dialogCancelButton);

        // Spinner is not present within create ticket button
        expect(within(createTicketButton).queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it("should stop displaying spinner within create ticket button after error on create ticket operation", async () => {
        createTicketSpy.mockRejectedValue(new Error("Create ticket test error"));

        await waitFor(() => {
            render(
              <IncidentDetails
                incident={incidentWithoutTicketMock}
                onIncidentChange={onIncidentChange}
              />
            )
        });

        // User clicks on the Create Ticket button
        const createTicketButton = screen.getByRole('button', {name: /create ticket/i});
        userEvent.click(createTicketButton);

        // User confirms create ticket action
        const dialogSubmitButton = screen.getByRole('button', {name: /yes/i});
        expect(dialogSubmitButton).toBeInTheDocument();
        userEvent.click(dialogSubmitButton);

        // Spinner appears within create ticket button
        const createTicketProgress = within(createTicketButton).getByRole('progressbar');
        expect(createTicketProgress).toBeInTheDocument();

        // Create ticket endpoint was called with correct incident pk
        expect(createTicketSpy).toHaveBeenCalledTimes(1)
        expect(createTicketSpy).toHaveBeenCalledWith(4000)

        // Spinner within create ticket button disappears
        await waitForElementToBeRemoved(createTicketProgress);
    });

    it("should stop displaying spinner within create ticket button after success on create ticket operation", async () => {
        await waitFor(() => {
            render(
              <IncidentDetails
                incident={incidentWithoutTicketMock}
                onIncidentChange={onIncidentChange}
              />
            )
        });

        // User clicks on the Create Ticket button
        const createTicketButton = screen.getByRole('button', {name: /create ticket/i});
        userEvent.click(createTicketButton);

        // User confirms create ticket action
        const dialogSubmitButton = screen.getByRole('button', {name: /yes/i});
        expect(dialogSubmitButton).toBeInTheDocument();
        userEvent.click(dialogSubmitButton);

        // Spinner appears within create ticket button
        const createTicketProgress = within(createTicketButton).getByRole('progressbar');
        expect(createTicketProgress).toBeInTheDocument();

        // Create ticket endpoint was called with correct incident pk
        expect(createTicketSpy).toHaveBeenCalledTimes(1)
        expect(createTicketSpy).toHaveBeenCalledWith(4000)
        expect(createTicketSpy).toHaveReturnedWith(Promise.resolve({ticket_url: generatedTicketUrlMockValue}))

        // Spinner within create ticket button disappears
        await waitForElementToBeRemoved(createTicketProgress);
    });
});

describe('Primary Details section: Source internal incident ID',() => {
    const defaultIncidentMock: Incident = {
        level: 1,
        pk: 5000,
        start_time: '2021-06-28 08:29:06',
        end_time: 'infinity',
        stateful: true,
        details_url: '',
        description: 'Test default incident',
        ticket_url: '',
        open: true,
        acked: false,

        source: {...sourceSystemMock, name: 'test argus'},
        source_incident_id: '5001',

        tags: incidentTagsMock
    };

    const incidentWithoutSourceSystemNameMock : Incident = {
        ...defaultIncidentMock,
        pk: 6000,
        description: 'Test incident without source system name',
        source: {...sourceSystemMock, name: ''},
        source_incident_id: '6001',
    };

    const incidentWithoutSourceInternalIDMock: Incident = {
        ...defaultIncidentMock,
        pk: 7000,
        description: 'Test incident without source internal ID',
        source_incident_id: '',
    };

    it("should correctly render detail item when valid incident is provided", async () => {
        await waitFor(() => {
            render(
              <IncidentDetails
                incident={defaultIncidentMock}
                onIncidentChange={onIncidentChange}
              />
            )
        });

        const sourceInternalIDItem = screen.getByRole('listitem', {name: /source-internal-id-item/i});
        expect(sourceInternalIDItem).toBeInTheDocument();

        // Primary text includes incident's source system name
        expect(sourceInternalIDItem).toHaveTextContent(`Incident ID in ${defaultIncidentMock.source.name}`);

        // Secondary text displays incident's source internal ID
        expect(sourceInternalIDItem).toHaveTextContent(defaultIncidentMock.source_incident_id);
    });

    it("should render generic description and ID info when incident with no source system name is provided", async () => {
        await waitFor(() => {
            render(
              <IncidentDetails
                incident={incidentWithoutSourceSystemNameMock}
                onIncidentChange={onIncidentChange}
              />
            )
        });

        const sourceInternalIDItem = screen.getByRole('listitem', {name: /source-internal-id-item/i});
        expect(sourceInternalIDItem).toBeInTheDocument();

        // Primary text contains a generic description
        expect(sourceInternalIDItem).toHaveTextContent(/incident id in source system/i);

        // Secondary text displays incident's source internal ID
        expect(sourceInternalIDItem).toHaveTextContent(incidentWithoutSourceSystemNameMock.source_incident_id);
    });

    it("should render correct description and dash instead of ID when incident with no source internal ID info is provided", async () => {
        await waitFor(() => {
            render(
              <IncidentDetails
                incident={incidentWithoutSourceInternalIDMock}
                onIncidentChange={onIncidentChange}
              />
            )
        });

        const sourceInternalIDItem = screen.getByRole('listitem', {name: /source-internal-id-item/i});
        expect(sourceInternalIDItem).toBeInTheDocument();

        // Primary text includes incident's source system name
        expect(sourceInternalIDItem).toHaveTextContent(`Incident ID in ${incidentWithoutSourceInternalIDMock.source.name}`);

        // Secondary text displays dash
        expect(sourceInternalIDItem).toHaveTextContent("–");
    });
});
