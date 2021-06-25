/**  * @jest-environment jsdom-sixteen  */

import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";

import api, { TimeRecurrence, Timeslot } from "../../api";
import TimeslotList from "./index";
import auth from "../../auth";

const apiMock = new MockAdapter(api.api);

const EXAMPLE_TIMESLOT_RECURRENCE_1: TimeRecurrence = {
  // eslint-disable-next-line
  all_day: false,
  start: "10:00:00",
  end: "12:00:00",
  days: [6, 7],
};

const EXAMPLE_TIMESLOT_RECURRENCE_2: TimeRecurrence = {
  // eslint-disable-next-line
  all_day: true,
  start: "12:00:00",
  end: "18:00:00",
  days: [5, 6, 7],
};

const recurrences: TimeRecurrence[] = [EXAMPLE_TIMESLOT_RECURRENCE_1];
const timeslot: Timeslot = {
  pk: 1,
  name: "Timeslot Test",
  // eslint-disable-next-line @typescript-eslint/camelcase
  time_recurrences: recurrences,
};

describe("TimeslotList tests", () => {
  beforeAll(() => {
    auth.login("token");
  });

  it("renders the TimeslotList correctly", async () => {
    apiMock.onGet("/api/v1/notificationprofiles/timeslots/").reply(200, [timeslot]);
    render(<TimeslotList />);

    const title = screen.getByText(/create new timeslot/i);
    expect(title).toBeInTheDocument();

    const newTimeslot = screen.getByRole("form", { name: /new timeslot/i });
    expect(newTimeslot).toBeInTheDocument();

    const newTimeslotNameInput = within(newTimeslot).getByLabelText(/timeslot name/i);
    expect(newTimeslotNameInput).toBeInTheDocument();
    expect(newTimeslotNameInput).toHaveValue("");

    const newTimeslotCreateButton = within(newTimeslot).getByRole("button", { name: /create/i });
    expect(newTimeslotCreateButton).toBeInTheDocument();
    expect(newTimeslotCreateButton).toBeEnabled();

    const newTimeslotDeleteButton = within(newTimeslot).getByRole("button", { name: /delete/i });
    expect(newTimeslotDeleteButton).toBeInTheDocument();
    expect(newTimeslotDeleteButton).toBeDisabled();

    const newTimeslotAddRecurrenceButton = within(newTimeslot).getByRole("button", { name: /add recurrence/i });
    expect(newTimeslotAddRecurrenceButton).toBeInTheDocument();
    expect(newTimeslotAddRecurrenceButton).toBeEnabled();

    const newTimeslotRemoveRecurrenceButton = within(newTimeslot).getByRole("button", { name: /remove/i });
    expect(newTimeslotRemoveRecurrenceButton).toBeInTheDocument();
    expect(newTimeslotRemoveRecurrenceButton).toBeEnabled();

    const newTimeslotAllDayCheckbox = within(newTimeslot).getByRole("checkbox");
    expect(newTimeslotAllDayCheckbox).toBeInTheDocument();
    expect(newTimeslotAllDayCheckbox).not.toBeChecked();

    const newTimeslotStartTimePicker = within(newTimeslot).getByRole("textbox", { name: /start time picker/i });
    expect(newTimeslotStartTimePicker).toBeInTheDocument();
    expect(newTimeslotStartTimePicker).toHaveValue("08:00");

    const newTimeslotEndTimePicker = within(newTimeslot).getByRole("textbox", { name: /end time picker/i });
    expect(newTimeslotEndTimePicker).toBeInTheDocument();
    expect(newTimeslotEndTimePicker).toHaveValue("16:00");

    const newTimeslotDaySelector = within(newTimeslot).getByRole("button", { name: /days/i });
    expect(newTimeslotDaySelector).toBeInTheDocument();
    expect(newTimeslotDaySelector).toBeEnabled();

    expect(within(newTimeslotDaySelector).getByText(/monday/i)).toBeInTheDocument();
    expect(within(newTimeslotDaySelector).getByText(/tuesday/i)).toBeInTheDocument();
    expect(within(newTimeslotDaySelector).getByText(/wednesday/i)).toBeInTheDocument();
    expect(within(newTimeslotDaySelector).getByText(/thursday/i)).toBeInTheDocument();
    expect(within(newTimeslotDaySelector).getByText(/friday/i)).toBeInTheDocument();
    expect(within(newTimeslotDaySelector).queryByText(/saturday/i)).toBeNull();
    expect(within(newTimeslotDaySelector).queryByText(/sunday/i)).toBeNull();

    const existingTimeslot = await screen.findByRole("form", { name: timeslot.name });
    expect(existingTimeslot).toBeInTheDocument();

    const existingTimeslotNameInput = within(existingTimeslot).getByLabelText(/timeslot name/i);
    expect(existingTimeslotNameInput).toBeInTheDocument();
    expect(existingTimeslotNameInput).toHaveValue(timeslot.name);

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
    expect(existingTimeslotAllDayCheckbox).not.toBeChecked();

    const existingTimeslotStartTimePicker = within(existingTimeslot).getByRole("textbox", {
      name: /start time picker/i,
    });
    expect(existingTimeslotStartTimePicker).toBeInTheDocument();
    expect(existingTimeslotStartTimePicker).toHaveValue("10:00");

    const existingTimeslotEndTimePicker = within(existingTimeslot).getByRole("textbox", {
      name: /end time picker/i,
    });
    expect(existingTimeslotEndTimePicker).toBeInTheDocument();
    expect(existingTimeslotEndTimePicker).toHaveValue("12:00");

    const existingTimeslotDaySelector = within(existingTimeslot).getByRole("button", { name: /days/i });
    expect(existingTimeslotDaySelector).toBeInTheDocument();
    expect(existingTimeslotDaySelector).toBeEnabled();

    expect(within(existingTimeslotDaySelector).queryByText(/monday/i)).toBeNull();
    expect(within(existingTimeslotDaySelector).queryByText(/tuesday/i)).toBeNull();
    expect(within(existingTimeslotDaySelector).queryByText(/wednesday/i)).toBeNull();
    expect(within(existingTimeslotDaySelector).queryByText(/thursday/i)).toBeNull();
    expect(within(existingTimeslotDaySelector).queryByText(/friday/i)).toBeNull();
    expect(within(existingTimeslotDaySelector).getByText(/saturday/i)).toBeInTheDocument();
    expect(within(existingTimeslotDaySelector).queryByText(/sunday/i)).toBeInTheDocument();
  });

  it("creates a new timeslot successfully", async () => {
    apiMock
      .onGet("/api/v1/notificationprofiles/timeslots/")
      .reply(200, [timeslot])
      .onPost("/api/v1/notificationprofiles/timeslots/")
      // eslint-disable-next-line @typescript-eslint/camelcase
      .reply(200, { pk: 2, name: "Timeslot Test 2", time_recurrences: recurrences });

    render(<TimeslotList />);

    const newTimeslot = screen.getByRole("form", { name: /new timeslot/i });
    userEvent.type(within(newTimeslot).getByLabelText(/timeslot name/i), "Timeslot Test 2");
    userEvent.type(
      within(newTimeslot).getByRole("textbox", { name: /start time picker/i }),
      "{selectall}{backspace}12:30",
    );
    userEvent.type(
      within(newTimeslot).getByRole("textbox", { name: /end time picker/i }),
      "{selectall}{backspace}14:30",
    );

    userEvent.click(within(newTimeslot).getByRole("button", { name: /days/i }));
    userEvent.click(screen.getByRole("option", { name: /friday/i }));
    userEvent.click(within(newTimeslot).getByRole("button", { name: /create/i, hidden: true }));

    const newTimeslot2 = await screen.findByRole("form", { name: /timeslot test 2/i });
    console.log(apiMock.history.post[0].data);
    expect(newTimeslot2).toBeInTheDocument();
  });

  /*it("fails to create new timeslot when timeslot with same name already exists", () => {});

  it("adds a new recurrence to a timeslot successfully", () => {});

  it("deletes a timeslot successfully", () => {});*/
});
