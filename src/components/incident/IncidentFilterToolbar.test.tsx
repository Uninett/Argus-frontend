import { ButtonGroupSwitch, IncidentFilterToolbar } from "./IncidentFilterToolbar";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";
import MockAdapter from "axios-mock-adapter";
import api, { ApiClient, IncidentMetadata, SourceSystem } from "../../api";
import Auth from '../../auth';
import SelectedFilterProvider from "../filterprovider";
import { IncidentsFilter } from "../incidenttable/FilteredIncidentTable";

const apiMock = new MockAdapter(api.api);

jest.mock('../filterprovider.tsx')

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

  test('all incidents toolbar components are rendered', () => {
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
});

describe('Open State Switch test suite', () => {

  let incidentToolbar: HTMLElement;
  const sourceSystemMock: SourceSystem = {
    pk: 0,
    name: 'testSourceSystem',
    type: 'testSourceSystemType'
  };
  const incidentMetadataMock: IncidentMetadata = {
    sourceSystems: [sourceSystemMock]
  };

  const authTokenSpy = jest.spyOn(Auth, 'token');
  const authIsAuthenticatedSpy = jest.spyOn(Auth, 'isAuthenticated');

  let openStateSwitch: HTMLElement;

  const onSelectMock = jest.fn();

  let incidentsFilterMock: IncidentsFilter;

  const useSelectedFilterMock = jest.fn();

  beforeEach(() => {
    //
    // // @ts-ignore
    // authTokenSpy.mockResolvedValueOnce('testToken');
    // // @ts-ignore
    // authIsAuthenticatedSpy.mockResolvedValueOnce(true);
    //
    // apiMock
    //   .onGet("/api/v1/incidents/metadata/")
    //   .reply(200, incidentMetadataMock);
    //
    // incidentToolbar = render(<IncidentFilterToolbar />).container;

    openStateSwitch = render(
      <ButtonGroupSwitch
      selected={"open"}
      options={["open", "closed", "both"]}
      getLabel={(show: "open" | "closed" | "both") => ({ open: "Open", closed: "Closed", both: "Both" }[show])}
      getColor={(selected: boolean) => (selected ? "primary" : "default")}
      getTooltip={(show: "open" | "closed" | "both") =>
        ({
          open: "Only open incidents",
          closed: "Only closed incidents",
          both: "Both open and closed incidents ",
        }[show])
      }
      onSelect={onSelectMock as any}
      />).container;
  });

  afterEach(() => {
    document.body.removeChild(openStateSwitch);
    openStateSwitch.remove();
    jest.clearAllMocks();
  })

  // FUNCTIONAL TESTS
  test('click selects unselected option', async () => {
    const closedStateBtn = screen.getByTitle('Only closed incidents');
    // let openStateButtons: HTMLCollectionOf<HTMLButtonElement> = openStateSwitch.getElementsByTagName('button');
    // //
    // expect(openStateButtons.length).toBe(3); // todo remove because redundant?

    // let selectedBtn = openStateButtons[1]; // button to be newly selected
    // let prevSelectedBtn = openStateButtons[0]; // button that is currently selected

    // Check pre-click conditions
    // expect(openStateButtons[1]).not.toHaveClass('MuiButton-containedPrimary'); // not yet selected
    // expect(openStateButtons[0]).toHaveClass('MuiButton-containedPrimary'); // currently selected

    userEvent.click(closedStateBtn);
    expect(onSelectMock).toBeCalledWith("closed");

    // let notSelectedBtn = await screen.findByTitle('Only open incidents')

    // const unselectedBtn = await screen.findByTitle('Only open incidents');

    // const selectedBtn = await screen.findByTitle('Only closed incidents');

    // await waitForElementToBeRemoved(() => {
    //   screen.getByTitle('Open state switch');
    // });

    // // Selects a new option
    // expect(openStateButtons[1]).toHaveClass('MuiButton-containedPrimary'); // click triggered select
    //
    // // Unselects previously selected option
    // expect(openStateButtons[0]).not.toHaveClass('MuiButton-containedPrimary'); // click triggered unselect
    //
    // await screen.findByTitle('Open state switch');
  });
});

test('setup test', () => {

});

