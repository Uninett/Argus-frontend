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

    const openStateSwitch = screen.getByTitle('Open state switch');
    expect(openStateSwitch).toBeInTheDocument();

    const ackedStateSwitch = screen.getByTitle('Acked state switch');
    expect(ackedStateSwitch).toBeInTheDocument();

    // Acked Switch buttons
    const unackedStateButton = screen.getByTitle('Only unacked incidents');
    expect(unackedStateButton).toBeInTheDocument();
    expect(unackedStateButton).toBeVisible();

    const bothAckedStatesButton = screen.getByTitle('Unacked and acked incidents');
    expect(bothAckedStatesButton).toBeInTheDocument();
    expect(bothAckedStatesButton).toBeVisible();

    const sourceSelector = screen.getByTitle('Source selector');
    expect(sourceSelector).toBeInTheDocument();
    expect(sourceSelector).toBeVisible();

    const sourceSelectorInput = incidentToolbar.querySelector('#filter-select-source');
    expect(sourceSelectorInput).toBeInTheDocument();
    expect(sourceSelectorInput).toBeVisible();

    const tagsSelector = screen.getByTitle('Tags selector');
    expect(tagsSelector).toBeInTheDocument();
    expect(tagsSelector).toBeVisible();

    const tagSelectorInput = incidentToolbar.querySelector('#filter-select-tags');
    expect(tagSelectorInput).toBeInTheDocument();
    expect(tagSelectorInput).toBeVisible();

    const filterDropdown = screen.getByTitle('Filter dropdown');
    expect(filterDropdown).toBeInTheDocument();
    expect(filterDropdown).toBeVisible();

    const filtersDropdownInput = incidentToolbar.querySelector('#filter-select');
    expect(filtersDropdownInput).toBeInTheDocument();
    expect(filtersDropdownInput).toBeVisible();

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
    const openStateSwitch = screen.getByTitle('Open state switch');
    expect(openStateSwitch).toBeInTheDocument();
  });

  test('open state switch is visible', () => {
    const openStateSwitch = screen.getByTitle('Open state switch');
    expect(openStateSwitch).toBeVisible();
  });

  test('open state switch buttons render correctly', () => {
    const openStateSwitch = screen.getByTitle('Open state switch');
    const openStateButtons: HTMLCollectionOf<HTMLButtonElement> = openStateSwitch.getElementsByTagName('button');

    // Provided options render
    const openStateButton = screen.getByTitle('Only open incidents');
    expect(openStateButtons).toContain(openStateButton);
    expect(openStateButton).toBeInTheDocument();
    expect(openStateButton).toBeVisible();
    expect(openStateButton.querySelector('.MuiButton-label')?.textContent).toBe('Open');

    const closedStateButton = screen.getByTitle('Only closed incidents');
    expect(openStateButtons).toContain(closedStateButton);
    expect(closedStateButton).toBeInTheDocument();
    expect(closedStateButton).toBeVisible();
    expect(closedStateButton.querySelector('.MuiButton-label')?.textContent).toBe('Closed');

    const bothOpenStatesButton = screen.getByTitle('Both open and closed incidents');
    expect(openStateButtons).toContain(bothOpenStatesButton);
    expect(bothOpenStatesButton).toBeInTheDocument();
    expect(bothOpenStatesButton).toBeVisible();
    expect(bothOpenStatesButton.querySelector('.MuiButton-label')?.textContent).toBe('Both');

    // No other options render
    expect(openStateButtons.length).toBe(3);
  });

  test('open state switch buttons have correct initial conditions', () => {
    const openStateButton = screen.getByTitle('Only open incidents');
    const closedStateButton = screen.getByTitle('Only closed incidents');
    const bothOpenStatesButton = screen.getByTitle('Both open and closed incidents');

    // All buttons are enabled
    expect(openStateButton).toBeEnabled();
    expect(closedStateButton).toBeEnabled();
    expect(bothOpenStatesButton).toBeEnabled();

    // Only open button is selected by default
    expect(openStateButton).toHaveClass('MuiButton-containedPrimary');
    expect(closedStateButton).not.toHaveClass('MuiButton-containedPrimary');
    expect(bothOpenStatesButton).not.toHaveClass('MuiButton-containedPrimary');

  });
});

test('setup test', () => {

});

