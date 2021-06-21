import { ButtonGroupSwitch, IncidentFilterToolbar } from "./IncidentFilterToolbar";
import React from "react";
import { fireEvent, render, screen, waitFor, waitForElementToBeRemoved, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";
import SourceSelector from "../sourceselector";
import TagSelector, { Tag } from "../tagselector";

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

  test('tags selector renders correctly', () => {
    const tagsSelector = screen.getByTitle('Tags selector');

    const tagsSelectorForm = tagsSelector.querySelector('[role="combobox"]');

    expect(tagsSelectorForm).toBeInTheDocument();
    expect(tagsSelectorForm).toBeVisible();
    expect(tagsSelectorForm).toBeEnabled();

    const tagsSelectorName = tagsSelector.querySelector('.MuiTypography-root');
    expect(tagsSelectorName).toBeInTheDocument();
    expect(tagsSelectorName).toBeVisible();
    expect(tagsSelectorName?.textContent).toBe('Tags');

    const tagsSelectorInput = tagsSelector.querySelector('#filter-select-tags');
    expect(tagsSelectorInput).toBeInTheDocument();
    expect(tagsSelectorInput).toBeVisible();
    expect(tagsSelectorInput).toHaveAttribute('placeholder', 'key=value');

    const tagsSelectorHelperText = tagsSelector.querySelector('#filter-select-tags-helper-text');
    expect(tagsSelectorHelperText).toBeInTheDocument();
    expect(tagsSelectorHelperText).toBeVisible();
    expect(tagsSelectorHelperText?.textContent).toBe('Press enter to add new tag');
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

  const onSelectionChangeMock = jest.fn(() => {
    findSourceIdMock();
    setSelectedFilterMock();
  });
  // const onSelectionChangeMock = jest.fn();

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

  test('click opens popup with correct known sources to select from', () => {
    const sourcesSelectorInput = within(sourcesSelector).getByPlaceholderText('Source name');

    userEvent.click(sourcesSelectorInput as HTMLElement);

    // Popup should now appear in the document
    const sourcesSelectorPopup = screen.getByRole('listbox');
    expect(sourcesSelectorPopup).toBeInTheDocument();

    const autocompleteOptions = within(sourcesSelectorPopup).getAllByRole('option');
    expect(autocompleteOptions[0]).toHaveTextContent('testSource1');
    expect(autocompleteOptions[1]).toHaveTextContent('testSource2');
  });

  test('click on popup option correctly selects the option', () => {
    // Placeholder text is the only option to search after
    const sourcesSelectorInput = within(sourcesSelector).getByPlaceholderText('Source name');
    userEvent.click(sourcesSelectorInput);

    // Popup should now appear in the document
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    const firstOption = screen.getByText('testSource1');
    expect(firstOption).toBeInTheDocument();
    const secondOption = screen.getByText('testSource2');
    expect(secondOption).toBeInTheDocument();

    userEvent.click(firstOption); // selects the given option

    // Selected option chip should now appear in the document
    // Check whether selected option displays correctly in the input field
    const selectedOptionChip = within(sourcesSelector).getByRole('button');
    expect(selectedOptionChip).toBeInTheDocument();
    expect(selectedOptionChip).toHaveTextContent('testSource1');
    expect(selectedOptionChip.querySelector('svg'))
      .toBeInTheDocument(); // 'remove'-icon

    // Check whether selected sources list is updated with correct value
    expect(onSelectionChangeMock).toBeCalledWith(["testSource1"]);
    expect(onSelectionChangeMock.mock.calls.length).toBe(1);
    // // Check whether selected source index is returned correctly
    // expect(findSourceIdMock.mock.results[0].value).toBe(0);
  });

  test('click on remove-icon correctly deselects the option', () => {
    sourcesSelector = render(
      <SourceSelector
        sources={[ ...knownSourcesMock.keys() ]} // array of values
        onSelectionChange={onSelectionChangeMock}
        defaultSelected={["testSource1"]}
      />).container;

    // Placeholder text is the only option to search after
    const sourcesSelectorInput = within(sourcesSelector).getByPlaceholderText('Source name');
    expect(sourcesSelectorInput).toBeInTheDocument();

    const selectedOptionChip = within(sourcesSelector).getByRole('button');
    expect(selectedOptionChip).toBeInTheDocument();
    expect(selectedOptionChip).toHaveTextContent('testSource1');

    const removeIcon = selectedOptionChip.querySelector('svg');
    expect(removeIcon).toBeInTheDocument();

    userEvent.click(removeIcon as Element);

    // Selected option chip should now disappear from the document
    expect(selectedOptionChip).not.toBeInTheDocument();
  });
});

describe('Tags Selector functional test suite', () => {
  let tagsSelector: HTMLElement;

  let tagsMock: Tag[] = [
    {key: "tag1", value: "value1", original: "tag1=value1"},
    {key: "tag2", value: "value2", original: "tag2=value2"}
  ];

  let selectedFilterMock: string[];
  const setSelectedFilterMock = jest.fn();
  const onSelectionChangeMock = jest.fn(() => setSelectedFilterMock);

  beforeEach(() => {
    tagsSelector = render(
      <TagSelector
        tags={[]}
        onSelectionChange={onSelectionChangeMock}
        selected={selectedFilterMock}
      />).container;
  });

  afterEach(() => {
    document.body.removeChild(tagsSelector);
    tagsSelector.remove();
    jest.clearAllMocks();
  })

  test('type + enter correctly adds tag to the filter', () => {
    // Placeholder text is the only option to search after
    const tagsSelectorInput = within(tagsSelector).getByPlaceholderText('key=value');

    // Simulate tag addition
    userEvent.type(tagsSelectorInput, 'typedKey=typedValue{enter}');

    // Newly added tag chip should now appear in the document
    // Check whether newly added tag displays correctly in the input field
    const addedTagChip = within(tagsSelector).getByRole('button');
    expect(addedTagChip).toBeInTheDocument();
    expect(addedTagChip).toHaveTextContent('typedKey=typedValue');
    expect(addedTagChip.querySelector('svg'))
      .toBeInTheDocument(); // 'remove'-icon

    // Check whether selected tags list is updated with correct value
    expect(onSelectionChangeMock).toBeCalledWith([
      { key: "typedKey",
        original: "typedKey=typedValue",
        value: "typedValue"
      }]);
    expect(onSelectionChangeMock.mock.calls.length).toBe(1);
  });

  test('click on remove-icon correctly removes the tag',  () => {
    tagsSelector = render(
      <TagSelector
        tags={tagsMock}
        onSelectionChange={onSelectionChangeMock}
        selected={tagsMock.map((tag: Tag) => tag.original)}
      />).container;

    // Placeholder text is the only option to search after
    const tagsSelectorInput = within(tagsSelector).getByPlaceholderText('key=value');
    expect(tagsSelectorInput).toBeInTheDocument();

    const selectedTags = within(tagsSelector).getAllByRole('button');
    expect(selectedTags.length).toBe(2); // tagsMock has size 2

    // Tag 1
    const tag1Chip = selectedTags[0];
    expect(tag1Chip).toBeInTheDocument();
    expect(tag1Chip).toHaveTextContent('tag1=value1');
    const tag1RemoveIcon = tag1Chip.querySelector('svg');
    expect(tag1RemoveIcon).toBeInTheDocument();

    // Tag 2
    const tag2Chip = selectedTags[1];
    expect(tag2Chip).toBeInTheDocument();
    expect(tag2Chip).toHaveTextContent('tag2=value2');
    expect(tag2Chip.querySelector('svg')).toBeInTheDocument(); // remove icon

    // Remove tag 1
    userEvent.click(tag1RemoveIcon as Element);

    // Tag 1 is removed, tag 2 remains
    expect(onSelectionChangeMock).toBeCalledWith([
      { key: "tag2",
        original: "tag2=value2",
        value: "value2"
      }]);
    expect(onSelectionChangeMock.mock.calls.length).toBe(1);
  });
});

