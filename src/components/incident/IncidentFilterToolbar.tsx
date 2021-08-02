import React, { ChangeEvent, useEffect, useState } from "react";

import classNames from "classnames";

// MUI
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

// For filter dialog list
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import AddIcon from "@material-ui/icons/Add";
import ClearIcon from "@material-ui/icons/Clear";
import IconButton from "@material-ui/core/IconButton";
import SaveAltIcon from "@material-ui/icons/SaveAlt";
import SettingsIcon from "@material-ui/icons/Settings";

// Components
import TagSelector from "../../components/tagselector";
import SourceSelector from "../../components/sourceselector";
import FilterDialog from "../../components/filterdialog";
import Modal from "../modal/Modal";

// Api
import type { AutoUpdateMethod, Filter, IncidentMetadata, SeverityLevelNumber, SourceSystem } from "../../api/types.d";
import { SeverityLevelNumberNameMap } from "../../api/consts";
import api from "../../api";

// Config
import { ENABLE_WEBSOCKETS_SUPPORT } from "../../config";

// Utils
import {
  saveToLocalStorage,
  fromLocalStorageOrDefault,
  optionalBoolToKey,
  optionalOr,
  validateStringInput,
} from "../../utils";
import { DROPDOWN_TOOLBAR, TIMEFRAME } from "../../localstorageconsts";

// Contexts/hooks
import { useAlerts } from "../alertsnackbar";
import { useFilters } from "../../api/actions";
import { useSelectedFilter } from "../filterprovider";
import { useApiState, useTimeframe } from "../../state/hooks";
import { DropdownMenu } from "./DropdownMenu";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: theme.palette.background.paper,
      boxSizing: "border-box",
      color: theme.palette.text.primary,
      flexGrow: 1,
      transition: "0.4s",
      zIndex: theme.zIndex.drawer + 1,
      padding: theme.spacing(1),
    },
    medium: {
      flexGrow: 1,
      minWidth: "15%",
    },
    large: { flexGrow: 1, minWidth: "35%" },
    rightAligned: { paddingRight: theme.spacing(1) },
    toolbarContainer: {
      width: "100%",
      display: "flex",
      minWidth: "100%",
      alignItems: "baseline",
      justifyItems: "center",
      flexDirection: "row",
      flexWrap: "wrap",
      padding: 0,
    },
    itemContainer: {
      display: "flex",
      flexFlow: "column wrap",
      margin: theme.spacing(1),
    },
    dropdownContainer: {
      display: "block",
      flexFlow: "column wrap",
      color: theme.palette.getContrastText(theme.palette.primary.dark),
      background: theme.palette.primary.dark,
      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2) inset, 0 6px 20px 0 rgba(0, 0, 0, 0.19) inset",
      width: "auto",
      padding: theme.spacing(2),
      margin: 0,
    },
    moreSettingsItemContainer: {
      alignSelf: "center",
    },
    filterSelectIcon: {
      fontSize: "1rem",
    },
    filterListItem: {
      width: "100%",
      backgroundColor: theme.palette.background.paper,
    },
  }),
);

type ButtonGroupSwitchPropsType<T> = {
  selected: T;
  options: T[];
  getLabel: (option: T) => string;
  getColor: (selected: boolean) => "inherit" | "default" | "primary";
  getTooltip?: (option: T) => string;
  onSelect: (option: T) => void;
  disabled?: boolean;
};

export function ButtonGroupSwitch<T>({
  selected,
  options,
  getLabel,
  getColor,
  getTooltip,
  onSelect,
  disabled,
}: ButtonGroupSwitchPropsType<T>) {
  const tooltipWrap = (key: number, option: T, children: React.ReactElement) =>
    getTooltip === undefined ? (
      children
    ) : (
      <Tooltip key={key} title={getTooltip(option)}>
        {children}
      </Tooltip>
    );
  return (
    <ButtonGroup variant="contained" color="default" aria-label="text primary button group">
      {options.map((option: T, index: number) => {
        return tooltipWrap(
          index,
          option,
          <Button
            disabled={disabled}
            key={index}
            color={getColor(selected === option)}
            onClick={() => onSelect(option)}
          >
            {getLabel(option)}
          </Button>,
        );
      })}
    </ButtonGroup>
  );
}

type ToolbarItemPropsType = {
  name: string;
  children: React.ReactNode;
  className?: string;
  title: string;
};

export const ToolbarItem: React.FC<ToolbarItemPropsType> = ({
  name,
  children,
  className,
  title,
}: ToolbarItemPropsType) => {
  const style = useStyles();
  return (
    <div title={title} className={classNames(style.itemContainer, className)}>
      <Typography>{name}</Typography>
      {children}
    </div>
  );
};

type DropdownToolbarPropsType = {
  open: boolean;
  onClose: () => void;

  children: React.ReactNode;
  className?: string;
};

export const DropdownToolbar: React.FC<DropdownToolbarPropsType> = ({
  open,
  children,
  className,
}: DropdownToolbarPropsType) => {
  const style = useStyles();

  if (!open) return null;

  return (
    <div id="more-settings-dropdown" className={classNames(style.dropdownContainer, className)}>
      <Toolbar className={style.toolbarContainer}>{children}</Toolbar>
    </div>
  );
};

type FiltersDropdownToolbarItemPropsType = {
  className?: string;
};

export const FiltersDropdownToolbarItem = ({ className }: FiltersDropdownToolbarItemPropsType) => {
  const style = useStyles();
  const [selectedFilter, { setExistingFilter, unsetExistingFilter }] = useSelectedFilter();

  const [filters, { createFilter, modifyFilter }] = useFilters();
  const displayAlert = useAlerts();

  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [saveToDialogOpen, setSaveToDialogOpen] = useState<boolean>(false);
  const [newFilterName, setNewFilterName] = useState<string>("");
  const [newFilterError, setNewFilterError] = useState<boolean>(false);
  const [saveToFilter, setSaveToFilter] = useState<Filter | undefined>(undefined);

  useEffect(() => {
    // before create dialog unmount
    return () => {
      setNewFilterError(false);
      setNewFilterName("");
    }
  }, [createDialogOpen])

  const onCreateFilterClick = () => {
    setCreateDialogOpen(true);
  };

  const onSaveToFilterClick = () => {
    setSaveToDialogOpen(true);
  };

  const onCreateFilter = () => {
    if (validateStringInput(newFilterName)) {
      const newFilter: Omit<Filter, "pk"> = {
        ...selectedFilter.incidentsFilter,
        name: newFilterName,
      };
      createFilter(newFilter)
        .then((filter: Filter) => {
          setExistingFilter(filter);
          setCreateDialogOpen(false);
          displayAlert(`Created filter: ${filter.pk}`, "success");
        })
        .catch((error) => displayAlert(`Failed to create filter: ${error}`, "error"));
    } else {
      setNewFilterError(true);
    }
  };

  const onUpdateFilter = () => {
    if (!saveToFilter) return;
    const { pk, name } = saveToFilter;
    const filter = selectedFilter.incidentsFilter;
    const modified: Filter = {
      ...filter,
      pk,
      name,
    };
    modifyFilter(modified)
      .then(() => {
        setExistingFilter(modified);
        setSaveToDialogOpen(false);
        displayAlert("Updated filter", "success");
      })
      .catch((error) => displayAlert(`Failed to update filter: ${error}`, "error"));
  };

  return (
    <>
      <FormControl size="small" className={className}>
        <Select
          displayEmpty
          variant="outlined"
          labelId="filter-select"
          id="filter-select"
          value={selectedFilter?.existingFilter?.pk || ""}
          onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
            const pk: number | "" = event.target.value as number | "";
            if (pk === "") {
              unsetExistingFilter();
            } else {
              const filter: Filter | undefined = filters.find((filter: Filter) => filter.pk === pk);
              if (filter) setExistingFilter(filter);
            }
          }}
          IconComponent={() => (
            <>
              {(!selectedFilter.existingFilter && (
                <Tooltip title="Create filter">
                  <IconButton onClick={onCreateFilterClick}>
                    <AddIcon className={style.filterSelectIcon} fontSize="small" />
                  </IconButton>
                </Tooltip>
              )) || (
                <Tooltip title="Unselect filter">
                  <IconButton onClick={() => unsetExistingFilter()}>
                    <ClearIcon className={style.filterSelectIcon} fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Save to filter">
                <IconButton onClick={onSaveToFilterClick}>
                  <SaveAltIcon className={style.filterSelectIcon} fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Manage filters">
                <IconButton onClick={() => setEditDialogOpen(true)}>
                  <SettingsIcon className={style.filterSelectIcon} fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        >
          {filters.map((filter: Filter) => (
            <MenuItem key={filter.pk} value={filter.pk}>
              {filter.name}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>Select from your filters</FormHelperText>
      </FormControl>
      <FilterDialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} />
      <Modal
        title="Create saved filter from current filter"
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        content={
          <TextField
            required
            autoFocus
            error={newFilterError}
            helperText={newFilterError ? "Filter name is required" : null}
            value={newFilterName}
            onChange={(event) => setNewFilterName(event.target.value)}
            label="Filter name"
            placeholder="Open incidents on machine1"
          />
        }
        actions={
          <Button onClick={onCreateFilter} color="primary">
            Create
          </Button>
        }
      />
      <Modal
        title="Save to"
        open={saveToDialogOpen}
        onClose={() => setSaveToDialogOpen(false)}
        content={
          <List component="nav" className={style.filterListItem}>
            {filters.map((filter: Filter) => (
              <ListItem
                button
                selected={saveToFilter?.pk === filter.pk}
                onClick={() => setSaveToFilter(filter)}
                key={filter.pk}
              >
                <ListItemText>{filter.name}</ListItemText>
              </ListItem>
            ))}
          </List>
        }
        actions={
          <Button disabled={!saveToFilter} onClick={() => onUpdateFilter()} color="primary">
            Save to
          </Button>
        }
      />
    </>
  );
};

type MoreSettingsToolbarItemPropsType = {
  open: boolean;
  onChange: (open: boolean) => void;
  className?: string;
};

export const MoreSettingsToolbarItem: React.FC<MoreSettingsToolbarItemPropsType> = ({
  open,
  onChange,
  className,
}: MoreSettingsToolbarItemPropsType) => {
  const style = useStyles();

  return (
    <div className={classNames(style.moreSettingsItemContainer, className)}>
      <Tooltip title="Additional settings">
        <IconButton
          color={(!open && "primary") || undefined}
          aria-label="more-filter-settings-toggle"
          onClick={() => onChange(!open)}
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>
    </div>
  );
};

type IncidentFilterToolbarPropsType = {
  disabled?: boolean;
};

export const IncidentFilterToolbar: React.FC<IncidentFilterToolbarPropsType> = ({
  disabled,
}: IncidentFilterToolbarPropsType) => {
  const style = useStyles();
  const [selectedFilter, { setSelectedFilter }] = useSelectedFilter();
  const [{ autoUpdateMethod }, { setAutoUpdateMethod }] = useApiState();

  const [dropdownToolbarOpen, setDropdownToolbarOpen] = useState<boolean>(
    // Load from localstorage if possible
    fromLocalStorageOrDefault(DROPDOWN_TOOLBAR, false, (value: boolean) => value || !value),
  );

  useEffect(() => {
    // Save state so that refresh will result in open state if already opened.
    saveToLocalStorage(DROPDOWN_TOOLBAR, dropdownToolbarOpen);
  }, [dropdownToolbarOpen]);

  const SEVERITY_LEVELS: SeverityLevelNumber[] = [1, 2, 3, 4, 5];

  // Values and text for the timeframe selector (values are timeframe length in hours)
  const TIMEFRAME_VALUES = [0, 1, 3, 12, 24, 168, 720];
  const TIMEFRAME_TEXT = [
    "No timeframe",
    "Last 60 minutes",
    "Last 3 hours",
    "Last 12 hours",
    "Last 24 hours",
    "Last 7 days",
    "Last 30 days",
  ];

  const [knownSources, setKnownSources] = useState<string[]>([]);
  const [sourceIdByName, setSourceIdByName] = useState<{ [name: string]: number }>({});
  const [sourceNameById, setSourceNameById] = useState<{ [id: number]: string }>({});
  const [timeframe, { setTimeframe }] = useTimeframe();

  useEffect(() => {
    // Save current timeframe in localStorage
    saveToLocalStorage(TIMEFRAME, timeframe.timeframeInHours);
  }, [timeframe]);

  useEffect(() => {
    // TODO: This could be stored in the global state as well,
    // because it is useful other places, but it's unnecessary to update
    // all the time.
    api.getAllIncidentsMetadata().then((incidentMetadata: IncidentMetadata) => {
      setKnownSources(incidentMetadata.sourceSystems.map((source: SourceSystem) => source.name));
      const sourceIdByName: { [name: string]: number } = {};
      incidentMetadata.sourceSystems.forEach((source: SourceSystem) => (sourceIdByName[source.name] = source.pk));
      setSourceIdByName(sourceIdByName);

      const sourceNameById: { [id: number]: string } = {};
      incidentMetadata.sourceSystems.forEach((source: SourceSystem) => (sourceNameById[source.pk] = source.name));
      setSourceNameById(sourceNameById);
    });
  }, []);

  const autoUpdateOptions: AutoUpdateMethod[] = ENABLE_WEBSOCKETS_SUPPORT
    ? ["never", "realtime", "interval"]
    : ["never", "interval"];

  const useExistingFilter = false;

  const autoUpdateToolbarItem = (
    <ToolbarItem title="Auto update switch" name="Auto Update">
      <ButtonGroupSwitch
        disabled={useExistingFilter}
        selected={autoUpdateMethod}
        options={autoUpdateOptions}
        getLabel={(autoUpdate: AutoUpdateMethod) =>
          ({ never: "Never", realtime: "Realtime", interval: "Interval" }[autoUpdate])
        }
        getTooltip={(autoUpdate: AutoUpdateMethod) =>
          ({ never: "Never update", realtime: "Update in realtime", interval: "Update on a predefined interval" }[
            autoUpdate
          ])
        }
        getColor={(selected: boolean) => (selected ? "primary" : "default")}
        onSelect={(autoUpdate: AutoUpdateMethod) =>
          (autoUpdate === "realtime" ? ENABLE_WEBSOCKETS_SUPPORT : true) && setAutoUpdateMethod(autoUpdate)
        }
      />
    </ToolbarItem>
  );

  return (
    <div className={style.root} data-testid="incidents-toolbar">
      <Toolbar className={style.toolbarContainer}>
        <ToolbarItem title="Open state switch" name="Open State">
          <ButtonGroupSwitch
            selected={optionalOr(selectedFilter?.incidentsFilter?.filter?.open, null)}
            options={[true, false, null]}
            getLabel={(open: boolean | null) =>
              ({ true: "Open", false: "Closed", null: "Both" }[optionalBoolToKey(open)])
            }
            getColor={(selected: boolean) => (selected ? "primary" : "default")}
            getTooltip={(option: boolean | null) =>
              ({
                true: "Only open incidents",
                false: "Only closed incidents",
                null: "Both open and closed incidents ",
              }[optionalBoolToKey(option)])
            }
            onSelect={(open: boolean | null) => setSelectedFilter({ filterContent: { open } })}
          />
        </ToolbarItem>

        <ToolbarItem title="Acked state switch" name="Acked">
          <ButtonGroupSwitch
            selected={optionalOr(selectedFilter?.incidentsFilter?.filter?.acked, null)}
            options={[true, false, null]}
            getLabel={(open: boolean | null) =>
              ({ true: "Acked", false: "Unacked", null: "Both" }[optionalBoolToKey(open)])
            }
            getColor={(selected: boolean | null) => (selected ? "primary" : "default")}
            getTooltip={(option: boolean | null) =>
              ({
                true: "Only acked incidents",
                false: "Only unacked incidents",
                null: "Both acked and unacked incidents ",
              }[optionalBoolToKey(option)])
            }
            onSelect={(acked?: boolean | null) => setSelectedFilter({ filterContent: { acked } })}
          />
        </ToolbarItem>

        <ToolbarItem title="Source selector" name="Sources" className={classNames(style.medium)}>
          <SourceSelector
            disabled={disabled}
            sources={knownSources}
            onSelectionChange={(sources: string[]) => {
              const findSourceId = (name: string) => {
                return sourceIdByName[name];
              };
              setSelectedFilter({ sourceSystemIds: sources.map(findSourceId) });
            }}
            defaultSelected={(selectedFilter.incidentsFilter?.sourceSystemIds || []).map(
              (source: number) => sourceNameById[source],
            )}
          />
        </ToolbarItem>

        <ToolbarItem title="Tags selector" name="Tags" className={classNames(style.medium)}>
          <TagSelector
            disabled={disabled}
            tags={selectedFilter.incidentsFilter?.tags || []}
            onSelectionChange={(tags: string[]) => setSelectedFilter({ tags })}
            selected={selectedFilter.incidentsFilter?.tags}
          />
        </ToolbarItem>

        <ToolbarItem title="Max severity level selector" name="Max level" className={classNames(style.medium)}>
          <DropdownMenu
            selected={optionalOr(selectedFilter?.incidentsFilter?.filter?.maxlevel, 5)}
            onChange={(maxlevel: SeverityLevelNumber) => setSelectedFilter({ filterContent: { maxlevel } })}
          >
            {SEVERITY_LEVELS.reverse().map((level: SeverityLevelNumber) => (
              <MenuItem key={level} value={level}>{`${level} - ${SeverityLevelNumberNameMap[level]}`}</MenuItem>
            ))}
          </DropdownMenu>
        </ToolbarItem>

        <ToolbarItem title="Filter selector" name="Filter" className={classNames(style.medium)}>
          <FiltersDropdownToolbarItem />
        </ToolbarItem>
        <MoreSettingsToolbarItem
          open={dropdownToolbarOpen}
          onChange={(open: boolean) => setDropdownToolbarOpen(open)}
        />
      </Toolbar>
      <DropdownToolbar open={dropdownToolbarOpen} onClose={() => setDropdownToolbarOpen(false)}>
        {autoUpdateToolbarItem}
        <ToolbarItem title="Timeframe selector" name="Timeframe">
          <DropdownMenu selected={timeframe.timeframeInHours} onChange={(value: number) => setTimeframe(value)}>
            {TIMEFRAME_VALUES.map((value: number, index: number) => (
              <MenuItem key={value} value={value}>
                {TIMEFRAME_TEXT[index]}
              </MenuItem>
            ))}
          </DropdownMenu>
        </ToolbarItem>
      </DropdownToolbar>
    </div>
  );
};
