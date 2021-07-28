/**  * @jest-environment jsdom-sixteen  */

import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";

import api from "../../api";
import client from "../../api";
import auth from "../../auth";
import { CursorPaginationResponse, Filter, Incident, IncidentMetadata, SourceSystem } from "../../api/types";
import IncidentView from "./IncidentView";
import { MemoryRouter } from "react-router-dom";
import App from "../../App";
import { createMemoryHistory } from "history";

// Mocks of critical functions and modules
const consoleErrorsSpy = jest.spyOn(console, 'error');
const paginationSpy = jest.spyOn(client, 'getPaginatedIncidentsFiltered');
const apiMock = new MockAdapter(api.api);

// Mocks of initial data
const KNOWN_SOURCE_SYSTEMS: SourceSystem[] = [
  {
    pk: 100,
    name: 'Test Source System',
    type: 'Test Type'
  },
  {
    pk: 200,
    name: 'Test Source System 1',
    type: 'Test Type'
  }
];

const EXISTING_INCIDENTS: Incident[] = [
  {
    pk: 1000,
    start_time: '2021-06-28 08:29:06',
    end_time: '2021-08-28 08:29:06',
    stateful: true,
    details_url: '',
    description: 'Not critical test incident',
    ticket_url: '',
    open: true,
    acked: false,
    level: 5,

    source: KNOWN_SOURCE_SYSTEMS[0],
    source_incident_id: '1001',

    tags: [
      {added_by: 1, added_time: '2021-06-28 08:29:06', tag: 'Test tag'}
    ]
  },
  {
    pk: 2000,
    start_time: '2021-06-28 08:29:06',
    end_time: '2021-08-28 08:29:06',
    stateful: true,
    details_url: '',
    description: 'High severity incident',
    ticket_url: '',
    open: false,
    acked: true,
    level: 2,

    source: KNOWN_SOURCE_SYSTEMS[1],
    source_incident_id: '2001',

    tags: [
      {added_by: 1, added_time: '2021-06-29 08:29:06', tag: 'Test tag 1'},
      {added_by: 1, added_time: '2021-06-28 08:29:06', tag: 'Test tag 2'}
    ]
  },
  {
    pk: 3000,
    start_time: '2021-06-28 08:29:06',
    end_time: '2021-08-28 08:29:06',
    stateful: true,
    details_url: '',
    description: 'Low severity incident',
    ticket_url: 'http://test.test',
    open: true,
    acked: false,
    level: 4,

    source: KNOWN_SOURCE_SYSTEMS[1],
    source_incident_id: '3001',

    tags: [
      {added_by: 1, added_time: '2021-06-28 08:29:06', tag: 'Test tag'}
    ]
  }
];

const EXISTING_FILTER: Filter = {
  pk: 10,
  name: 'All',
  sourceSystemIds: [],
  tags: [],

  filter: {}
}

const cursorPaginationMock: CursorPaginationResponse<Incident> = {
  next: null,
  previous: null,
  results: EXISTING_INCIDENTS
}


// For avoiding authentication errors
beforeAll(() => {
  auth.login("token");
});

afterAll(() => {
  auth.logout();
});

describe('Incidents Page: initial state rendering', () => {

  // Mocking api return values
  beforeEach(() => {
    consoleErrorsSpy.mockReset();
    paginationSpy.mockResolvedValue(cursorPaginationMock);
    apiMock
      .onGet("/api/v1/incidents/metadata/")
      .reply(200, {sourceSystems: KNOWN_SOURCE_SYSTEMS} as IncidentMetadata)
      .onGet("/api/v1/incidents/")
      .reply(200, EXISTING_INCIDENTS);
  });

  afterEach(() => {
    apiMock.reset();
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should render without compile time errors', () => {
    render(
      <MemoryRouter>
        <IncidentView />
      </MemoryRouter>
    );
  });

  it("should render without runtime errors", async () => {
    await waitFor(() => {
      render(
        <MemoryRouter>
          <IncidentView />
        </MemoryRouter>
      );
    });

    // Checks that React does not output error messages to the console.
    // It is a useful assertion since absence of console errors from
    // React equates to the absence of an error page in a dev mode,
    // as well as a blank page in a production mode.
    expect(consoleErrorsSpy).not.toHaveBeenCalled();
  });

  it("should render with correct initial data and default filter", async () => {
    const history = createMemoryHistory();
    history.push("/");

    await waitFor(() => {
      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      );
    });

    // Header is rendered correctly
    expect(screen.getByRole('img', {name: /argus logo/i})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /argus logo/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Incidents'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /timeslots/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /profiles/i})).toBeInTheDocument();

    // Incidents filter toolbar is present
    // Correct rendering of incidents filter toolbar is tested in its own test suite
    expect(screen.getByTestId('incidents-toolbar')).toBeInTheDocument();

    // Additional settings button is rendered
    expect(screen.getByTitle('Additional settings')).toBeInTheDocument();

    // Incidents table is rendered correctly
    const incidentsTable = screen.getByRole('table');
    expect(incidentsTable).toBeInTheDocument();

    // Expect a header row, plus 2 incident rows to be rendered.
    // Since the default filter (only open, only unacked incidents)
    // is used for any initial render, only 2/3 of the
    // EXISTING_INCIDENTS are expected to be rendered.
    const tableRows = within(incidentsTable).getAllByRole('row');
    expect(tableRows.length).toBe(3);

    // Check correct rendering of header row
    expect(within(tableRows[0]).getAllByRole('columnheader').length).toBe(7);

    // Check correct rendering of row 1
    expect(within(tableRows[1]).getAllByRole('cell').length).toBe(7);
    expect(within(tableRows[1]).getByRole('checkbox', { checked: false }))
      .toBeInTheDocument();
    expect(within(tableRows[1])
      .getByRole('cell', { name: EXISTING_INCIDENTS[0].start_time.slice(0,-3)}))
      .toBeInTheDocument();
    expect(within(tableRows[1])
      .getByRole('cell', { name: /open non-acked/i}))
      .toBeInTheDocument();
    expect(within(tableRows[1])
      .getByRole('cell', { name: new RegExp(EXISTING_INCIDENTS[0].level.toString())}))
      .toBeInTheDocument();
    expect(within(tableRows[1])
      .getByRole('cell', { name: EXISTING_INCIDENTS[0].source.name}))
      .toBeInTheDocument();
    expect(within(tableRows[1])
      .getByRole('cell', { name: EXISTING_INCIDENTS[0].description}))
      .toBeInTheDocument();
    expect(within(tableRows[1]).getByRole('button'))
      .toHaveAttribute('href', `/incidents/${EXISTING_INCIDENTS[0].pk}/`);
    EXISTING_INCIDENTS[0].ticket_url ?
      expect(within(tableRows[1]).getByRole('link'))
        .toHaveAttribute('href', EXISTING_INCIDENTS[0].ticket_url)
      :
      expect(() => within(tableRows[1]).getByRole('link')).toThrow;


    // Check correct rendering row 2
    expect(within(tableRows[2]).getAllByRole('cell').length).toBe(7);
    expect(within(tableRows[2]).getByRole('checkbox', { checked: false })).toBeInTheDocument();
    expect(within(tableRows[2])
      .getByRole('cell', { name: EXISTING_INCIDENTS[2].start_time.slice(0,-3)}))
      .toBeInTheDocument();
    expect(within(tableRows[2])
      .getByRole('cell', { name: /open non-acked/i}))
      .toBeInTheDocument();
    expect(within(tableRows[2])
      .getByRole('cell', { name: new RegExp(EXISTING_INCIDENTS[2].level.toString())}))
      .toBeInTheDocument();
    expect(within(tableRows[2])
      .getByRole('cell', { name: EXISTING_INCIDENTS[2].source.name}))
      .toBeInTheDocument();
    expect(within(tableRows[2])
      .getByRole('cell', { name: EXISTING_INCIDENTS[2].description}))
      .toBeInTheDocument();
    expect(within(tableRows[2]).getByRole('button'))
      .toHaveAttribute('href', `/incidents/${EXISTING_INCIDENTS[2].pk}/`);
    EXISTING_INCIDENTS[2].ticket_url ?
      expect(within(tableRows[2]).getByRole('link'))
        .toHaveAttribute('href', EXISTING_INCIDENTS[2].ticket_url)
      :
      expect(within(tableRows[2]).getByRole('link')).not.toBeInTheDocument();
  });
});
