/**  * @jest-environment jsdom-sixteen  */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";

import TimeslotComponent, { TimeslotRecurrenceComponent, DaySelector } from "./index";
import api, { TimeRecurrence } from "../../api";

const DEFAULT_TIMESLOT_RECURRENCE: TimeRecurrence = {
  // eslint-disable-next-line
  all_day: false,
  start: "04:00:00",
  end: "16:00:00",
  days: [1, 2, 3, 4, 5], // work-week
};

describe("TimeslotRecurrenceComponent: rendering", () => {
  beforeEach(() => {
    const onChange = jest.fn();
    const onRemove = jest.fn();

    render(
      <TimeslotRecurrenceComponent
        id={1}
        recurrence={DEFAULT_TIMESLOT_RECURRENCE}
        onChange={onChange}
        onRemove={onRemove}
      />,
    );
  });

  it("renders the Remove button", () => {
    expect(screen.getByRole("button", { name: /remove/i })).toBeInTheDocument();
  });

  it("renders the All day checkbox", () => {
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("renders the Start time input field", () => {
    expect(screen.getByLabelText(/start time picker/i)).toBeInTheDocument();
  });

  it("renders the End time input field", () => {
    expect(screen.getByLabelText(/end time picker/i)).toBeInTheDocument();
  });

  it("renders the Day selector", () => {
    //TODO: Fix for value on label
  });
});
