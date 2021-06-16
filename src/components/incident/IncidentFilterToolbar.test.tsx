import { render, screen } from "@testing-library/react";
import { IncidentFilterToolbar, ButtonGroupSwitch } from './IncidentFilterToolbar';
import React from "react";
import { Token, User } from "../../api";

// const testUser: User = {
//   username: 'testUser',
//   first_name: 'FTest',
//   last_name: 'LTest',
//   email: 'test@test.test'
// };
//
// const testToken: Token = "testToken";
//
// const authServiceMock = {
//
// }

describe('Incident Toolbar test suite', () => {

  let incidentToolbar: HTMLElement;

  beforeEach(() => {
    incidentToolbar = render(<IncidentFilterToolbar />).container;
  });

  afterEach(() => {
    document.body.removeChild(incidentToolbar);
    incidentToolbar.remove();
    jest.clearAllMocks();
  })

  test('incidents toolbar is rendered correctly', () => {
    const incidentsToolbarElement = screen.getByTestId('incidents-toolbar');
    expect(incidentsToolbarElement).toBeInTheDocument();

    // Open State Switch buttons
    const openStateButton = screen.getByTitle('Only open incidents');
    expect(openStateButton).toBeInTheDocument();
    expect(openStateButton).toBeVisible();

    const closedStateButton = screen.getByTitle('Only closed incidents');
    expect(closedStateButton).toBeInTheDocument();
    expect(closedStateButton).toBeVisible();

    const bothOpenStatesButton = screen.getByTitle('Both open and closed incidents');
    expect(bothOpenStatesButton).toBeInTheDocument();
    expect(bothOpenStatesButton).toBeVisible();

    // Acked Switch buttons
    const unackedStateButton = screen.getByTitle('Only unacked incidents');
    expect(unackedStateButton).toBeInTheDocument();
    expect(unackedStateButton).toBeVisible();

    const bothAckedStatesButton = screen.getByTitle('Unacked and acked incidents');
    expect(bothAckedStatesButton).toBeInTheDocument();
    expect(bothAckedStatesButton).toBeVisible();

    const sourceSelector = incidentToolbar.querySelector('#filter-select-source');
    expect(sourceSelector).toBeInTheDocument();
    expect(sourceSelector).toBeVisible();

    const tagSelector = incidentToolbar.querySelector('#filter-select-tags');
    expect(tagSelector).toBeInTheDocument();
    expect(tagSelector).toBeVisible();

    const filtersDropdown = incidentToolbar.querySelector('#filter-select');
    expect(filtersDropdown).toBeInTheDocument();
    expect(filtersDropdown).toBeVisible();

    const moreSettingsItem = screen.getByTitle('Additional settings');
    expect(moreSettingsItem).toBeInTheDocument();
    expect(moreSettingsItem).toBeVisible();

    const dropdownToolbar = incidentToolbar.querySelector('#more-settings-dropdown');
    expect(dropdownToolbar).not.toBeInTheDocument();
  });
});

describe('Open State Switch test suite', () => {

  let incidentToolbar: HTMLElement;

  beforeEach(() => {
    incidentToolbar = render(<IncidentFilterToolbar />).container;
  });

  afterEach(() => {
    document.body.removeChild(incidentToolbar);
    incidentToolbar.remove();
    jest.clearAllMocks();
  })

  test('open state switch is rendered', () => {
    const openStateSwitch = screen.getByTestId('open-state-switch');
    expect(openStateSwitch).toBeInTheDocument();
  });

  test('open state switch is visible', () => {
    const openStateSwitch = screen.getByTestId('open-state-switch');
    expect(openStateSwitch).toBeVisible();
  });
});

test('setup test', () => {

});

