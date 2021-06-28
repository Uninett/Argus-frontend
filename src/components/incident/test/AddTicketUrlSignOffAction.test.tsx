/**  * @jest-environment jsdom-sixteen  */

import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddTicketUrl from "../AddTicketUrlSignOffAction";
import OutlinedButton from "../../buttons/OutlinedButton";

describe('Add Ticket Dialog test suite', () => {

  let addTicketDialog: HTMLElement;

  const onAddTicketUrlMock = jest.fn();

  beforeEach(() => {
    addTicketDialog = render(
      <AddTicketUrl
        onAddTicketUrl={onAddTicketUrlMock}
        signOffActionProps={{
          ButtonComponent: OutlinedButton,
          buttonProps: { className: undefined, size: "small" },
        }}
      />).container;
  });

  afterEach(() => {
    document.body.removeChild(addTicketDialog);
    addTicketDialog.remove();
    jest.clearAllMocks();
  })

  test('add ticket dialog is rendered correctly', () => {
    const addTicketBtn = screen.getByRole('button', {name: /add ticket/i});
    userEvent.click(addTicketBtn);

    const addTicketDialog = screen.getByRole('dialog')
    expect(addTicketDialog).toBeInTheDocument();
    expect(addTicketDialog).toBeVisible();

    const dialogTitle = within(addTicketDialog).getByRole('heading', {name: /add ticket url/i});
    expect(dialogTitle).toBeInTheDocument();
    expect(dialogTitle).toBeVisible();

    const inputHelperText = within(addTicketDialog).getByText(/write an url of an existing ticket/i);
    expect(inputHelperText).toBeInTheDocument();
    expect(inputHelperText).toBeVisible();

    const dialogInputField = within(addTicketDialog).getByRole('textbox', {name: /message/i});
    expect(dialogInputField).toBeInTheDocument();
    expect(dialogInputField).toBeVisible();

    const dialogSubmitBtn = within(addTicketDialog).getByRole('button', {name: /submit/i});
    expect(dialogSubmitBtn).toBeInTheDocument();
    expect(dialogSubmitBtn).toBeVisible();

    const dialogCancelBtn = within(addTicketDialog).getByRole('button', {name: /cancel/i});
    expect(dialogCancelBtn).toBeInTheDocument();
    expect(dialogCancelBtn).toBeVisible();
  });
});