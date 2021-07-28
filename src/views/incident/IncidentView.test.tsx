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
    description: 'Critical test incident',
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

  it("should render with correct initial data", async () => {
    const history = createMemoryHistory();
    history.push("/");

    await waitFor(() => {
      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      );
    });

    screen.debug(document.body, 100000);

    // Header is rendered correctly
    expect(screen.getByRole('img', {name: /argus logo/i})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /argus logo/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Incidents'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /timeslots/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /profiles/i})).toBeInTheDocument();
    // expect(screen.getByLabelText('User')).toBeInTheDocument();

    // Incidents filter toolbar is present
    // Correct rendering of incidents filter toolbar is tested in its own test suite
    expect(screen.getByTestId('incidents-toolbar')).toBeInTheDocument();

    // Additional settings button is rendered
    expect(screen.getByTitle('Additional settings')).toBeInTheDocument();

    // Incidents table is rendered correctly
    const incidentsTable = screen.getByRole('table');
    expect(incidentsTable).toBeInTheDocument();

    expect(within(incidentsTable).getAllByRole('row').length).toBe(2);
  });
});
