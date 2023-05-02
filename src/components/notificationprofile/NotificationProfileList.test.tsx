import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Destination, Filter, Media, NotificationProfile, Timeslot } from "../../api/types";
import NotificationProfileList from "./NotificationProfileList";
import MockAdapter from "axios-mock-adapter";
import api from "../../api/client";
import auth from "../../auth";

// MOCK API
const apiMock = new MockAdapter(api.api);
const authTokenSpy = jest.spyOn(auth, "token");
const authIsAuthenticatedSpy = jest.spyOn(auth, "isAuthenticated");

// MOCK DATA
const filters: Filter[] = [
  {
    pk: 1,
    name: "Filter1",
    // @ts-ignore
    sourceSystemIds: [],
    tags: [],
    filter: {},
  },
  {
    pk: 2,
    name: "Filter2",
    // @ts-ignore
    sourceSystemIds: [],
    tags: [],
    filter: {},
  },
];

const media: Media[] = [
  { slug: "email", name: "Email" },
  { slug: "sms", name: "SMS" },
];

const destinationsArray: Destination[] = [
  {
    pk: 1,
    label: "test_sms",
    media: media[1],
    suggested_label: "SMS: +4747474747",
    settings: {
      phone_number: "+4747474747",
    },
  },
  {
    pk: 2,
    label: "test_email",
    media: media[0],
    suggested_label: "Email: test@test.test",
    settings: {
      email_address: "test@test.test",
      synced: false,
    },
  },
  {
    pk: 3,
    label: "test_email_synced",
    media: media[0],
    suggested_label: "Email: synced@test.test",
    settings: {
      email_address: "synced@test.test",
      synced: true,
    },
  },
];

// For avoiding authentication errors
beforeAll(() => {
  auth.login("token");
});
afterAll(() => {
  auth.logout();
});

describe("Rendering profile list with no existing timeslots", () => {
  beforeEach(() => {
    authTokenSpy.mockImplementation(() => "token");
    authIsAuthenticatedSpy.mockImplementation(() => true);
    apiMock
      .onPost("/api/v1/token-auth/")
      .reply(200, { token: "token" })
      .onGet("/api/v1/auth/user/")
      // eslint-disable-next-line @typescript-eslint/camelcase
      .reply(200, { username: "test", first_name: "test", last_name: "test", email: "test" })
      .onGet("/api/v2/notificationprofiles/")
      .reply(200, [] as NotificationProfile[])
      .onGet("/api/v2/notificationprofiles/timeslots/")
      .reply(200, [] as Timeslot[])
      .onGet("/api/v2/notificationprofiles/filters/")
      .reply(200, filters as Filter[])
      .onGet("/api/v2/notificationprofiles/destinations/")
      .reply(200, destinationsArray as Destination[]);

    render(<NotificationProfileList />);
  });

  afterEach(() => {
    apiMock.reset();
    authTokenSpy.mockReset();
    authIsAuthenticatedSpy.mockReset();
    jest.clearAllMocks();
  });

  it("renders create-new-profile button", async () => {
    const createNewProfileButton = await screen.findByRole("button", { name: /create new profile/i });
    expect(createNewProfileButton).toBeInTheDocument();
  });

  it("shows no-timeslots-available dialog on button click", async () => {
    // Await rendering of the button
    const createNewProfileButton = await screen.findByRole("button", { name: /create new profile/i });
    expect(createNewProfileButton).toBeInTheDocument();

    userEvent.click(createNewProfileButton);

    // Check correct rendering of the dialog
    const noTimeslotsDialog = await screen.findByRole("dialog", { name: /no timeslots available/i });
    expect(noTimeslotsDialog).toBeInTheDocument();
    expect(noTimeslotsDialog).toHaveTextContent(/create a new timeslot if you want to register a new profile/i);
    expect(within(noTimeslotsDialog).getByRole("button", { name: /ok/i })).toBeInTheDocument();
    expect(within(noTimeslotsDialog).getByRole("button", { name: /close/i })).toBeInTheDocument();
  });
});
