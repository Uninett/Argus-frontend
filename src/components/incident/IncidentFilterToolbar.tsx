import React, { useEffect, useState } from "react";

import Button, { ButtonProps } from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

// For filter dialog list
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import SaveAltIcon from "@material-ui/icons/SaveAlt";
import SettingsIcon from "@material-ui/icons/Settings";

import { makeConfirmationButton } from "../../components/buttons/ConfirmationButton";

import Modal from "../modal/Modal";

import { ENABLE_WEBSOCKETS_SUPPORT } from "../../config";

import { IncidentsFilter, AutoUpdate } from "../../components/incidenttable/FilteredIncidentTable";

import TagSelector, { Tag } from "../../components/tagselector";
import SourceSelector from "../../components/sourceselector";

import api, { Filter, IncidentMetadata, SourceSystem } from "../../api";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import classNames from "classnames";

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
    filtersDialog: {},
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
  const tooltipWrap = (option: T, children: React.ReactElement) =>
    getTooltip === undefined ? children : <Tooltip title={getTooltip(option)}>{children}</Tooltip>;
  return (
    <ButtonGroup variant="contained" color="default" aria-label="text primary button group">
      {options.map((option: T, index: number) => {
        return tooltipWrap(
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
};

export const ToolbarItem: React.FC<ToolbarItemPropsType> = ({ name, children, className }: ToolbarItemPropsType) => {
  const style = useStyles();
  return (
    <div className={classNames(style.itemContainer, className)}>
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
    <div className={classNames(style.dropdownContainer, className)}>
      <Toolbar className={style.toolbarContainer}>{children}</Toolbar>
    </div>
  );
};

type UseExistingFilterToolbarItemPropsType = {
  selectedFilter: number;
  existingFilters: Filter[];
  onSelect: (filterIndex: number) => void;
  className?: string;
};

export const UseExistingFilterToolbarItem: React.FC<UseExistingFilterToolbarItemPropsType> = ({
  selectedFilter,
  existingFilters,
  onSelect,
  className,
}: UseExistingFilterToolbarItemPropsType) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const style = useStyles();

  const DeleteButton = (props: ButtonProps) => {
    return (
      <IconButton onClick={props.onClick}>
        <DeleteIcon />
      </IconButton>
    );
  };

  const ConfirmDeleteButton = makeConfirmationButton({
    title: "Delete filter",
    question: "Are you sure you want to delete this filter?",
    ButtonComponent: DeleteButton,
  });

  return (
    <>
      <FormControl size="small" className={className}>
        <Select
          displayEmpty
          variant="outlined"
          labelId="filter-select"
          id="filter-select"
          value={selectedFilter}
          onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
            onSelect(event.target.value as number);
          }}
          IconComponent={() => (
            <>
              {selectedFilter === -1 ? (
                <IconButton onClick={() => alert("save as")}>
                  <AddIcon />
                </IconButton>
              ) : (
                <IconButton onClick={() => alert("update as")}>
                  <SaveAltIcon />
                </IconButton>
              )}
              <IconButton onClick={() => setDialogOpen(true)}>
                <SettingsIcon />
              </IconButton>
            </>
          )}
        >
          <MenuItem key="none" value={-1}>
            None
          </MenuItem>
          {existingFilters.map((filter: Filter, index: number) => (
            <MenuItem key={filter.pk} value={index}>
              {filter.name}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>Select from your filters</FormHelperText>
      </FormControl>
      <Modal
        className={style.filtersDialog}
        title="Filters"
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        content={
          <List>
            {existingFilters.map((filter: Filter) => {
              return (
                <ListItem key={filter.name}>
                  <ListItemText>{filter.name}</ListItemText>
                  <ConfirmDeleteButton
                    onConfirm={() => {
                      alert(`confirmed removing filter: ${filter.name}`);
                    }}
                    onReject={() => {
                      alert(`rejected removing filter: ${filter.name}`);
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
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
  existingFilter: number;
  existingFilters: Filter[];
  filter: IncidentsFilter;
  onExistingFilterChange: (filterIndex: number) => void;
  onFilterChange: (filter: IncidentsFilter) => void;
  disabled?: boolean;
};

export const IncidentFilterToolbar: React.FC<IncidentFilterToolbarPropsType> = ({
  existingFilter,
  existingFilters,
  filter,
  onExistingFilterChange,
  onFilterChange,
  disabled,
}: IncidentFilterToolbarPropsType) => {
  const style = useStyles();
  const [dropdownToolbarOpen, setDropdownToolbarOpen] = useState<boolean>(false);

  const [knownSources, setKnownSources] = useState<string[]>([]);

  useEffect(() => {
    api.getAllIncidentsMetadata().then((incidentMetadata: IncidentMetadata) => {
      setKnownSources(incidentMetadata.sourceSystems.map((source: SourceSystem) => source.name));
    });
  }, []);

  const onShowChange = (show: "open" | "closed" | "both") => {
    if (show !== filter.show) onFilterChange({ ...filter, show });
  };

  const onShowAchedChange = (showAcked: boolean) => {
    if (showAcked !== filter.showAcked) onFilterChange({ ...filter, showAcked });
  };

  const onAutoUpdateChange = (autoUpdate: AutoUpdate) => {
    if (autoUpdate !== filter.autoUpdate) onFilterChange({ ...filter, autoUpdate });
  };

  const onSourcesChange = (sources: string[] | "AllSources" | undefined) => {
    if (sources !== filter.sources) onFilterChange({ ...filter, sources });
  };

  const autoUpdateOptions: AutoUpdate[] = ENABLE_WEBSOCKETS_SUPPORT
    ? ["never", "realtime", "interval"]
    : ["never", "interval"];

  const useExistingFilter =
    existingFilter !== -1 && existingFilter >= 0 && existingFilter < existingFilters.length ? true : false;

  const autoUpdateToolbarItem = (
    <ToolbarItem name="Auto Update">
      <ButtonGroupSwitch
        disabled={useExistingFilter}
        selected={filter.autoUpdate}
        options={autoUpdateOptions}
        getLabel={(autoUpdate: AutoUpdate) =>
          ({ never: "Never", realtime: "Realtime", interval: "Interval" }[autoUpdate])
        }
        getTooltip={(autoUpdate: AutoUpdate) =>
          ({ never: "Never update", realtime: "Update in realtime", interval: "Update on a predefined interval" }[
            autoUpdate
          ])
        }
        getColor={(selected: boolean) => (selected ? "primary" : "default")}
        onSelect={(autoUpdate: AutoUpdate) =>
          (autoUpdate === "realtime" ? ENABLE_WEBSOCKETS_SUPPORT : true) && onAutoUpdateChange(autoUpdate)
        }
      />
    </ToolbarItem>
  );

  const handleTagSelectionChange = (selection: Tag[]) => {
    // compare the arrays deeply
    if (JSON.stringify(selection) !== JSON.stringify(filter.tags)) {
      onFilterChange({ ...filter, tags: selection });
    }
  };

  return (
    <div className={style.root}>
      <Toolbar className={style.toolbarContainer}>
        <ToolbarItem name="Open State">
          <ButtonGroupSwitch
            disabled={useExistingFilter}
            selected={useExistingFilter ? "open" : filter.show}
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
            onSelect={(show: "open" | "closed" | "both") => onShowChange(show)}
          />
        </ToolbarItem>

        <ToolbarItem name="Acked">
          <ButtonGroupSwitch
            disabled={useExistingFilter}
            selected={useExistingFilter ? true : filter.showAcked}
            options={[false, true]}
            getLabel={(showAcked: boolean) => (showAcked ? "Both" : "Unacked")}
            getColor={(selected: boolean) => (selected ? "primary" : "default")}
            getTooltip={(showAcked: boolean) => (showAcked ? "Unacked and acked incidents" : "Only unacked incidents")}
            onSelect={(showAcked: boolean) => onShowAchedChange(showAcked)}
          />
        </ToolbarItem>

        <ToolbarItem name="Sources" className={classNames(style.medium)}>
          <SourceSelector
            disabled={disabled || useExistingFilter}
            sources={knownSources}
            onSelectionChange={(selection: string[]) => {
              onSourcesChange((selection.length !== 0 && selection) || "AllSources");
            }}
            defaultSelected={filter.sources === "AllSources" ? [] : filter.sources || []}
          />
        </ToolbarItem>

        <ToolbarItem name="Tags" className={classNames(style.medium)}>
          <TagSelector
            disabled={disabled || useExistingFilter}
            tags={filter.tags}
            onSelectionChange={handleTagSelectionChange}
          />
        </ToolbarItem>
        <ToolbarItem name="Filter" className={classNames(style.medium)}>
          <UseExistingFilterToolbarItem
            selectedFilter={existingFilter}
            existingFilters={existingFilters}
            onSelect={(filterIndex: number) => onExistingFilterChange(filterIndex)}
          />
        </ToolbarItem>
        <MoreSettingsToolbarItem
          open={dropdownToolbarOpen}
          onChange={(open: boolean) => setDropdownToolbarOpen(open)}
        />
      </Toolbar>
      <DropdownToolbar open={dropdownToolbarOpen} onClose={() => setDropdownToolbarOpen(false)}>
        {autoUpdateToolbarItem}
      </DropdownToolbar>
    </div>
  );
};
