/**  * @jest-environment jsdom-sixteen  */

import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Destination,
  Filter,
  Media,
  NotificationProfileKeyed,
  Timeslot
} from "../../api/types";
import NotificationProfileCard from "./NotificationProfileCard";

// MOCK DATA INPUT TO COMPONENT
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
      phone_number: "+4747474747"
    }
  },
  {
    pk: 2,
    label: "test_email",
    media: media[0],
    suggested_label: "Email: test@test.test",
    settings: {
      email_address: "test@test.test",
      synced: false
    }
  },
  {
    pk: 3,
    label: "test_email_synced",
    media: media[0],
    suggested_label: "Email: synced@test.test",
    settings: {
      email_address: "synced@test.test",
      synced: true
    }
  },
]

const existingProfile1: NotificationProfileKeyed = {
  pk: 1,
  timeslot: 1,
  filters: [1, 2],
  active: true,
  // eslint-disable-next-line @typescript-eslint/camelcase
  destinations: [destinationsArray[0]],
};

const existingProfile2: NotificationProfileKeyed = {
  pk: 1,
  timeslot: 1,
  filters: [1],
  active: true,
  // eslint-disable-next-line @typescript-eslint/camelcase
  destinations: [destinationsArray[1], destinationsArray[2]],
};

const newProfile: NotificationProfileKeyed = {
  timeslot: 1,
  filters: [1, 2],
  active: true,
  // eslint-disable-next-line @typescript-eslint/camelcase
  destinations: [destinationsArray[3]],
};

const destinationsMap = new Map<Media["slug"], Destination[]>([
  ["sms", [destinationsArray[0]]],
  ["email", [destinationsArray[1], destinationsArray[2]]]
])

// MOCK FUNCTIONS
const onSaveMock = jest.fn();
const onDeleteMock = jest.fn();
const onAddPhoneNumberMock = jest.fn();

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
        mediaOptions={media}
        destinations={destinationsMap}
        exists={true}
        onSave={onSaveMock}
        onDelete={onDeleteMock}
        onAddPhoneNumber={onAddPhoneNumberMock}
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

  it("renders the destinations selector correctly", () => {
    const destinationsSelector = screen.getByRole("button", { name: destinationsArray[0].suggested_label });
    expect(destinationsSelector).toBeInTheDocument();

    userEvent.click(destinationsSelector);

    // Expect length to be: all saved destinations
    expect(within(screen.getByRole("listbox")).getAllByRole("checkbox")).toHaveLength(destinationsArray.length);

    const destinationOption1 = screen.getByRole("option", {name: destinationsArray[0].settings["phone_number"] as string});
    const destinationOption2 = screen.getByRole("option", {name: destinationsArray[1].settings["email_address"] as string});
    const destinationOption3 = screen.getByRole("option", {name: destinationsArray[2].settings["email_address"] as string});

    expect(destinationOption1).toBeInTheDocument();
    expect(destinationOption2).toBeInTheDocument();
    expect(destinationOption3).toBeInTheDocument();
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
        mediaOptions={media}
        destinations={destinationsMap}
        exists={false}
        onSave={onSaveMock}
        onDelete={onDeleteMock}
        onAddPhoneNumber={onAddPhoneNumberMock}
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

  it("renders the destinations selector correctly", () => {
    const phoneNumberSelector = screen.getByTestId("destinations-selector");
    expect(phoneNumberSelector).toBeInTheDocument();

    // User opens dropdown with options
    userEvent.click(within(phoneNumberSelector).getByRole("button"));

    // Expect length to be: all saved destinations
    expect(within(screen.getByRole("listbox")).getAllByRole("checkbox")).toHaveLength(destinationsArray.length);

    const destinationOption1 = screen.getByRole("option", {name: destinationsArray[0].settings["phone_number"] as string});
    const destinationOption2 = screen.getByRole("option", {name: destinationsArray[1].settings["email_address"] as string});
    const destinationOption3 = screen.getByRole("option", {name: destinationsArray[2].settings["email_address"] as string});

    expect(destinationOption1).toBeInTheDocument();
    expect(destinationOption2).toBeInTheDocument();
    expect(destinationOption3).toBeInTheDocument();
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
        mediaOptions={media}
        destinations={destinationsMap}
        exists={true}
        onSave={onSaveMock}
        onDelete={onDeleteMock}
        onAddPhoneNumber={onAddPhoneNumberMock}
      />,
    );
  });

  it("calls onSave() when save button is clicked", () => {
    const expectedProfile = {
      ...existingProfile2,
      filters: [1, 2],
      // eslint-disable-next-line @typescript-eslint/camelcase
      destinations: [destinationsArray[0], destinationsArray[1], destinationsArray[2]],
      active: false,
    };

    const saveButton = screen.getByRole("button", { name: /save/i });
    const filterSelector = screen.getByRole("combobox", { name: /filters/i });
    const destinationsSelector = screen.getByRole("button", { name: `${destinationsArray[1].suggested_label}, ${destinationsArray[2].suggested_label}` });
    const filterDropdownButton = within(filterSelector).getByRole("button", { name: /open/i });
    const activeCheckbox = screen.getByRole("checkbox", { name: /active/i });

    // Add filter
    userEvent.click(filterDropdownButton);
    const filterOption2 = screen.getByRole("option", { name: filters[1].name });
    userEvent.click(filterOption2);

    // Change destination
    userEvent.click(destinationsSelector);
    const destinationOption4 = screen.getByRole("option", {name: destinationsArray[0].settings["phone_number"] as string});
    userEvent.click(destinationOption4);

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

    expect(onSaveMock).toHaveBeenCalledTimes(1);
    expect(onSaveMock).toHaveBeenCalledWith(expectedProfile);
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
