/**  * @jest-environment jsdom-sixteen  */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddPhoneNumberDialog from "./AddPhoneNumberDialog";

describe("AddPhoneNumberDialog tests", () => {
  const onSaveMock = jest.fn();
  const onCancelMock = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component correctly when open is true", () => {
    render(<AddPhoneNumberDialog open={true} onSave={onSaveMock} onCancel={onCancelMock} />);

    const dialog = screen.getByRole("dialog");
    const inputField = screen.getByRole("textbox");
    const saveButton = screen.getByRole("button", { name: /save/i });
    const cancelButton = screen.getByRole("button", { name: /cancel/i });

    expect(dialog).toBeInTheDocument();
    expect(inputField).toBeInTheDocument();
    expect(saveButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });

  it("does not render the component when open is false", () => {
    render(<AddPhoneNumberDialog open={false} onSave={onSaveMock} onCancel={onCancelMock} />);

    const dialog = screen.queryByRole("dialog");
    const inputField = screen.queryByRole("textbox");
    const saveButton = screen.queryByRole("button", { name: /save/i });
    const cancelButton = screen.queryByRole("button", { name: /cancel/i });

    expect(dialog).toBeNull();
    expect(inputField).toBeNull();
    expect(saveButton).toBeNull();
    expect(cancelButton).toBeNull();
  });

  it("calls onSave() with the right phone number when save button is clicked", () => {
    const phoneNumber = "12345678";

    render(<AddPhoneNumberDialog open={true} onSave={onSaveMock} onCancel={onCancelMock} />);

    const inputField = screen.getByRole("textbox");
    const saveButton = screen.getByRole("button", { name: /save/i });

    userEvent.type(inputField, phoneNumber);
    userEvent.click(saveButton);

    expect(onSaveMock).toHaveBeenCalledTimes(1);
    expect(onSaveMock).toHaveBeenCalledWith(phoneNumber);
  });

  it("calls onCancel() when cancel button is clicked", () => {
    render(<AddPhoneNumberDialog open={true} onSave={onSaveMock} onCancel={onCancelMock} />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });

    userEvent.click(cancelButton);

    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel() when close button is clicked", () => {
    render(<AddPhoneNumberDialog open={true} onSave={onSaveMock} onCancel={onCancelMock} />);

    const closeButton = screen.getByRole("button", { name: /close/i });

    userEvent.click(closeButton);

    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  it("displays error message when no phone number is provided", () => {
    render(<AddPhoneNumberDialog open={true} onSave={onSaveMock} onCancel={onCancelMock} />);

    const saveButton = screen.getByRole("button", { name: /save/i });

    userEvent.click(saveButton);

    const errorMessage = screen.getByText(/this field cannot be empty/i);

    expect(errorMessage).toBeInTheDocument();
    expect(onSaveMock).not.toHaveBeenCalled();
  });
});
