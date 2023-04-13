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
const authTokenSpy = jest.spyOn(auth, 'token');
const authIsAuthenticatedSpy = jest.spyOn(auth, 'isAuthenticated');

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

  filter: {
    sourceSystemIds: [],
    tags: [],
  }
}

const FILTER_SUCCESS_RES: FilterSuccessResponse[] = [];

const cursorPaginationMock: CursorPaginationResponse<Incident> = {
  next: null,
  previous: null,
  results: EXISTING_INCIDENTS
}

const SERVER_METADATA_RESPONSE = {
  "server-version": "1.2.3",
  "api-version": {
    "stable": "v1",
    "unstable": "v2"
  },
  "jsonapi-schema": {
    "stable": "/api/schema/",
    "v1": "/api/v1/schema/",
    "v2": "/api/v2/schema/"
  }
};

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
  authTokenSpy.mockImplementation(() => "token");
  authIsAuthenticatedSpy.mockImplementation(() => true);
  paginationSpy.mockResolvedValue(cursorPaginationMock);
  apiMock
    .onPost("/api/v1/token-auth/")
    .reply(200, { token: "token" })
    .onGet("/api/v1/auth/user/")
    // eslint-disable-next-line @typescript-eslint/camelcase
    .reply(200, { username: "test", first_name: "test", last_name: "test", email: "test" })
    .onGet("/api/v1/incidents/metadata/")
    .reply(200, {sourceSystems: KNOWN_SOURCE_SYSTEMS} as IncidentMetadata)
    .onGet("/api/v1/incidents/")
    .reply(200, EXISTING_INCIDENTS)
    .onGet('/api/v1/notificationprofiles/filters/')
    .reply(200, FILTER_SUCCESS_RES)
    .onGet("/api/")
    .reply(200, SERVER_METADATA_RESPONSE)
;
});

afterEach(() => {
  apiMock.reset();
  authTokenSpy.mockReset();
  authIsAuthenticatedSpy.mockReset();
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
    expect(screen.getByTitle(/additional settings/i)).toBeInTheDocument();

    // Incidents table is rendered correctly
    const incidentsTable = screen.getByRole('table');
    expect(incidentsTable).toBeInTheDocument();

    // Expect a header row, plus 2 incident rows to be rendered.
    // Since the default filter (only open, only unacked incidents)
    // is used for any initial render, only 2/3 of the
    // EXISTING_INCIDENTS are expected to be rendered.
    const tableRows = within(incidentsTable).getAllByRole('row');
    expect(tableRows.length).toBe(3);

    // Check correct rendering of table header row
    expect(within(tableRows[0]).getAllByRole('columnheader').length).toBe(7);
    expect(within(tableRows[0]).getByRole('checkbox', { checked: false }))
        .toBeInTheDocument();
    expect(within(tableRows[0])
        .getByRole('columnheader', { name: /timestamp/i}))
        .toBeInTheDocument();
    expect(within(tableRows[0])
        .getByRole('columnheader', { name: /status/i}))
        .toBeInTheDocument();
    expect(within(tableRows[0])
        .getByRole('columnheader', { name: /severity level/i}))
        .toBeInTheDocument();
    expect(within(tableRows[0])
        .getByRole('columnheader', { name: /source/i}))
        .toBeInTheDocument();
    expect(within(tableRows[0])
        .getByRole('columnheader', { name: /description/i}))
        .toBeInTheDocument();
    expect(within(tableRows[0])
        .getByRole('columnheader', { name: /actions/i}))
        .toBeInTheDocument();

    // Check correct rendering of row 1
    expect(within(tableRows[1]).getAllByRole('cell').length).toBe(7);
    expect(within(tableRows[1]).getByRole('checkbox', { checked: false }))
      .toBeInTheDocument();
    expect(within(tableRows[1])
      .getByRole('cell', { name: EXISTING_INCIDENTS[0].start_time.slice(0,-3)}))
      .toBeInTheDocument();
    expect(within(tableRows[1])
      .getByRole('cell', { name: /open unacked/i}))
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
      .getByRole('cell', { name: /open unacked/i}))
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
      expect(screen.getAllByRole('cell', { name: /unacked/i }))
        .toHaveLength(OPEN_AND_UNACKED_COUNT);
      expect(screen.queryByRole('cell', { name: /closed/i }))
        .toBeNull();

      // Simulate switching to showing closed incidents only (filter update event)
      const closedStateBtn = screen.getByTitle('Only closed incidents');
      userEvent.click(closedStateBtn);

      // Check correct counts after filter update event
      expect(await screen.findAllByRole('cell', { name: /unacked/i }))
        .toHaveLength(CLOSED_AND_UNACKED_COUNT);
      expect(screen.queryByRole('cell', { name: /open/i }))
        .toBeNull();
    });

    it("should display both open and closed incidents", async () => {

      // Check correct counts after a preceding user interaction
      expect(screen.getAllByRole('cell', { name: /unacked/i }))
        .toHaveLength(CLOSED_AND_UNACKED_COUNT);
      expect(screen.queryByRole('cell', { name: /open/i }))
        .toBeNull();

      // Simulate switching to showing both open and closed incidents (filter update event)
      const bothOpenStatesBtn = screen.getByTitle('Both open and closed incidents');
      userEvent.click(bothOpenStatesBtn);

      // Check correct counts after filter update event
      expect(await screen.findAllByRole('cell', { name: /unacked/i }))
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
      expect(screen.getAllByRole('cell', { name: /unacked/i }))
        .toHaveLength(UNACKED_COUNT);

      // Simulate switching to showing open incidents only (filter update event)
      const openStateBtn = screen.getByTitle('Only open incidents');
      userEvent.click(openStateBtn);

      // Check correct counts after filter update event
      expect(await screen.findAllByRole('cell', { name: /unacked/i }))
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

  describe('User interacts with the Acked Switch', () => {

    beforeEach(() => {
      // Simulate switching to showing open incidents only (filter update event)
      const openStateBtn = screen.getByTitle('Only open incidents');
      userEvent.click(openStateBtn);
      // Simulate switching to showing unacked incidents only (filter update event)
      const unackedStateBtn = screen.getByTitle('Only unacked incidents');
      userEvent.click(unackedStateBtn);
    });

    it("should display no incidents", async () => {

      // Check correct counts after rendering with initial conditions
      expect(await screen.findAllByRole('cell', { name: /unacked/i }))
        .toHaveLength(OPEN_AND_UNACKED_COUNT);
      expect(screen.queryByRole('cell', { name: /closed/i }))
        .toBeNull();

      // Simulate switching to showing acked incidents only (filter update event)
      const ackedStateBtn = screen.getByTitle('Only acked incidents');
      userEvent.click(ackedStateBtn);

      // Wait until table rows are replaced with "No incidents" text
      await screen.findByText(/no incidents/i);

      // Expect that only header row is rendered
      expect(screen.getAllByRole('row'))
        .toHaveLength(1);
    });

    it("should display both acked and unacked incidents", async () => {

      // Check correct counts after rendering with initial conditions
      expect(await screen.findAllByRole('cell', { name: /unacked/i }))
        .toHaveLength(OPEN_AND_UNACKED_COUNT);
      expect(screen.queryByRole('cell', { name: /closed/i }))
        .toBeNull();

      // Simulate switching to showing both acked and unacked incidents (filter update event)
      const bothAckedStatesButton = screen.getByTitle('Both acked and unacked incidents');
      userEvent.click(bothAckedStatesButton);

      // Wait until table rows appear
      await screen.findAllByRole('row');

      // Expect correct counts after filter update event
      expect(screen.getAllByRole('row'))
        .toHaveLength(OPEN_COUNT + 1); // incidents rows plus header row
      expect(screen.queryByRole('cell', { name: /closed/i }))
        .toBeNull();
    });
  });

  describe('User interacts with the Source Selector', () => {

    const TESTED_SOURCE_NAME = KNOWN_SOURCE_SYSTEMS[0].name;

    // Existing incidents count
    const TESTED_SOURCE_COUNT =
      EXISTING_INCIDENTS.filter(i =>
        i.source.name === TESTED_SOURCE_NAME).length;

    // Source systems count
    const SOURCE_0_COUNT =
      EXISTING_INCIDENTS.filter(i =>
        i.source.name === KNOWN_SOURCE_SYSTEMS[0].name).length;
    const SOURCE_1_COUNT =
      EXISTING_INCIDENTS.filter(i =>
        i.source.name === KNOWN_SOURCE_SYSTEMS[1].name).length;

    beforeEach(() => {
      // Simulate switching to showing both open and closed incidents (filter update event)
      const bothOpenStatesBtn = screen.getByTitle('Both open and closed incidents');
      userEvent.click(bothOpenStatesBtn);
      // Simulate switching to showing both acked and unacked incidents (filter update event)
      const bothAckedStatesButton = screen.getByTitle('Both acked and unacked incidents');
      userEvent.click(bothAckedStatesButton);
    });

    it("should silently ignore non-existent source name", async () => {

      // Check correct counts after rendering with initial conditions
      expect(await screen.findAllByRole('row'))
        .toHaveLength(EXISTING_INCIDENTS.length + 1); // including header row

      // Simulate filtering after non-existent source system
      const sourcesSelectorInput = screen.getByPlaceholderText('Source name');
      userEvent.type(sourcesSelectorInput, 'Non-existent Source System{enter}');

      // Expect invalid source name to be removed from the input field
      expect(sourcesSelectorInput).toBeEmpty();

      // Expect same incident count as table loading component (8 MUI Skeleton components + header row)
      expect(await screen.findAllByRole('row'))
          .toHaveLength(9); 

      // Expect same incident count as before typing a non-existing source name
      expect(await screen.findAllByRole('row'))
        .toHaveLength(EXISTING_INCIDENTS.length + 1); // including header row
    });

    it("should display only incidents of a given source system", async () => {

      // Check correct counts after a preceding user interaction
      expect(await screen.findAllByRole('row'))
        .toHaveLength(EXISTING_INCIDENTS.length + 1); // including header row

      // Simulate filtering after an existent source system
      const sourcesSelectorInput = screen.getByPlaceholderText('Source name');
      userEvent.type(sourcesSelectorInput, `${TESTED_SOURCE_NAME}{enter}`);

      // Wait until table rows appear
      await screen.findAllByRole('row');

      // Expect correct counts after filter update event
      expect(await screen.findAllByRole('row'))
        .toHaveLength(TESTED_SOURCE_COUNT + 1); // including header row

    });

    it("should display all incidents (all source systems provided)", async () => {

      // Check correct counts after a preceding user interaction
      expect(await screen.findAllByRole('row'))
        .toHaveLength(TESTED_SOURCE_COUNT + 1); // including header row

      // Simulate filtering after all existent source systems (provide all systems)
      const sourcesSelectorInput = screen.getByPlaceholderText('Source name');

      // Add remaining (after previous test) source system name in the input field
      userEvent.type(sourcesSelectorInput, `${KNOWN_SOURCE_SYSTEMS[1].name}{enter}`);

      // Wait until table rows appear
      await screen.findAllByRole('row');
      // Expect correct counts after filter update event
      expect(screen.getAllByRole('row'))
        .toHaveLength(EXISTING_INCIDENTS.length + 1); // including header row
    });

    it("should display all incidents (all source systems removed)", async () => {

      // Check correct counts after a preceding user interaction
      expect(await screen.findAllByRole('row'))
        .toHaveLength(EXISTING_INCIDENTS.length + 1); // including header row

      const lastRefreshedVal = screen.getByText(/last refreshed/i).textContent;

      // Simulate filtering after all existent source systems (clear all systems)
      const sourcesSelectorInput = screen.getByPlaceholderText('Source name');
      userEvent.clear(sourcesSelectorInput);

      // Wait until table rows appear
      await screen.findAllByRole('row');

      // Expect correct counts after filter update event
      expect(screen.getAllByRole('row'))
        .toHaveLength(EXISTING_INCIDENTS.length + 1); // including header row
      // Expect a new "Last refreshed" time value
      expect(screen.getByText(/last refreshed/i))
        .not.toHaveValue(lastRefreshedVal);
    });
  });

  describe('User interacts with the Tags Selector', () => {

    const TESTED_TAG = EXISTING_TAGS[0];

    // Existing incidents count
    const TESTED_TAG_COUNT =
      EXISTING_INCIDENTS.filter(i =>
        i.tags.includes(TESTED_TAG)).length;

    beforeEach(() => {
      // Simulate switching to showing both open and closed incidents (filter update event)
      const bothOpenStatesBtn = screen.getByTitle('Both open and closed incidents');
      userEvent.click(bothOpenStatesBtn);
      // Simulate switching to showing both acked and unacked incidents (filter update event)
      const bothAckedStatesButton = screen.getByTitle('Both acked and unacked incidents');
      userEvent.click(bothAckedStatesButton);
    });

    it("should display no incidents", async () => {

      // Check correct counts after rendering with initial conditions
      expect(await screen.findAllByRole('row'))
        .toHaveLength(EXISTING_INCIDENTS.length + 1); // including header row

      // Simulate filtering after non-existent tag
      const tagsSelectorInput = screen.getByPlaceholderText('key=value');
      userEvent.type(tagsSelectorInput, 'test=notexistent{enter}');

      // Wait until table rows are replaced with "No incidents" text
      await screen.findByText(/no incidents/i);

      // Expect that only header row is rendered
      expect(screen.getAllByRole('row'))
        .toHaveLength(1); // header row only
    });

    it("should display only incidents with a given tag", async () => {

      // Check correct counts after a preceding user interaction
      expect(await screen.findAllByRole('row'))
        .toHaveLength(1); // header row only

      // Simulate filtering after a given tag
      const tagsSelectorInput = screen.getByPlaceholderText('key=value');
      userEvent.clear(tagsSelectorInput);
      userEvent.type(tagsSelectorInput, `${TESTED_TAG.tag}{enter}`);

      // Wait until table rows appear
      await screen.findAllByRole('row');

      // Expect correct counts after filter update event
      expect(screen.getAllByRole('row'))
        .toHaveLength(TESTED_TAG_COUNT + 1); // including header row
    });

    it("should display all incidents (all tags added)", async () => {

      // Check correct counts after a preceding user interaction
      expect(await screen.findAllByRole('row'))
        .toHaveLength(TESTED_TAG_COUNT + 1); // including header row

      // Simulate filtering after all existent tags (provide all tags)
      const tagsSelectorInput = screen.getByPlaceholderText('key=value');
      EXISTING_TAGS.forEach(tag => {
        userEvent.type(tagsSelectorInput, `${tag.tag}{enter}`);
      });

      // Wait until table rows appear
      await screen.findAllByRole('row');

      // Expect correct counts after filter update event
      expect(screen.getAllByRole('row'))
        .toHaveLength(EXISTING_INCIDENTS.length + 1); // including header row
    });

    it("should display all incidents (all tags removed)", async () => {

      // Check correct counts after a preceding user interaction
      expect(await screen.findAllByRole('row'))
        .toHaveLength(EXISTING_INCIDENTS.length + 1); // including header row

      const lastRefreshedVal = screen.getByText(/last refreshed/i).textContent;

      // Simulate filtering after all existent tags (clear all tags)
      const tagsSelectorInput = screen.getByPlaceholderText('key=value');
      userEvent.clear(tagsSelectorInput);

      // Wait until table rows appear
      await screen.findAllByRole('row');

      // Expect correct counts after filter update event
      expect(screen.getAllByRole('row'))
        .toHaveLength(EXISTING_INCIDENTS.length + 1); // including header row
      // Expect a new "Last refreshed" time value
      expect(screen.getByText(/last refreshed/i))
        .not.toHaveValue(lastRefreshedVal);
    });
  });
});

describe('Incidents Table: reflects incident modifications', () => {
  
  beforeEach(() => {
    render(
      <MemoryRouter>
        <IncidentView />
      </MemoryRouter>
    );
  });

  describe('User acknowledges an incident', () => {

    beforeEach(() => {
      // Simulate switching to showing open incidents only (filter update event)
      const openStateBtn = screen.getByTitle('Only open incidents');
      userEvent.click(openStateBtn);
      // Simulate switching to showing unacked incidents only (filter update event)
      const unackedStateBtn = screen.getByTitle('Only unacked incidents');
      userEvent.click(unackedStateBtn);

      apiMock
        .onPost('/api/v2/incidents/1000/acks/')
        .reply(201, {
          pk: 1000,
          event: {
            pk: 1000,
            incident: 1000,
            actor: {
              pk: 1,
              username: 'Test User'
            },
            timestamp: '2021-09-28 08:29:06',
            type: {
              value: "ACK",
              display: "ACK"
            },
            description: 'Acknowledged'
          },
          expiration: null
        })
        .onGet("/api/")
        .reply(200, SERVER_METADATA_RESPONSE);
    });

    it("should show 1 less incident", async () => {
      // Check correct initial counts
      expect(await screen.findAllByRole('row'))
        .toHaveLength(OPEN_AND_UNACKED_COUNT + 1); // including header row

      // Simulate incident ack event
      const incidentRow = screen.getAllByRole('row')[1];
      const incidentCheckbox = within(incidentRow).getByRole('checkbox');
      userEvent.click(incidentCheckbox);
      expect(incidentCheckbox).toBeChecked();

      const ackBtn = screen
        .getByRole('button', { name: 'Ack' });
      userEvent.click(ackBtn);

      await screen.findAllByRole('dialog');

      const msgInput = screen.getByRole('textbox', { name: /message/i });
      userEvent.type(msgInput, 'Acknowledged');
      const submitBtn = screen.getByRole('button', { name: /submit/i });
      userEvent.click(submitBtn);

      // Wait until table is updated
      await waitForElementToBeRemoved(incidentRow);
      await screen.findAllByRole('row');

      // Check that table displays 1 less incident
      expect(screen.getAllByRole('row'))
        .toHaveLength(OPEN_AND_UNACKED_COUNT);
    }, 10000);
  });

  describe('User closes an incident', () => {

    beforeEach(() => {
      // Simulate switching to showing open incidents only (filter update event)
      const openStateBtn = screen.getByTitle('Only open incidents');
      userEvent.click(openStateBtn);
      // Simulate switching to showing unacked incidents only (filter update event)
      const unackedStateBtn = screen.getByTitle('Only unacked incidents');
      userEvent.click(unackedStateBtn);

      apiMock
        .onPost('/api/v1/incidents/1000/events/',
          expect.objectContaining({
            type: "CLO",
            description: "Incident is fixed"
          })
        )
        .reply(201, {
          pk: 1000,
          incident: 1000,
          actor: {
            pk: 1,
            username: 'Test User'
          },
          timestamp: '2021-09-28 08:29:06',
          type: {
            value: "CLO",
            display: "CLO"
          },
          description: "Incident is fixed"
        })
        .onGet("/api/")
        .reply(200, SERVER_METADATA_RESPONSE);
    });

    it("should show 1 less incident", async () => {
      // Check correct initial counts
      expect(await screen.findAllByRole('row'))
        .toHaveLength(OPEN_AND_UNACKED_COUNT + 1); // including header row

      // Simulate incident ack event
      const incidentRow = screen.getAllByRole('row')[1];
      const incidentCheckbox = within(incidentRow).getByRole('checkbox');
      userEvent.click(incidentCheckbox);
      expect(incidentCheckbox).toBeChecked();

      const closeBtn = screen
        .getByRole('button', { name: /close selected/i });
      userEvent.click(closeBtn);

      await screen.findAllByRole('dialog');

      const msgInput = screen.getByRole('textbox', { name: /message/i });
      userEvent.type(msgInput, "Incident is fixed");
      const submitBtn = screen.getByRole('button', { name: /close now/i });
      userEvent.click(submitBtn);

      // Wait until table is updated
      await waitForElementToBeRemoved(incidentRow);
      await screen.findAllByRole('row');

      // Check that table displays 1 less incident
      expect(screen.getAllByRole('row'))
        .toHaveLength(OPEN_AND_UNACKED_COUNT);
    }, 10000);
  });

  describe('User reopens an incident', () => {

    beforeEach(() => {
      // Simulate switching to showing open incidents only (filter update event)
      const closedStateBtn = screen.getByTitle('Only closed incidents');
      userEvent.click(closedStateBtn);
      // Simulate switching to showing unacked incidents only (filter update event)
      const unackedStateBtn = screen.getByTitle('Only unacked incidents');
      userEvent.click(unackedStateBtn);

      apiMock
        .onPost('/api/v1/incidents/4000/events/',
          expect.objectContaining({
            type: "REO"
          })
        )
        .reply(201, {
          pk: 4000,
          incident: 4000,
          actor: {
            pk: 1,
            username: 'Test User'
          },
          timestamp: '2021-09-28 08:29:06',
          type: {
            value: "REO",
            display: "REO"
          },
          description: ""
        })
        .onGet("/api/")
        .reply(200, SERVER_METADATA_RESPONSE);
    });

    it("should show 1 less incident", async () => {
      // Check correct initial counts
      expect(await screen.findAllByRole('row'))
        .toHaveLength(CLOSED_AND_UNACKED_COUNT + 1); // including header row

      // Simulate incident ack event
      const incidentRow = screen.getAllByRole('row')[1];
      const incidentCheckbox = within(incidentRow).getByRole('checkbox');
      userEvent.click(incidentCheckbox);
      expect(incidentCheckbox).toBeChecked();

      const reopenBtn = screen
        .getByRole('button', { name: /re-open selected/i });
      userEvent.click(reopenBtn);

      const submitBtn = screen.getByRole('button', { name: /yes/i });
      userEvent.click(submitBtn);

      // Wait until table is updated
      await waitForElementToBeRemoved(incidentRow);
      await screen.findAllByRole('row');

      // Check that table displays 1 less incident
      expect(screen.getAllByRole('row'))
        .toHaveLength(CLOSED_AND_UNACKED_COUNT);
    }, 10000);
  });

  describe('User adds ticket to an incident', () => {

    beforeEach(() => {
      // Simulate switching to showing both open and closed incidents (filter update event)
      const bothOpenStatesBtn = screen.getByTitle('Both open and closed incidents');
      userEvent.click(bothOpenStatesBtn);
      // Simulate switching to showing both acked and unacked incidents (filter update event)
      const bothAckedStatesButton = screen.getByTitle('Both acked and unacked incidents');
      userEvent.click(bothAckedStatesButton);

      apiMock
        .onPut('/api/v1/incidents/1000/ticket_url/',
          expect.objectContaining({
            ticket_url: 'https://ticketurl.com'
          })
        )
        .reply(200, {
          ticket_url: 'https://ticketurl.com'
        });
    });

    it("should update incident's ticket url", async () => {
      // Check correct initial counts
      expect(await screen.findAllByRole('row'))
        .toHaveLength(EXISTING_INCIDENTS.length + 1); // including header row

      // Simulate incident ack event
      const incidentRow = screen.getAllByRole('row')[1];
      const incidentCheckbox = within(incidentRow).getByRole('checkbox');
      userEvent.click(incidentCheckbox);
      expect(incidentCheckbox).toBeChecked();

      const addTicketBtn = screen
        .getByRole('button', { name: /add ticket/i });
      userEvent.click(addTicketBtn);

      await screen.findAllByRole('dialog');

      const msgInput = screen.getByRole('textbox', { name: /valid ticket url/i });
      userEvent.type(msgInput, "https://ticketurl.com");
      const submitBtn = screen.getByRole('button', { name: /submit/i });
      userEvent.click(submitBtn);

      // Wait until table is updated
      await screen.findAllByRole('row');

      // Check that table displays same amount of incidents
      expect(screen.getAllByRole('row'))
        .toHaveLength(EXISTING_INCIDENTS.length + 1);
      // Check that the ticket link is updated
      expect(within(incidentRow).getByRole('link'))
        .toHaveAttribute('href', "https://ticketurl.com");
    }, 10000);
  });
});
