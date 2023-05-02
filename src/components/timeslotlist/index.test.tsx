/**  * @jest-environment jsdom */

import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";

import api from "../../api";
import { TimeRecurrence, TimeRecurrenceDay, Timeslot } from "../../api/types.d";
import { TimeRecurrenceDayNameMap } from "../../api/consts";
import TimeslotList from "./index";
import auth from "../../auth";

const apiMock = new MockAdapter(api.api);
const authTokenSpy = jest.spyOn(auth, 'token');
const authIsAuthenticatedSpy = jest.spyOn(auth, 'isAuthenticated');

const DAY_VALUES: TimeRecurrenceDay[] = [1, 2, 3, 4, 5, 6, 7];

const EXISTING_RECURRENCE: TimeRecurrence = {
  // eslint-disable-next-line
  all_day: false,
  start: "10:00:00",
  end: "12:00:00",
  days: [1, 2, 3, 4, 5],
};

const NEW_RECURRENCE: TimeRecurrence = {
  // eslint-disable-next-line
  all_day: false,
  start: "12:00:00",
  end: "18:00:00",
  days: [1, 2, 3, 4],
};

const EXISTING_TIMESLOT: Timeslot = {
  pk: 1,
  name: "Timeslot Test",
  // eslint-disable-next-line @typescript-eslint/camelcase
  time_recurrences: [EXISTING_RECURRENCE],
};

const NEW_TIMESLOT: Timeslot = {
  pk: 2,
  name: "Timeslot Test 2",
  // eslint-disable-next-line @typescript-eslint/camelcase
  time_recurrences: [NEW_RECURRENCE],
};

// For avoiding authentication errors
beforeAll(() => {
  auth.login("token");
});
afterAll(() => {
  auth.logout();
});

beforeEach(() => {
  authTokenSpy.mockImplementation(() => "token");
  authIsAuthenticatedSpy.mockImplementation(() => true);
  apiMock
    .onGet("/api/v1/notificationprofiles/timeslots/")
    .reply(200, [EXISTING_TIMESLOT] as Timeslot[])
    .onPost("/api/v1/token-auth/")
    .reply(200, { token: "token" })
    .onGet("/api/v1/auth/user/")
    // eslint-disable-next-line @typescript-eslint/camelcase
    .reply(200, { username: "test", first_name: "test", last_name: "test", email: "test" })
  ;
  render(<TimeslotList />);
});

afterEach(() => {
  apiMock.reset();
  authTokenSpy.mockReset();
  authIsAuthenticatedSpy.mockReset();
  jest.clearAllMocks();
});

describe("TimeslotList: Initial render", () => {
  it("renders the timeslot page correctly", async () => {
    // Check that "Create new timeslot"-box is rendered correctly

    const title = screen.getByText(/create new timeslot/i);
    expect(title).toBeInTheDocument();

    const createTimeslot = screen.getByRole("form", { name: /new timeslot/i });
    expect(createTimeslot).toBeInTheDocument();

    const createTimeslotNameInput = within(createTimeslot).getByLabelText(/timeslot name/i);
    expect(createTimeslotNameInput).toBeInTheDocument();
    expect(createTimeslotNameInput).toHaveValue("");

    const createTimeslotCreateButton = within(createTimeslot).getByRole("button", { name: /create/i });
    expect(createTimeslotCreateButton).toBeInTheDocument();
    expect(createTimeslotCreateButton).toBeEnabled();

    const createTimeslotDeleteButton = within(createTimeslot).getByRole("button", { name: /delete/i });
    expect(createTimeslotDeleteButton).toBeInTheDocument();
    expect(createTimeslotDeleteButton).toBeDisabled();

    const createTimeslotAddRecurrenceButton = within(createTimeslot).getByRole("button", { name: /add recurrence/i });
    expect(createTimeslotAddRecurrenceButton).toBeInTheDocument();
    expect(createTimeslotAddRecurrenceButton).toBeEnabled();

    const createTimeslotRemoveRecurrenceButton = within(createTimeslot).getByRole("button", { name: /remove/i });
    expect(createTimeslotRemoveRecurrenceButton).toBeInTheDocument();
    expect(createTimeslotRemoveRecurrenceButton).toBeEnabled();

    const createTimeslotAllDayCheckbox = within(createTimeslot).getByRole("checkbox");
    expect(createTimeslotAllDayCheckbox).toBeInTheDocument();
    expect(createTimeslotAllDayCheckbox).not.toBeChecked();

    const createTimeslotStartTimePicker = within(createTimeslot).getByRole("textbox", { name: /start time picker/i });
    expect(createTimeslotStartTimePicker).toBeInTheDocument();
    expect(createTimeslotStartTimePicker).toHaveValue("08:00");

    const createTimeslotEndTimePicker = within(createTimeslot).getByRole("textbox", { name: /end time picker/i });
    expect(createTimeslotEndTimePicker).toBeInTheDocument();
    expect(createTimeslotEndTimePicker).toHaveValue("16:00");

    const createTimeslotDaySelector = within(createTimeslot).getByRole("button", { name: /days/i });
    expect(createTimeslotDaySelector).toBeInTheDocument();
    expect(createTimeslotDaySelector).toBeEnabled();

    expect(within(createTimeslotDaySelector).getByText(/monday/i)).toBeInTheDocument();
    expect(within(createTimeslotDaySelector).getByText(/tuesday/i)).toBeInTheDocument();
    expect(within(createTimeslotDaySelector).getByText(/wednesday/i)).toBeInTheDocument();
    expect(within(createTimeslotDaySelector).getByText(/thursday/i)).toBeInTheDocument();
    expect(within(createTimeslotDaySelector).getByText(/friday/i)).toBeInTheDocument();
    expect(within(createTimeslotDaySelector).queryByText(/saturday/i)).toBeNull();
    expect(within(createTimeslotDaySelector).queryByText(/sunday/i)).toBeNull();

    // Check that the existing timeslot is rendered correctly

    const existingTimeslot = await screen.findByRole("form", { name: EXISTING_TIMESLOT.name });
    expect(existingTimeslot).toBeInTheDocument();

    const existingTimeslotNameInput = within(existingTimeslot).getByLabelText(/timeslot name/i);
    expect(existingTimeslotNameInput).toBeInTheDocument();
    expect(existingTimeslotNameInput).toHaveValue(EXISTING_TIMESLOT.name);

    const existingTimeslotSaveButton = within(existingTimeslot).getByRole("button", { name: /save/i });
    expect(existingTimeslotSaveButton).toBeInTheDocument();
    expect(existingTimeslotSaveButton).toBeDisabled();

    const existingTimeslotDeleteButton = within(existingTimeslot).getByRole("button", { name: /delete/i });
    expect(existingTimeslotDeleteButton).toBeInTheDocument();
    expect(existingTimeslotDeleteButton).toBeEnabled();

    const existingTimeslotAddRecurrenceButton = within(existingTimeslot).getByRole("button", {
      name: /add recurrence/i,
    });
    expect(existingTimeslotAddRecurrenceButton).toBeInTheDocument();
    expect(existingTimeslotAddRecurrenceButton).toBeEnabled();

    const existingTimeslotRemoveRecurrenceButton = within(existingTimeslot).getByRole("button", { name: /remove/i });
    expect(existingTimeslotRemoveRecurrenceButton).toBeInTheDocument();
    expect(existingTimeslotRemoveRecurrenceButton).toBeEnabled();

    const existingTimeslotAllDayCheckbox = within(existingTimeslot).getByRole("checkbox");
    expect(existingTimeslotAllDayCheckbox).toBeInTheDocument();
    EXISTING_RECURRENCE.all_day
      ? expect(existingTimeslot).toBeChecked()
      : expect(existingTimeslotAllDayCheckbox).not.toBeChecked();

    const existingTimeslotStartTimePicker = within(existingTimeslot).getByRole("textbox", {
      name: /start time picker/i,
    });
    expect(existingTimeslotStartTimePicker).toBeInTheDocument();
    expect(existingTimeslotStartTimePicker).toHaveValue(EXISTING_RECURRENCE.start.slice(0, 5));

    const existingTimeslotEndTimePicker = within(existingTimeslot).getByRole("textbox", {
      name: /end time picker/i,
    });
    expect(existingTimeslotEndTimePicker).toBeInTheDocument();
    expect(existingTimeslotEndTimePicker).toHaveValue(EXISTING_RECURRENCE.end.slice(0, 5));

    const existingTimeslotDaySelector = within(existingTimeslot).getByRole("button", { name: /days/i });
    expect(existingTimeslotDaySelector).toBeInTheDocument();
    expect(existingTimeslotDaySelector).toBeEnabled();

    // Check that only the correct days are displayed in the day selector
    DAY_VALUES.forEach((day: TimeRecurrenceDay) => {
      if (EXISTING_RECURRENCE.days.includes(day)) {
        expect(
          within(existingTimeslotDaySelector).getByText(new RegExp(TimeRecurrenceDayNameMap[day], "i")),
        ).toBeInTheDocument();
      } else {
        expect(
          within(existingTimeslotDaySelector).queryByText(new RegExp(TimeRecurrenceDayNameMap[day], "i")),
        ).toBeNull();
      }
    });
  });
});

describe("TimeslotList: Create new timeslot", () => {
  it("creates new timeslot successfully", async () => {
    // Mock api post request with expected request body
    apiMock
      .onPost(
        "/api/v1/notificationprofiles/timeslots/",
        expect.objectContaining({
          name: NEW_TIMESLOT.name,
          // eslint-disable-next-line @typescript-eslint/camelcase
          time_recurrences: expect.arrayContaining([
            expect.objectContaining({
              // eslint-disable-next-line @typescript-eslint/camelcase
              all_day: NEW_RECURRENCE.all_day,
              start: NEW_RECURRENCE.start,
              end: NEW_RECURRENCE.end,
              days: NEW_RECURRENCE.days,
            }),
          ]),
        }),
      )
      .reply(201, NEW_TIMESLOT);

    // Simulate user actions to create new timeslot

    const createTimeslot = screen.getByRole("form", { name: /new timeslot/i });

    const nameInput = within(createTimeslot).getByLabelText(/timeslot name/i);
    userEvent.type(nameInput, NEW_TIMESLOT.name);

    const startTimePicker = within(createTimeslot).getByRole("textbox", { name: /start time picker/i });
    userEvent.type(startTimePicker, `{selectall}{backspace}${NEW_RECURRENCE.start.slice(0, 5)}`);

    const endTimePicker = within(createTimeslot).getByRole("textbox", { name: /end time picker/i });
    userEvent.type(endTimePicker, `{selectall}{backspace}${NEW_RECURRENCE.end.slice(0, 5)}`);

    const daySelector = within(createTimeslot).getByRole("button", { name: /days/i });
    userEvent.click(daySelector);

    const fridayOption = screen.getByRole("option", { name: /friday/i });
    userEvent.click(fridayOption);

    const createButton = within(createTimeslot).getByRole("button", { name: /create/i, hidden: true });
    userEvent.click(createButton);

    // Expect success message to be shown and new timeslot to be rendered

    const successMessage = await screen.findByText(/created new timeslot/i);
    expect(successMessage).toBeInTheDocument();

    const newTimeslot = await screen.findByRole("form", { name: NEW_TIMESLOT.name });
    expect(newTimeslot).toBeInTheDocument();
  });

  it("fails to create new timeslot when name already exists", async () => {
    // Mock api post request with expected request body
    apiMock
      .onPost("/api/v1/notificationprofiles/timeslots/", expect.objectContaining({ name: EXISTING_TIMESLOT.name }))
      // eslint-disable-next-line @typescript-eslint/camelcase
      .reply(400);

    // Simulate user actions to create timeslot with invalid name

    const createTimeslot = screen.getByRole("form", { name: /new timeslot/i });

    const nameInput = within(createTimeslot).getByLabelText(/timeslot name/i);
    userEvent.type(nameInput, EXISTING_TIMESLOT.name);

    const createButton = within(createTimeslot).getByRole("button", { name: /create/i, hidden: true });
    userEvent.click(createButton);

    // Expect error message to be shown and no new timeslots to be rendered

    const errorMessage = await screen.findByText(/failed to post notificationprofile timeslot/i);
    expect(errorMessage).toBeInTheDocument();

    const timeslots = await screen.findAllByRole("form");
    expect(timeslots).toHaveLength(2);
  });

  it("fails to create new timeslot if name is not provided", async () => {
    // Mock api post request with expected request body
    apiMock
      .onPost("/api/v1/notificationprofiles/timeslots/", expect.objectContaining({ name: EXISTING_TIMESLOT.name }))
      // eslint-disable-next-line @typescript-eslint/camelcase
      .reply(400);

    // Simulate user actions to create timeslot with invalid name

    const createTimeslot = screen.getByRole("form", { name: /new timeslot/i });

    const createButton = within(createTimeslot).getByRole("button", { name: /create/i, hidden: true });
    userEvent.click(createButton);

    // Expect error helper text to appear
    const errorHelperText = await screen.findByText(/required/i);
    expect(errorHelperText).toBeInTheDocument();

    // Expect create button to become disabled
    expect(createButton).not.toBeEnabled();

    const timeslots = await screen.findAllByRole("form");
    expect(timeslots).toHaveLength(2);
  });
});

describe("TimeslotList: Update existing timeslot", () => {
  it("updates existing timeslot successfully", async () => {
    // Mock api put request with expected request body
    apiMock
      .onPut(
        `/api/v1/notificationprofiles/timeslots/${EXISTING_TIMESLOT.pk}/`,
        expect.objectContaining({
          name: NEW_TIMESLOT.name,
          // eslint-disable-next-line @typescript-eslint/camelcase
          time_recurrences: expect.arrayContaining([
            expect.objectContaining({
              // eslint-disable-next-line @typescript-eslint/camelcase
              all_day: NEW_RECURRENCE.all_day,
              start: NEW_RECURRENCE.start,
              end: NEW_RECURRENCE.end,
              days: NEW_RECURRENCE.days,
            }),
          ]),
        }),
      )
      // eslint-disable-next-line @typescript-eslint/camelcase
      .reply(200, NEW_TIMESLOT);

    // Simulate user actions to update existing timeslot

    const existingTimeslot = await screen.findByRole("form", { name: EXISTING_TIMESLOT.name });

    const nameInput = within(existingTimeslot).getByLabelText(/timeslot name/i);
    userEvent.type(nameInput, `{selectall}{backspace}${NEW_TIMESLOT.name}`);

    const startTimePicker = within(existingTimeslot).getByRole("textbox", { name: /start time picker/i });
    userEvent.type(startTimePicker, `{selectall}{backspace}${NEW_RECURRENCE.start.slice(0, 5)}`);

    const endTimePicker = within(existingTimeslot).getByRole("textbox", { name: /end time picker/i });
    userEvent.type(endTimePicker, `{selectall}{backspace}${NEW_RECURRENCE.end.slice(0, 5)}`);

    const daySelector = within(existingTimeslot).getByRole("button", { name: /days/i });
    userEvent.click(daySelector);

    const fridayOption = screen.getByRole("option", { name: /friday/i });
    userEvent.click(fridayOption);

    const saveButton = within(existingTimeslot).getByRole("button", { name: /save/i, hidden: true });
    userEvent.click(saveButton);

    // Expect success message to be shown and updated timeslot to be rendered

    const successMessage = await screen.findByText(/updated timeslot/i);
    expect(successMessage).toBeInTheDocument();

    const newTimeslot2 = await screen.findByRole("form", { name: /timeslot test 2/i });
    expect(newTimeslot2).toBeInTheDocument();
  }, 10000);

  it("fails to update existing timeslot when end time is before start time", async () => {
    const newEndTime = "08:00:00";

    // Mock api put request with expected request body
    apiMock
      .onPut(
        `/api/v1/notificationprofiles/timeslots/${EXISTING_TIMESLOT.pk}/`,
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/camelcase
          time_recurrences: expect.arrayContaining([
            expect.objectContaining({
              start: EXISTING_RECURRENCE.start,
              end: newEndTime,
            }),
          ]),
        }),
      )
      // eslint-disable-next-line @typescript-eslint/camelcase
      .reply(400);

    // Simulate user actions to update existing timeslot with invalid end time

    const existingTimeslot = await screen.findByRole("form", { name: EXISTING_TIMESLOT.name });

    const endTimePicker = within(existingTimeslot).getByRole("textbox", { name: /end time picker/i });
    userEvent.type(endTimePicker, `{selectall}{backspace}${newEndTime.slice(0, 5)}`);

    const saveButton = within(existingTimeslot).getByRole("button", { name: /save/i });
    expect(saveButton).not.toBeEnabled();

    // Expect a helper text with correct value to appear
    expect(within(existingTimeslot).getByText(/must be after start time/i))
      .toBeInTheDocument();
  });

  it("fails to update existing timeslot when start time is after end time", async () => {
    const newStartTime = "14:00:00";

    // Mock api put request with expected request body
    apiMock
        .onPut(
            `/api/v1/notificationprofiles/timeslots/${EXISTING_TIMESLOT.pk}/`,
            expect.objectContaining({
              // eslint-disable-next-line @typescript-eslint/camelcase
              time_recurrences: expect.arrayContaining([
                expect.objectContaining({
                  start: newStartTime,
                  end: EXISTING_RECURRENCE.end,
                }),
              ]),
            }),
        )
        // eslint-disable-next-line @typescript-eslint/camelcase
        .reply(400);

    // Simulate user actions to update existing timeslot with invalid start time

    const existingTimeslot = await screen.findByRole("form", { name: EXISTING_TIMESLOT.name });

    const startTimePicker = within(existingTimeslot).getByRole("textbox", { name: /start time picker/i });
    userEvent.type(startTimePicker, `{selectall}{backspace}${newStartTime.slice(0, 5)}`);

    const saveButton = within(existingTimeslot).getByRole("button", { name: /save/i });
    expect(saveButton).not.toBeEnabled();

    // Expect a helper text with correct value to appear
    expect(startTimePicker).toHaveDisplayValue("14:00")
    expect(within(existingTimeslot).getByText(/must be before end time/i))
      .toBeInTheDocument();
  });

  it("fails to update existing timeslot when name is not provided", async () => {
    const newEndTime = "08:00:00";

    // Mock api put request with expected request body
    apiMock
      .onPut(
        `/api/v1/notificationprofiles/timeslots/${EXISTING_TIMESLOT.pk}/`,
        expect.objectContaining({
          name: "",
          // eslint-disable-next-line @typescript-eslint/camelcase
          time_recurrences: expect.arrayContaining([
            expect.objectContaining({
              end: NEW_RECURRENCE.end,
            }),
          ]),
        }),
      )
      // eslint-disable-next-line @typescript-eslint/camelcase
      .reply(400);

    // Simulate user actions to update existing timeslot with invalid end time

    const existingTimeslot = await screen.findByRole("form", { name: EXISTING_TIMESLOT.name });

    const endTimePicker = within(existingTimeslot).getByRole("textbox", { name: /end time picker/i });
    userEvent.type(endTimePicker, `{selectall}{backspace}${NEW_RECURRENCE.end.slice(0, 5)}`);

    const nameInput = within(existingTimeslot).getByRole("textbox", { name: /timeslot name/i });
    userEvent.clear(nameInput);

    const saveButton = within(existingTimeslot).getByRole("button", { name: /save/i });

    // Expect save button to become disabled
    expect(saveButton).not.toBeEnabled();
  });
});

describe("TimeslotList: Delete existing timeslot", () => {
  it("deletes existing timeslot successfully", async () => {
    // Mock api delete request
    apiMock
      .onDelete(`/api/v1/notificationprofiles/timeslots/${EXISTING_TIMESLOT.pk}/`)
      // eslint-disable-next-line @typescript-eslint/camelcase
      .reply(204);

    // Simulate user actions to delete existing timeslot

    const existingTimeslot = await screen.findByRole("form", { name: EXISTING_TIMESLOT.name });
    const deleteButton = within(existingTimeslot).getByRole("button", { name: /delete/i });
    userEvent.click(deleteButton);

    // Expect error message to be shown and timeslot to be removed

    const successMessage = await screen.findByText(/deleted timeslot/i);
    expect(successMessage).toBeInTheDocument();

    const deletedTimeslot = screen.queryByRole("form", { name: EXISTING_TIMESLOT.name });
    expect(deletedTimeslot).toBeNull();
  });
});

describe("TimeslotList: Add/remove recurrences", () => {
  it("adds new recurrence to existing timeslot successfully", async () => {
    // Mock api put request with expected request body
    apiMock
      .onPut(`/api/v1/notificationprofiles/timeslots/${EXISTING_TIMESLOT.pk}/`, {
        asymmetricMatch: (actual: Timeslot) => {
          return actual.time_recurrences.length === 2;
        },
      })
      // eslint-disable-next-line @typescript-eslint/camelcase
      .reply(200, { ...EXISTING_TIMESLOT, time_recurrences: [EXISTING_RECURRENCE, NEW_RECURRENCE] });

    // Simulate user actions to add new recurrence from existing timeslot

    const existingTimeslot = await screen.findByRole("form", { name: EXISTING_TIMESLOT.name });

    const addRecurrenceButton = within(existingTimeslot).getByRole("button", { name: /add recurrence/i });
    userEvent.click(addRecurrenceButton);

    const saveButton = within(existingTimeslot).getByRole("button", { name: /save/i });
    userEvent.click(saveButton);

    // Expect success message to be shown and new recurrence to be rendered

    const successMessage = await screen.findByText(/updated timeslot/i);
    expect(successMessage).toBeInTheDocument();

    const updatedTimeslot = await screen.findByRole("form", { name: EXISTING_TIMESLOT.name });
    const removeButtons = within(updatedTimeslot).getAllByRole("button", { name: /remove/i });
    expect(removeButtons).toHaveLength(2);
    expect(removeButtons[1]).toBeInTheDocument();
    expect(removeButtons[0]).toBeInTheDocument();
  }, 10000);

  it("removes an existing recurrence from an existing timeslot successfully", async () => {
    // Mock api put request with expected request body
    apiMock
      .onPut(
        `/api/v1/notificationprofiles/timeslots/${EXISTING_TIMESLOT.pk}/`,
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/camelcase
          time_recurrences: [],
        }),
      )
      // eslint-disable-next-line @typescript-eslint/camelcase
      .reply(200, { ...EXISTING_TIMESLOT, time_recurrences: [] });

    // Simulate user actions to remove recurrence from existing timeslot

    const existingTimeslot = await screen.findByRole("form", { name: EXISTING_TIMESLOT.name });

    const removeRecurrenceButton = within(existingTimeslot).getByRole("button", { name: /remove/i });
    userEvent.click(removeRecurrenceButton);

    const saveButton = within(existingTimeslot).getByRole("button", { name: /save/i });
    userEvent.click(saveButton);

    // Expect success message to be shown and recurrence to be removed

    const successMessage = await screen.findByText(/updated timeslot/i);
    expect(successMessage).toBeInTheDocument();

    const updatedTimeslot = await screen.findByRole("form", { name: EXISTING_TIMESLOT.name });
    const removeRecurrenceButton2 = within(updatedTimeslot).queryByRole("button", { name: /remove/i });
    expect(removeRecurrenceButton2).toBeNull();
  });
});
