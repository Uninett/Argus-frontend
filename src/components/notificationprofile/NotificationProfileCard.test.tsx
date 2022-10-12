/**  * @jest-environment jsdom-sixteen  */

import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Filter, MediaAlternative, NotificationProfileKeyed, PhoneNumber, Timeslot } from "../../api/types";
import NotificationProfileCard from "./NotificationProfileCard";

// MOCK DATA INPUT TO COMPONENT
const existingProfile1: NotificationProfileKeyed = {
  pk: 1,
  timeslot: 1,
  filters: [1, 2],
  media: ["EM", "SM"],
  active: true,
  // eslint-disable-next-line @typescript-eslint/camelcase
  phone_number: 1,
};

const existingProfile2: NotificationProfileKeyed = {
  pk: 1,
  timeslot: 1,
  filters: [1],
  media: ["EM"],
  active: true,
  // eslint-disable-next-line @typescript-eslint/camelcase
  phone_number: 1,
};

const newProfile: NotificationProfileKeyed = {
  timeslot: 1,
  filters: [1, 2],
  media: ["EM", "SM"],
  active: true,
  // eslint-disable-next-line @typescript-eslint/camelcase
  phone_number: 0,
};

const timeslots: Timeslot[] = [
  {
    pk: 1,
    name: "Timeslot1",
    // eslint-disable-next-line @typescript-eslint/camelcase
    time_recurrences: [],
  },
  {
    pk: 2,
    name: "Timeslot2",
    // eslint-disable-next-line @typescript-eslint/camelcase
    time_recurrences: [],
  },
];

const filters: Filter[] = [
  {
    pk: 1,
    name: "Filter1",
    sourceSystemIds: [],
    tags: [],
    filter: {},
  },
  {
    pk: 2,
    name: "Filter2",
    sourceSystemIds: [],
    tags: [],
    filter: {},
  },
];

const mediaOptions: { label: string; value: MediaAlternative }[] = [
  { label: "Email", value: "EM" },
  { label: "SMS", value: "SM" },
];

const phoneNumbers: PhoneNumber[] = [
  {
    pk: 1,
    user: 1,
    // eslint-disable-next-line @typescript-eslint/camelcase
    phone_number: "+4712345678",
  },
  {
    pk: 2,
    user: 1,
    // eslint-disable-next-line @typescript-eslint/camelcase
    phone_number: "+4787654321",
  },
];

// MOCK FUNCTIONS
const onSaveMock = jest.fn();
const onDeleteMock = jest.fn();
const onAddPhoneNumberMock = jest.fn();
const onSaveTimeslotChangedMock = jest.fn();

afterEach(() => {
  jest.clearAllMocks();
});

describe("Rendering existing profile", () => {
  beforeEach(() => {
    render(
      <NotificationProfileCard
        profile={existingProfile1}
        timeslots={timeslots}
        filters={filters}
        mediaOptions={mediaOptions}
        phoneNumbers={phoneNumbers}
        exists={true}
        onSave={onSaveMock}
        onDelete={onDeleteMock}
        onAddPhoneNumber={onAddPhoneNumberMock}
        onSaveTimeslotChanged={onSaveTimeslotChangedMock}
      />,
    );
  });

  it("renders the timeslot selector correctly", () => {
    const timeslotSelector = screen.getByRole("button", { name: timeslots[0].name });
    expect(timeslotSelector).toBeInTheDocument();

    userEvent.click(timeslotSelector);

    const timeslotOption1 = screen.getByRole("option", { name: timeslots[0].name });
    const timeslotOption2 = screen.getByRole("option", { name: timeslots[1].name });

    expect(timeslotOption1).toBeInTheDocument();
    expect(timeslotOption2).toBeInTheDocument();
  });

  it("renders the filter selector correctly", () => {
    const filterSelector = screen.getByRole("combobox", { name: /filters/i });
    const selectedFilter1 = screen.getByText(filters[0].name);
    const selectedFilter2 = screen.getByText(filters[1].name);

    expect(filterSelector).toBeInTheDocument();
    expect(selectedFilter1).toBeInTheDocument();
    expect(selectedFilter2).toBeInTheDocument();
  });

  it("renders the media selector correctly", () => {
    const mediaSelector = screen.getByRole("combobox", { name: /media/i });
    const selectedMedia1 = screen.getByText(mediaOptions[0].label);
    const selectedMedia2 = screen.getByText(mediaOptions[1].label);

    expect(mediaSelector).toBeInTheDocument();
    expect(selectedMedia1).toBeInTheDocument();
    expect(selectedMedia2).toBeInTheDocument();
  });

  it("renders the phone number selector correctly", () => {
    const phoneNumberSelector = screen.getByRole("button", { name: phoneNumbers[0].phone_number });
    expect(phoneNumberSelector).toBeInTheDocument();

    userEvent.click(phoneNumberSelector);

    // Expect length to be: all saved phone numbers plus "None"
    expect(screen.getAllByRole("option")).toHaveLength(phoneNumbers.length + 1);

    const phoneNumberOptionNone = screen.getByRole("option", {name: /none/i});
    const phoneNumberOption1 = screen.getByRole("option", {name: phoneNumbers[0].phone_number});
    const phoneNumberOption2 = screen.getByRole("option", {name: phoneNumbers[1].phone_number});

    expect(phoneNumberOptionNone).toBeInTheDocument();
    expect(phoneNumberOption1).toBeInTheDocument();
    expect(phoneNumberOption2).toBeInTheDocument();
  });

  it("renders the active checkbox correctly", () => {
    const activeCheckbox = screen.getByRole("checkbox", { name: /active/i });
    expect(activeCheckbox).toBeInTheDocument();
    expect(activeCheckbox).toBeChecked();
  });

  it("renders the buttons correctly", () => {
    const saveButton = screen.getByRole("button", { name: /save/i });
    const deleteButton = screen.getByRole("button", { name: /delete/i });
    const addPhoneNumberButton = screen.getByRole("button", { name: /add phone number/i });

    expect(saveButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
    expect(addPhoneNumberButton).toBeInTheDocument();

    expect(saveButton).toBeDisabled();
    expect(deleteButton).toBeEnabled();
    expect(addPhoneNumberButton).toBeEnabled();
  });
});

describe("Rendering new profile", () => {
  beforeEach(() => {
    render(
      <NotificationProfileCard
        profile={newProfile}
        timeslots={timeslots}
        filters={filters}
        mediaOptions={mediaOptions}
        phoneNumbers={phoneNumbers}
        exists={false}
        onSave={onSaveMock}
        onDelete={onDeleteMock}
        onAddPhoneNumber={onAddPhoneNumberMock}
        onSaveTimeslotChanged={onSaveTimeslotChangedMock}
      />,
    );
  });

  it("renders the timeslot selector correctly", () => {
    const timeslotSelector = screen.getByRole("button", { name: timeslots[0].name });
    expect(timeslotSelector).toBeInTheDocument();

    userEvent.click(timeslotSelector);

    const timeslotOption1 = screen.getByRole("option", { name: timeslots[0].name });
    const timeslotOption2 = screen.getByRole("option", { name: timeslots[1].name });

    expect(timeslotOption1).toBeInTheDocument();
    expect(timeslotOption2).toBeInTheDocument();
  });

  it("renders the filter selector correctly", () => {
    const filterSelector = screen.getByRole("combobox", { name: /filters/i });
    const selectedFilter1 = screen.getByText(filters[0].name);
    const selectedFilter2 = screen.getByText(filters[1].name);

    expect(filterSelector).toBeInTheDocument();
    expect(selectedFilter1).toBeInTheDocument();
    expect(selectedFilter2).toBeInTheDocument();
  });

  it("renders the media selector correctly", () => {
    const mediaSelector = screen.getByRole("combobox", { name: /media/i });
    const selectedMedia1 = screen.getByText(mediaOptions[0].label);
    const selectedMedia2 = screen.getByText(mediaOptions[1].label);

    expect(mediaSelector).toBeInTheDocument();
    expect(selectedMedia1).toBeInTheDocument();
    expect(selectedMedia2).toBeInTheDocument();
  });

  it("renders the phone number selector correctly", () => {
    const phoneNumberSelector = screen.getByTestId("phone-number-selector");
    expect(phoneNumberSelector).toBeInTheDocument();
    // Default phone number value is "None" with a display value of ""
    expect(phoneNumberSelector).toHaveTextContent(/^/);


    // User opens dropdown with options
    userEvent.click(within(phoneNumberSelector).getByRole("button"));


    // Expect length to be: all saved phone numbers plus "None"
    expect(screen.getAllByRole("option")).toHaveLength(phoneNumbers.length + 1);

    const phoneNumberOptionNone = screen.getByRole("option", {name: /none/i});
    const phoneNumberOption1 = screen.getByRole("option", {name: phoneNumbers[0].phone_number});
    const phoneNumberOption2 = screen.getByRole("option", {name: phoneNumbers[1].phone_number});

    expect(phoneNumberOptionNone).toBeInTheDocument();
    expect(phoneNumberOption1).toBeInTheDocument();
    expect(phoneNumberOption2).toBeInTheDocument();
  });

  it("renders the active checkbox correctly", () => {
    const activeCheckbox = screen.getByRole("checkbox", { name: /active/i });
    expect(activeCheckbox).toBeInTheDocument();
    expect(activeCheckbox).toBeChecked();
  });

  it("renders the buttons correctly", () => {
    const createButton = screen.getByRole("button", { name: /create/i });
    const discardButton = screen.getByRole("button", { name: /discard/i });
    const addPhoneNumberButton = screen.getByRole("button", { name: /add phone number/i });

    expect(createButton).toBeInTheDocument();
    expect(discardButton).toBeInTheDocument();
    expect(addPhoneNumberButton).toBeInTheDocument();

    expect(createButton).toBeEnabled();
    expect(discardButton).toBeEnabled();
    expect(addPhoneNumberButton).toBeEnabled();
  });
});

describe("Functionality", () => {
  beforeEach(() => {
    render(
      <NotificationProfileCard
        profile={existingProfile2}
        timeslots={timeslots}
        filters={filters}
        mediaOptions={mediaOptions}
        phoneNumbers={phoneNumbers}
        exists={true}
        onSave={onSaveMock}
        onDelete={onDeleteMock}
        onAddPhoneNumber={onAddPhoneNumberMock}
        onSaveTimeslotChanged={onSaveTimeslotChangedMock}
      />,
    );
  });

  it("calls onSave() when save button is clicked", () => {
    const expectedProfile = {
      ...existingProfile2,
      filters: [1, 2],
      media: ["EM", "SM"],
      // eslint-disable-next-line @typescript-eslint/camelcase
      phone_number: 2,
      active: false,
    };

    const saveButton = screen.getByRole("button", { name: /save/i });
    const filterSelector = screen.getByRole("combobox", { name: /filters/i });
    const mediaSelector = screen.getByRole("combobox", { name: /media/i });
    const phoneNumberSelector = screen.getByRole("button", { name: phoneNumbers[0].phone_number });
    const filterDropdownButton = within(filterSelector).getByRole("button", { name: /open/i });
    const mediaDropdownButton = within(mediaSelector).getByRole("button", { name: /open/i });
    const activeCheckbox = screen.getByRole("checkbox", { name: /active/i });

    // Add filter
    userEvent.click(filterDropdownButton);
    const filterOption2 = screen.getByRole("option", { name: filters[1].name });
    userEvent.click(filterOption2);

    // Add media option
    userEvent.click(mediaDropdownButton);
    const mediaOption2 = screen.getByRole("option", { name: mediaOptions[1].label });
    userEvent.click(mediaOption2);

    // Change phone number
    userEvent.click(phoneNumberSelector);
    const phoneNumberOption2 = screen.getByRole("option", { name: phoneNumbers[1].phone_number });
    userEvent.click(phoneNumberOption2);

    // Uncheck active
    userEvent.click(activeCheckbox);

    // Save changes
    userEvent.click(saveButton);

    expect(onSaveMock).toHaveBeenCalledTimes(1);
    expect(onSaveMock).toHaveBeenCalledWith(expectedProfile);
  });

  // When the backend data model is updated so profile and timeslot don't share PK
  // the onSaveTimeslotChanged() should be removed (and also this test).
  it("calls onSaveTimeslotChanged() when save button is clicked and timeslot has changed", () => {
    const expectedProfile = { ...existingProfile2, timeslot: 2 };

    const saveButton = screen.getByRole("button", { name: /save/i });
    const timeslotSelector = screen.getByRole("button", { name: timeslots[0].name });

    // Change timeslot
    userEvent.click(timeslotSelector);
    const timeslotOption2 = screen.getByRole("option", { name: timeslots[1].name });
    userEvent.click(timeslotOption2);

    // Save changes
    userEvent.click(saveButton);

    expect(onSaveTimeslotChangedMock).toHaveBeenCalledTimes(1);
    expect(onSaveTimeslotChangedMock).toHaveBeenCalledWith(expectedProfile);
  });

  it("calls onDelete() when delete button is clicked", () => {
    const deleteButton = screen.getByRole("button", { name: /delete/i });
    userEvent.click(deleteButton);

    const deleteConfirmationButton = screen.getByRole("button", { name: /yes/i });
    userEvent.click(deleteConfirmationButton);

    expect(onDeleteMock).toHaveBeenCalledTimes(1);
    expect(onDeleteMock).toHaveBeenCalledWith(existingProfile2);
  });

  it("calls onAddPhoneNumber() when add phone number button is clicked", () => {
    const addPhoneNumberButton = screen.getByRole("button", { name: /add phone number/i });

    userEvent.click(addPhoneNumberButton);

    expect(onAddPhoneNumberMock).toHaveBeenCalledTimes(1);
  });

  it("displays error message when save button is clicked if no filters are selected", () => {
    const saveButton = screen.getByRole("button", { name: /save/i });
    const filterSelector = screen.getByRole("combobox", { name: /filters/i });
    const filterClearButton = within(filterSelector).getByRole("button", { name: /clear/i });

    // Remove all filters and save
    userEvent.click(filterClearButton);
    userEvent.click(saveButton);

    screen.findByText(/this field cannot be empty/i);
    expect(onSaveMock).toHaveBeenCalledTimes(0);
  });
});
