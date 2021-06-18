import { ButtonGroupSwitch, IncidentFilterToolbar } from "./IncidentFilterToolbar";
import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";
import SourceSelector from "../sourceselector";

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
    expect(openStateSwitch).toBeVisible();

    const ackedStateSwitch = screen.getByTitle('Acked state switch');
    expect(ackedStateSwitch).toBeInTheDocument();
    expect(ackedStateSwitch).toBeVisible();

    const sourceSelector = screen.getByTitle('Source selector');
    expect(sourceSelector).toBeInTheDocument();
    expect(sourceSelector).toBeVisible();

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
    const openStateButtons: HTMLCollectionOf<HTMLButtonElement> =
      openStateSwitch.getElementsByTagName('button');

    // Provided options render
    const openStateButton = screen.getByTitle('Only open incidents');
    expect(openStateButtons).toContain(openStateButton);
    expect(openStateButton).toBeInTheDocument();
    expect(openStateButton).toBeVisible();
    expect(openStateButton
      .querySelector('.MuiButton-label')?.textContent).toBe('Open');

    const closedStateButton = screen.getByTitle('Only closed incidents');
    expect(openStateButtons).toContain(closedStateButton);
    expect(closedStateButton).toBeInTheDocument();
    expect(closedStateButton).toBeVisible();
    expect(closedStateButton
      .querySelector('.MuiButton-label')?.textContent).toBe('Closed');

    const bothOpenStatesButton = screen.getByTitle('Both open and closed incidents');
    expect(openStateButtons).toContain(bothOpenStatesButton);
    expect(bothOpenStatesButton).toBeInTheDocument();
    expect(bothOpenStatesButton).toBeVisible();
    expect(bothOpenStatesButton
      .querySelector('.MuiButton-label')?.textContent).toBe('Both');

    // No other options render
    expect(openStateButtons.length).toBe(3);
  });

  test('acked state switch buttons have correct initial conditions', () => {
    const unackedStateButton = screen.getByTitle('Only unacked incidents');
    const bothAckedStatesButton = screen.getByTitle('Unacked and acked incidents');

    // All buttons are enabled
    expect(unackedStateButton).toBeEnabled();
    expect(bothAckedStatesButton).toBeEnabled();

    // Only unacked button is selected by default
    expect(unackedStateButton).toHaveClass('MuiButton-containedPrimary');
    expect(bothAckedStatesButton).not.toHaveClass('MuiButton-containedPrimary');
  });

  test('acked state switch buttons render correctly', () => {
    const ackedStateSwitch = screen.getByTitle('Acked state switch');
    const ackedStateButtons: HTMLCollectionOf<HTMLButtonElement> =
      ackedStateSwitch.getElementsByTagName('button');

    // Provided options render
    const unackedStateButton = screen.getByTitle('Only unacked incidents');
    expect(ackedStateButtons).toContain(unackedStateButton);
    expect(unackedStateButton).toBeInTheDocument();
    expect(unackedStateButton).toBeVisible();
    expect(unackedStateButton
      .querySelector('.MuiButton-label')?.textContent).toBe('Unacked');

    const bothAckedStatesButton = screen.getByTitle('Unacked and acked incidents');
    expect(ackedStateButtons).toContain(bothAckedStatesButton);
    expect(bothAckedStatesButton).toBeInTheDocument();
    expect(bothAckedStatesButton).toBeVisible();
    expect(bothAckedStatesButton
      .querySelector('.MuiButton-label')?.textContent).toBe('Both');

    // No other options render
    expect(ackedStateButtons.length).toBe(2);
  });

  test('source selector has correct initial conditions', () => {
    const sourceSelector = screen.getByTitle('Source selector');
    const sourceSelectorForm = sourceSelector.querySelector('[role="combobox"]');

    expect(sourceSelectorForm).toBeInTheDocument();
    expect(sourceSelectorForm).toBeVisible();
    expect(sourceSelectorForm).toBeEnabled();

    // Check whether no source is selected by default
    expect(sourceSelectorForm).not.toBeChecked();
  });

  test('source selector renders correctly', () => {
    const sourceSelector = screen.getByTitle('Source selector');

    const sourceSelectorName = sourceSelector.querySelector('.MuiTypography-root');
    expect(sourceSelectorName).toBeInTheDocument();
    expect(sourceSelectorName).toBeVisible();
    expect(sourceSelectorName?.textContent).toBe('Sources');

    const sourceSelectorInput = sourceSelector.querySelector('#filter-select-source');
    expect(sourceSelectorInput).toBeInTheDocument();
    expect(sourceSelectorInput).toBeVisible();
    expect(sourceSelectorInput).toHaveAttribute('placeholder', 'Source name');

    const sourceSelectorHelperText = sourceSelector.querySelector('#filter-select-source-helper-text');
    expect(sourceSelectorHelperText).toBeInTheDocument();
    expect(sourceSelectorHelperText).toBeVisible();
    expect(sourceSelectorHelperText?.textContent).toBe('Press enter to add new source');

    const sourceSelectorPopup = sourceSelector.querySelector('#filter-select-source-popup');
    expect(sourceSelectorPopup).not.toBeInTheDocument();
  });
});

describe('Open State Switch functional test suite', () => {
  let openStateSwitch: HTMLElement;

  const onSelectMock = jest.fn();

  beforeEach(() => {
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

  test('click selects unselected option', () => {
    const closedStateBtn = screen.getByTitle('Only closed incidents');
    userEvent.click(closedStateBtn);
    expect(onSelectMock).toBeCalledWith("closed");
  });
});

describe('Acked State Switch functional test suite', () => {
  let ackedStateSwitch: HTMLElement;

  const onAckedChangeMock = jest.fn();

  beforeEach(() => {
    ackedStateSwitch = render(
      <ButtonGroupSwitch
        selected={false}
        options={[false, true]}
        getLabel={(showAcked: boolean) => (showAcked ? "Both" : "Unacked")}
        getColor={(selected: boolean) => (selected ? "primary" : "default")}
        getTooltip={(showAcked: boolean) =>
          (showAcked ? "Unacked and acked incidents" : "Only unacked incidents")
        }
        onSelect={onAckedChangeMock as any}
      />).container;
  });

  afterEach(() => {
    document.body.removeChild(ackedStateSwitch);
    ackedStateSwitch.remove();
    jest.clearAllMocks();
  })

  test('click selects unselected option', () => {
    const bothAckedStatesButton = screen.getByTitle('Unacked and acked incidents');
    userEvent.click(bothAckedStatesButton);
    expect(onAckedChangeMock).toBeCalledWith(true);
  });
});

describe('Sources Selector functional test suite', () => {
  let sourcesSelector: HTMLElement;

  const knownSourcesMock = new Map([
    ["testSource1", 0],
    ["testSource2", 1]
  ]);

  const setSelectedFilterMock = jest.fn();

  // const findSourceIdMock = (name: string) => {
  //   return knownSourcesMock.get(name);
  // };
  const findSourceIdMock = jest.fn();

  // const onSelectionChangeMock = jest.fn(() => {
  //   findSourceIdMock();
  //   setSelectedFilterMock();
  // });
  const onSelectionChangeMock = jest.fn();

  beforeEach(() => {
    sourcesSelector = render(
      <SourceSelector
        sources={[ ...knownSourcesMock.keys() ]} // array of values
        onSelectionChange={onSelectionChangeMock}
        defaultSelected={[]}
      />).container;
  });

  afterEach(() => {
    document.body.removeChild(sourcesSelector);
    sourcesSelector.remove();
    jest.clearAllMocks();
  })

  test('click opens popup with correct known sources to select from', async () => {
    const sourcesSelectorInput = within(sourcesSelector).getByPlaceholderText('Source name');

    userEvent.click(sourcesSelectorInput as HTMLElement);

    // Wait until popup appears in the document
    const sourcesSelectorPopup = await waitFor(() => {
      return screen.getByRole('listbox');
    });
    expect(sourcesSelectorPopup).toBeInTheDocument();

    const autocompleteOptions = within(sourcesSelectorPopup).getAllByRole('option');
    expect(autocompleteOptions[0]).toHaveTextContent('testSource1');
    expect(autocompleteOptions[1]).toHaveTextContent('testSource2');
  });

  test('click on popup option correctly selects the option', async () => {
    // Placeholder text is the only option to search after
    const sourcesSelectorInput = within(sourcesSelector).getByPlaceholderText('Source name');
    userEvent.click(sourcesSelectorInput);

    // Wait until popup appears in the document
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    const firstOption = screen.getByText('testSource1');
    expect(firstOption).toBeInTheDocument();
    const secondOption = screen.getByText('testSource2');
    expect(secondOption).toBeInTheDocument();

    userEvent.click(firstOption); // selects the given option

    // Check whether selected option displays correctly in the input field
    const selectedOptionChip = await waitFor(() => {
      return within(sourcesSelector).getByRole('button');
    })
    expect(selectedOptionChip).toBeInTheDocument();
    expect(selectedOptionChip).toHaveTextContent('testSource1');
    expect(selectedOptionChip.querySelector('svg')).toBeInTheDocument();

    // Check whether selected sources list is updated with correct value
    expect(onSelectionChangeMock).toBeCalledWith(["testSource1"]);
    expect(onSelectionChangeMock.mock.calls.length).toBe(1);
    // // Check whether selected source index is returned correctly
    // expect(findSourceIdMock.mock.results[0].value).toBe(0);
  });
});

