/**  * @jest-environment jsdom-sixteen  */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";

import TimeslotComponent, { TimeslotRecurrenceComponent, DaySelector } from "./index";
import api, { TimeRecurrence, TimeRecurrenceDay } from "../../api";
import { Day } from "@material-ui/pickers";

const EXAMPLE_TIMESLOT_RECURRENCE_1: TimeRecurrence = {
  // eslint-disable-next-line
  all_day: false,
  start: "10:00:00",
  end: "16:00:00",
  days: [1, 2, 3, 4, 5],
};

const EXAMPLE_TIMESLOT_RECURRENCE_2: TimeRecurrence = {
  // eslint-disable-next-line
  all_day: true,
  start: "12:00:00",
  end: "18:00:00",
  days: [5, 6, 7],
};

describe("TimeslotRecurrenceComponent tests", () => {
  const onChange = jest.fn();
  const onRemove = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component correctly when all_day is false", () => {
    render(
      <TimeslotRecurrenceComponent
        id={1}
        recurrence={EXAMPLE_TIMESLOT_RECURRENCE_1}
        onChange={onChange}
        onRemove={onRemove}
      />,
    );

    const removeButton = screen.getByRole("button", { name: /remove/i });
    expect(removeButton).toBeInTheDocument();
    expect(removeButton).toBeEnabled();

    const allDayCheckbox = screen.getByRole("checkbox");
    expect(allDayCheckbox).toBeInTheDocument();
    expect(allDayCheckbox).toBeEnabled();
    expect(allDayCheckbox).not.toBeChecked();

    const startTimePicker = screen.getByLabelText(/start time picker/i);
    expect(startTimePicker).toBeInTheDocument();
    expect(startTimePicker).toBeEnabled();
    expect(startTimePicker).toHaveValue("10:00");

    const endTimePicker = screen.getByLabelText(/end time picker/i);
    expect(endTimePicker).toBeInTheDocument();
    expect(endTimePicker).toBeEnabled();
    expect(endTimePicker).toHaveValue("16:00");

    const daySelector = screen.getByRole("button", { name: /days/i });
    expect(daySelector).toBeInTheDocument();
    // Have to check for attribute since daySelector uses "aria-disabled" instead of "disabled"
    expect(daySelector).not.toHaveAttribute("aria-disabled", "true");

    expect(screen.getByText(/monday/i)).toBeInTheDocument();
    expect(screen.getByText(/tuesday/i)).toBeInTheDocument();
    expect(screen.getByText(/wednesday/i)).toBeInTheDocument();
    expect(screen.getByText(/thursday/i)).toBeInTheDocument();
    expect(screen.getByText(/friday/i)).toBeInTheDocument();
    expect(screen.queryByText(/saturday/i)).toBeNull();
    expect(screen.queryByText(/sunday/i)).toBeNull();
  });

  it("renders the component correctly when all_day is true", () => {
    render(
      <TimeslotRecurrenceComponent
        id={1}
        recurrence={EXAMPLE_TIMESLOT_RECURRENCE_2}
        onChange={onChange}
        onRemove={onRemove}
      />,
    );

    const removeButton = screen.getByRole("button", { name: /remove/i });
    expect(removeButton).toBeInTheDocument();
    expect(removeButton).toBeEnabled();

    const allDayCheckbox = screen.getByRole("checkbox");
    expect(allDayCheckbox).toBeInTheDocument();
    expect(allDayCheckbox).toBeEnabled();
    expect(allDayCheckbox).toBeChecked();

    const startTimePicker = screen.getByLabelText(/start time picker/i);
    expect(startTimePicker).toBeInTheDocument();
    expect(startTimePicker).toBeDisabled();
    expect(startTimePicker).toHaveValue("");

    const endTimePicker = screen.getByLabelText(/end time picker/i);
    expect(endTimePicker).toBeInTheDocument();
    expect(endTimePicker).toBeDisabled();
    expect(endTimePicker).toHaveValue("");

    const daySelector = screen.getByRole("button", { name: /days/i });
    expect(daySelector).toBeInTheDocument();
    // Have to check for attribute since daySelector uses "aria-disabled" instead of "disabled"
    expect(daySelector).not.toHaveAttribute("aria-disabled", "true");

    expect(screen.queryByText(/monday/i)).toBeNull();
    expect(screen.queryByText(/tuesday/i)).toBeNull();
    expect(screen.queryByText(/wednesday/i)).toBeNull();
    expect(screen.queryByText(/thursday/i)).toBeNull();
    expect(screen.getByText(/friday/i)).toBeInTheDocument();
    expect(screen.getByText(/saturday/i)).toBeInTheDocument();
    expect(screen.getByText(/sunday/i)).toBeInTheDocument();
  });

  it("renders all the elements as disabled", () => {
    render(
      <TimeslotRecurrenceComponent
        id={1}
        recurrence={EXAMPLE_TIMESLOT_RECURRENCE_1}
        onChange={onChange}
        onRemove={onRemove}
        disabled
      />,
    );

    const removeButton = screen.getByRole("button", { name: /remove/i });
    expect(removeButton).toBeInTheDocument();
    expect(removeButton).toBeDisabled();

    const allDayCheckbox = screen.getByRole("checkbox");
    expect(allDayCheckbox).toBeInTheDocument();
    expect(allDayCheckbox).toBeDisabled();

    const startTimePicker = screen.getByLabelText(/start time picker/i);
    expect(startTimePicker).toBeInTheDocument();
    expect(startTimePicker).toBeDisabled();

    const endTimePicker = screen.getByLabelText(/end time picker/i);
    expect(endTimePicker).toBeInTheDocument();
    expect(endTimePicker).toBeDisabled();

    const daySelector = screen.getByRole("button", { name: /days/i });
    expect(daySelector).toBeInTheDocument();
    // Have to check for attribute since daySelector uses "aria-disabled" instead of "disabled"
    expect(daySelector).toHaveAttribute("aria-disabled", "true");
  });

  it("calls function onRemove() with the right parameters when remove button is clicked", () => {
    render(
      <TimeslotRecurrenceComponent
        id={1}
        recurrence={EXAMPLE_TIMESLOT_RECURRENCE_1}
        onChange={onChange}
        onRemove={onRemove}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /remove/i }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith(1, EXAMPLE_TIMESLOT_RECURRENCE_1);
  });

  it("calls function onChange() with the right parameters when all day checkbox is clicked", () => {
    render(
      <TimeslotRecurrenceComponent
        id={1}
        recurrence={EXAMPLE_TIMESLOT_RECURRENCE_1}
        onChange={onChange}
        onRemove={onRemove}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/camelcase
    expect(onChange).toHaveBeenCalledWith(1, { ...EXAMPLE_TIMESLOT_RECURRENCE_1, all_day: true, start: "", end: "" });
  });

  it("calls function onChange() with the right parameters when user types start time", () => {
    render(
      <TimeslotRecurrenceComponent
        id={1}
        recurrence={EXAMPLE_TIMESLOT_RECURRENCE_1}
        onChange={onChange}
        onRemove={onRemove}
      />,
    );

    const startTimeInput = screen.getByLabelText(/start time picker/i);
    userEvent.type(startTimeInput, "{selectall}{backspace}20:00");

    expect(startTimeInput).toHaveValue("20:00");
    expect(onChange).toHaveBeenCalledTimes(5);
    expect(onChange).toHaveBeenLastCalledWith(1, { ...EXAMPLE_TIMESLOT_RECURRENCE_1, start: "20:0:0" });
  });

  it("calls function onChange() with the right parameters when user types end time", () => {
    render(
      <TimeslotRecurrenceComponent
        id={1}
        recurrence={EXAMPLE_TIMESLOT_RECURRENCE_1}
        onChange={onChange}
        onRemove={onRemove}
      />,
    );

    const endTimeInput = screen.getByLabelText(/end time picker/i);
    userEvent.type(endTimeInput, "{selectall}{backspace}22:00");

    expect(endTimeInput).toHaveValue("22:00");
    expect(onChange).toHaveBeenCalledTimes(5);
    expect(onChange).toHaveBeenLastCalledWith(1, { ...EXAMPLE_TIMESLOT_RECURRENCE_1, end: "22:0:0" });
  });

  it("calls function onChange() with the right parameters when day selector is changed", () => {
    render(
      <TimeslotRecurrenceComponent
        id={1}
        recurrence={EXAMPLE_TIMESLOT_RECURRENCE_1}
        onChange={onChange}
        onRemove={onRemove}
      />,
    );

    const daySelector = screen.getByRole("button", { name: /days/i });
    userEvent.click(daySelector);

    const wednesdayOption = screen.getByRole("option", { name: /wednesday/i });
    userEvent.click(wednesdayOption);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(1, { ...EXAMPLE_TIMESLOT_RECURRENCE_1, days: [1, 2, 4, 5] });
  });
});

describe("DaySelector tests", () => {
  const selectedDays: TimeRecurrenceDay[] = [1, 2, 3];
  const onSelectionChange = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component correctly", () => {
    render(<DaySelector selectedDays={selectedDays} onSelectionChange={onSelectionChange} />);
    const daySelector = screen.getByRole("button");

    expect(daySelector).toBeInTheDocument();
    expect(daySelector).not.toHaveAttribute("aria-disabled", "true");

    expect(screen.getByText(/monday/i)).toBeInTheDocument();
    expect(screen.getByText(/tuesday/i)).toBeInTheDocument();
    expect(screen.getByText(/wednesday/i)).toBeInTheDocument();
    expect(screen.queryByText(/thursday/i)).toBeNull();
    expect(screen.queryByText(/friday/i)).toBeNull();
    expect(screen.queryByText(/satursday/i)).toBeNull();
    expect(screen.queryByText(/sunday/i)).toBeNull();
  });

  it("renders the component as disabled", () => {
    render(<DaySelector selectedDays={selectedDays} onSelectionChange={onSelectionChange} disabled />);
    const daySelector = screen.getByRole("button");

    expect(daySelector).toBeInTheDocument();
    expect(daySelector).toHaveAttribute("aria-disabled", "true");
  });

  it("shows dropdown menu when component is clicked", () => {
    render(<DaySelector selectedDays={selectedDays} onSelectionChange={onSelectionChange} />);
    userEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("presentation")).toBeInTheDocument();
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    const mondayOption = screen.getByRole("option", { name: /monday/i });
    expect(mondayOption).toBeInTheDocument();
    expect(mondayOption).toHaveAttribute("aria-selected", "true");

    const tuesdayOption = screen.getByRole("option", { name: /tuesday/i });
    expect(tuesdayOption).toBeInTheDocument();
    expect(tuesdayOption).toHaveAttribute("aria-selected", "true");

    const wednesdayOption = screen.getByRole("option", { name: /wednesday/i });
    expect(wednesdayOption).toBeInTheDocument();
    expect(wednesdayOption).toHaveAttribute("aria-selected", "true");

    const thursdayOption = screen.getByRole("option", { name: /thursday/i });
    expect(thursdayOption).toBeInTheDocument();
    expect(thursdayOption).not.toHaveAttribute("aria-selected", "true");

    const fridayOption = screen.getByRole("option", { name: /friday/i });
    expect(fridayOption).toBeInTheDocument();
    expect(fridayOption).not.toHaveAttribute("aria-selected", "true");

    const saturdayOption = screen.getByRole("option", { name: /saturday/i });
    expect(saturdayOption).toBeInTheDocument();
    expect(saturdayOption).not.toHaveAttribute("aria-selected", "true");

    const sundayOption = screen.getByRole("option", { name: /sunday/i });
    expect(sundayOption).toBeInTheDocument();
    expect(sundayOption).not.toHaveAttribute("aria-selected", "true");
  });

  it("calls function onSelectionChange() when day gets selected", () => {
    render(<DaySelector selectedDays={selectedDays} onSelectionChange={onSelectionChange} />);
    userEvent.click(screen.getByRole("button"));
    userEvent.click(screen.getByRole("option", { name: /friday/i }));

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledWith([1, 2, 3, 5]);
  });

  it("calls function onSelectionChange() when day gets removed", () => {
    render(<DaySelector selectedDays={selectedDays} onSelectionChange={onSelectionChange} />);
    userEvent.click(screen.getByRole("button"));
    userEvent.click(screen.getByRole("option", { name: /monday/i }));

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledWith([2, 3]);
  });
});

describe("TimeslotComponent tests", () => {
  const recurrences: TimeRecurrence[] = [EXAMPLE_TIMESLOT_RECURRENCE_1];
  const onSave = jest.fn();
  const onDelete = jest.fn();

  it("renders new timeslot correctly", () => {
    render(<TimeslotComponent recurrences={recurrences} unsavedChanges={true} onSave={onSave} onDelete={onDelete} />);

    const timeslotName = screen.getByRole("textbox", { name: "" });
    expect(timeslotName).toBeInTheDocument();
    expect(timeslotName).toHaveValue("");

    const buttonGroup = screen.getByRole("group");
    expect(buttonGroup).toBeInTheDocument();

    const createButton = screen.getByRole("button", { name: /create/i });
    expect(createButton).toBeInTheDocument();
    expect(createButton).toBeEnabled();

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toBeDisabled();

    const addRecurrenceButton = screen.getByRole("button", { name: /add recurrence/i });
    expect(addRecurrenceButton).toBeInTheDocument();
    expect(addRecurrenceButton).toBeEnabled();

    const removeRecurrenceButton = screen.getByRole("button", { name: /remove/i });
    expect(removeRecurrenceButton).toBeInTheDocument();
  });

  it("renders already existing timeslot correctly", () => {
    render(
      <TimeslotComponent
        pk={1}
        name={"Test"}
        recurrences={recurrences}
        exists
        unsavedChanges={false}
        onSave={onSave}
        onDelete={onDelete}
      />,
    );

    const timeslotName = screen.getByRole("textbox", { name: "" });
    expect(timeslotName).toBeInTheDocument();
    expect(timeslotName).toHaveValue("Test");

    const buttonGroup = screen.getByRole("group");
    expect(buttonGroup).toBeInTheDocument();

    const createButton = screen.getByRole("button", { name: /save/i });
    expect(createButton).toBeInTheDocument();
    expect(createButton).toBeDisabled();

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toBeEnabled();

    const addRecurrenceButton = screen.getByRole("button", { name: /add recurrence/i });
    expect(addRecurrenceButton).toBeInTheDocument();
    expect(addRecurrenceButton).toBeEnabled();

    const removeRecurrenceButton = screen.getByRole("button", { name: /remove/i });
    expect(removeRecurrenceButton).toBeInTheDocument();
  });
});
