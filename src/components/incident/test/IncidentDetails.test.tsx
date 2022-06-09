/**  * @jest-environment jsdom-sixteen  */

import React from "react";
import { render, screen, within } from "@testing-library/react";

import IncidentDetails from "../IncidentDetails";
import { Incident, IncidentTag, SourceSystem } from "../../../api/types";


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

describe('Incident Details: end time and duration are displayed correctly, depending on incident status',() => {
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
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
        if (resolvedIncidentMock.end_time) {
            expect(within(endTimeItem).getByText(resolvedIncidentMock.end_time)).toBeInTheDocument()
        }

        // Duration item is displayed
        const durationItem = within(primaryDetailsContainer).getByTitle(/duration/i)
        expect(durationItem).toBeInTheDocument()
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