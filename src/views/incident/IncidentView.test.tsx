/**  * @jest-environment jsdom-sixteen  */

import React from "react";
import {
  render,
  screen,
  waitFor, waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";

import api from "../../api";
import client from "../../api";
import auth from "../../auth";
import {
  CursorPaginationResponse,
  Filter,
  FilterSuccessResponse,
  Incident,
  IncidentMetadata, IncidentTag,
  SourceSystem,
} from "../../api/types";
import IncidentView from "./IncidentView";
import { MemoryRouter } from "react-router-dom";
import App from "../../App";
import { createMemoryHistory } from "history";
import userEvent from "@testing-library/user-event";

// Mocks of critical functions and modules
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

const EXISTING_TAGS: IncidentTag[] = [
  {added_by: 1, added_time: '2021-06-28 08:29:06', tag: 'test=test'},
  {added_by: 1, added_time: '2021-06-29 08:29:06', tag: 'test=test1'},
  {added_by: 1, added_time: '2021-06-28 08:29:06', tag: 'test=test2'}
]

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
    source_incident_id: '1000',

    tags: [
      EXISTING_TAGS[0]
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
    source_incident_id: '2000',

    tags: [
      EXISTING_TAGS[1],
      EXISTING_TAGS[2]
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
    source_incident_id: '3000',

    tags: [
      EXISTING_TAGS[0]
    ]
  },
  {
    pk: 4000,
    start_time: '2021-06-28 08:29:06',
    end_time: '2021-08-28 08:29:06',
    stateful: true,
    details_url: '',
    description: 'Low severity incident',
    ticket_url: 'http://test.test',
    open: false,
    acked: false,
    level: 4,

    source: KNOWN_SOURCE_SYSTEMS[1],
    source_incident_id: '4000',

    tags: [
      EXISTING_TAGS[0]
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

const FILTER_SUCCESS_RES: FilterSuccessResponse[] = [];

const cursorPaginationMock: CursorPaginationResponse<Incident> = {
  next: null,
  previous: null,
  results: EXISTING_INCIDENTS
}

// Existing incidents counts
const OPEN_AND_UNACKED_COUNT =
  EXISTING_INCIDENTS.filter(i => i.open && !i.acked).length;
const CLOSED_AND_UNACKED_COUNT =
  EXISTING_INCIDENTS.filter(i => !i.open && !i.acked).length;
const ACKED_COUNT =
  EXISTING_INCIDENTS.filter(i => i.acked).length;
const UNACKED_COUNT =
  EXISTING_INCIDENTS.length - ACKED_COUNT;
const OPEN_COUNT =
  EXISTING_INCIDENTS.filter(i => i.open).length;
const CLOSED_COUNT =
  EXISTING_INCIDENTS.length - OPEN_COUNT;


// For avoiding authentication errors
beforeAll(() => {
  auth.login("token");
});

afterAll(() => {
  auth.logout();
});

// Mocking api return values
beforeEach(() => {
  paginationSpy.mockResolvedValue(cursorPaginationMock);
  apiMock
    .onGet("/api/v1/incidents/metadata/")
    .reply(200, {sourceSystems: KNOWN_SOURCE_SYSTEMS} as IncidentMetadata)
    .onGet("/api/v1/incidents/")
    .reply(200, EXISTING_INCIDENTS)
    .onGet('/api/v1/notificationprofiles/filters/')
    .reply(200, FILTER_SUCCESS_RES);
});

afterEach(() => {
  apiMock.reset();
  jest.clearAllMocks();
  jest.resetAllMocks();
});

describe('Incidents Page: initial state rendering', () => {

  const consoleErrorsSpy = jest.spyOn(console, 'error');

  // Mocking api return values
  beforeEach(() => {
    consoleErrorsSpy.mockReset();
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

describe('Incidents Table: reflects user interactions with Incidents Filter Toolbar', () => {

  beforeEach(() => {
    render(
      <MemoryRouter>
        <IncidentView />
      </MemoryRouter>
    );
  });

  describe('User interacts with the Open State Switch', () => {

    it("should display closed incidents only", async () => {

      // Check correct counts after rendering with initial conditions
      expect(screen.getAllByRole('cell', { name: /non-acked/i }))
        .toHaveLength(OPEN_AND_UNACKED_COUNT);
      expect(screen.queryByRole('cell', { name: /closed/i }))
        .toBeNull();

      // Simulate switching to showing closed incidents only (filter update event)
      const closedStateBtn = screen.getByTitle('Only closed incidents');
      userEvent.click(closedStateBtn);

      // Check correct counts after filter update event
      expect(await screen.findAllByRole('cell', { name: /non-acked/i }))
        .toHaveLength(CLOSED_AND_UNACKED_COUNT);
      expect(screen.queryByRole('cell', { name: /open/i }))
        .toBeNull();
    });

    it("should display both open and closed incidents", async () => {

      // Check correct counts after a preceding user interaction
      expect(screen.getAllByRole('cell', { name: /non-acked/i }))
        .toHaveLength(CLOSED_AND_UNACKED_COUNT);
      expect(screen.queryByRole('cell', { name: /open/i }))
        .toBeNull();

      // Simulate switching to showing both open and closed incidents (filter update event)
      const bothOpenStatesBtn = screen.getByTitle('Both open and closed incidents');
      userEvent.click(bothOpenStatesBtn);

      // Check correct counts after filter update event
      expect(await screen.findAllByRole('cell', { name: /non-acked/i }))
        .toHaveLength(UNACKED_COUNT);

      // Check that all incidents links are rendered
      const incidentTable = screen.getByRole('table');
      EXISTING_INCIDENTS.filter(i => !i.acked)
        .forEach((incident, index, array) => {
          expect(incidentTable
            .querySelector(`[href="/incidents/${incident.pk}/"]`) as HTMLElement)
            .toBeInTheDocument();
        });
    });

    it("should display open incidents only", async () => {

      // Check correct counts after a preceding user interaction
      expect(screen.getAllByRole('cell', { name: /non-acked/i }))
        .toHaveLength(UNACKED_COUNT);

      // Simulate switching to showing open incidents only (filter update event)
      const openStateBtn = screen.getByTitle('Only open incidents');
      userEvent.click(openStateBtn);

      // Check correct counts after filter update event
      expect(await screen.findAllByRole('cell', { name: /non-acked/i }))
        .toHaveLength(OPEN_AND_UNACKED_COUNT);
      expect(screen.queryByRole('cell', { name: /closed/i }))
        .toBeNull();

      // Check that all incidents links are rendered
      const incidentTable = screen.getByRole('table');
      EXISTING_INCIDENTS.filter(i => i.open && !i.acked)
        .forEach((incident, index, array) => {
          expect(incidentTable
            .querySelector(`[href="/incidents/${incident.pk}/"]`) as HTMLElement)
            .toBeInTheDocument();
        });
    });
  });
  
});