/**  * @jest-environment jsdom-sixteen  */

import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";

import api from "../../api";
import auth from "../../auth";
import { Filter, Incident, SourceSystem } from "../../api/types";

const apiMock = new MockAdapter(api.api);

const KNOWN_SOURCE_SYSTEMS: SourceSystem[] = [
  {
    pk: 100,
    name: 'Test Source System',
    type: 'Test Type'
  },
  {
    pk: 200,
    name: 'Test Source System 1',
    type: 'Test Type'
  }
];

const EXISTING_INCIDENTS: Incident[] = [
  {
    pk: 1000,
    start_time: '2021-06-28 08:29:06',
    end_time: '2021-08-28 08:29:06',
    stateful: true,
    details_url: '',
    description: 'Not critical test incident',
    ticket_url: '',
    open: true,
    acked: false,
    level: 5,

    source: KNOWN_SOURCE_SYSTEMS[0],
    source_incident_id: '1001',

    tags: [
      {added_by: 1, added_time: '2021-06-28 08:29:06', tag: 'Test tag'}
    ]
  },
  {
    pk: 2000,
    start_time: '2021-06-28 08:29:06',
    end_time: '2021-08-28 08:29:06',
    stateful: true,
    details_url: '',
    description: 'Critical test incident',
    ticket_url: '',
    open: false,
    acked: true,
    level: 2,

    source: KNOWN_SOURCE_SYSTEMS[1],
    source_incident_id: '2001',

    tags: [
      {added_by: 1, added_time: '2021-06-29 08:29:06', tag: 'Test tag 1'},
      {added_by: 1, added_time: '2021-06-28 08:29:06', tag: 'Test tag 2'}
    ]
  }
];

const EXISTING_FILTER: Filter = {
  pk: 10,
  name: 'All',
  sourceSystemIds: [],
  tags: [],

  filter: {}
}

