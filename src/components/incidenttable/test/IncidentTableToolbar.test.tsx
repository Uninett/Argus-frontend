/**  * @jest-environment jsdom-sixteen  */

import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TableToolbar from "../IncidentTableToolbar";
import { Incident, IncidentTag, SourceSystem } from "../../../api/types";
import ApiClient from '../../../api/client';


const onClearSelectionMock = jest.fn();

const sourceSystemMock: SourceSystem = {
  pk: 100,
  name: 'Test Source System',
  type: 'Test Type'
}

const incidentTagsMock: IncidentTag[] = [
  {added_by: 1, added_time: '2021-06-28 08:29:06', tag: 'Test tag'}
]

let incidentMock: Incident = {
  level: 1,
  pk: 1000,
  start_time: '2021-06-28 08:29:06',
  end_time: '2021-08-28 08:29:06',
  stateful: true,
  details_url: '',
  description: 'Test incident',
  ticket_url: '',
  open: true,
  acked: false,

  source: sourceSystemMock,
  source_incident_id: '1001',

  tags: incidentTagsMock
}

describe('Incident Table toolbar test suite',() => {
  let incidentTableToolbar: HTMLElement;

  beforeEach(() => {
    incidentTableToolbar = render(
      <TableToolbar
        selectedIncidents={new Set<Incident["pk"]>([incidentMock["pk"]])}
        onClearSelection={onClearSelectionMock}
      />).container;
  });

  afterEach(() => {
    document.body.removeChild(incidentTableToolbar);
    incidentTableToolbar.remove();
    jest.clearAllMocks();
  })

  test('add ticket button is rendered', () => {
    const addTicketBtn = screen.getByRole('button', {name: /add ticket/i});
    expect(addTicketBtn).toBeInTheDocument();
  });
});

describe('Add Ticket URL functional test suite', () => {
  let incidentTableToolbar: HTMLElement;

  const patchIncidentTicketUrlSpy = jest.spyOn(ApiClient, 'patchIncidentTicketUrl');

  beforeEach(() => {
    incidentTableToolbar = render(
      <TableToolbar
        selectedIncidents={new Set<Incident["pk"]>([incidentMock["pk"]])}
        onClearSelection={onClearSelectionMock}
      />).container;
  });

  afterEach(() => {
    document.body.removeChild(incidentTableToolbar);
    incidentTableToolbar.remove();
    jest.clearAllMocks();
  })

  test('add ticket url flow works correctly', () => {
    patchIncidentTicketUrlSpy.mockResolvedValueOnce({ticket_url: 'testTicketUrl'});

    const addTicketBtn = screen.getByRole('button', {name: /add ticket/i});
    userEvent.click(addTicketBtn);

    const addTicketDialog = screen.getByRole('dialog')
    expect(addTicketDialog).toBeInTheDocument();

    const dialogInputField = within(addTicketDialog).getByRole('textbox', {name: /message/i});
    userEvent.type(dialogInputField, 'testUrl');
    expect(dialogInputField).toHaveValue('testUrl');

    const dialogSubmitBtn = within(addTicketDialog).getByRole('button', {name: /submit/i});
    userEvent.click(dialogSubmitBtn);

    expect(patchIncidentTicketUrlSpy).toBeCalledWith(1000, 'testUrl');
  });
});