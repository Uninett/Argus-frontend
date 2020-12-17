import React, { useEffect, useState } from "react";

import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Checkbox from "@material-ui/core/Checkbox";
import Typography from "@material-ui/core/Typography";
import Toolbar from "@material-ui/core/Toolbar";

import { ENABLE_WEBSOCKETS_SUPPORT } from "../../config";

import { IncidentsFilter } from "../../components/incidenttable/FilteredIncidentTable";

import TagSelector, { Tag } from "../../components/tagselector";
import SourceSelector from "../../components/sourceselector";

import api, { IncidentMetadata, SourceSystem } from "../../api";

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
  }),
);

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

type IncidentFilterToolbarPropsType = {
  filter: IncidentsFilter;
  onFilterChange: (filter: IncidentsFilter) => void;
  disabled?: boolean;
};

export const IncidentFilterToolbar: React.FC<IncidentFilterToolbarPropsType> = ({
  filter,
  onFilterChange,
  disabled,
}: IncidentFilterToolbarPropsType) => {
  const style = useStyles();
  const [knownSources, setKnownSources] = useState<string[]>([]);

  useEffect(() => {
    api.getAllIncidentsMetadata().then((incidentMetadata: IncidentMetadata) => {
      setKnownSources(incidentMetadata.sourceSystems.map((source: SourceSystem) => source.name));
    });
  }, []);

  const onShowChange = (show: "open" | "closed" | "both") => {
    onFilterChange({ ...filter, show });
  };

  const onShowAchedChange = (showAcked: boolean) => {
    onFilterChange({ ...filter, showAcked });
  };

  const onRealtimeChange = (realtime: boolean) => {
    onFilterChange({ ...filter, realtime });
  };

  const onSourcesChange = (sources: string[] | "AllSources" | undefined) => {
    onFilterChange({ ...filter, sources });
  };

  const filterStyle = (show: "open" | "closed" | "both") => {
    return filter.show === show ? "primary" : undefined;
  };

  const ackedStyle = (acked: boolean) => {
    return filter.showAcked === acked ? "primary" : undefined;
  };

  return (
    <div className={style.root}>
      <Toolbar className={style.toolbarContainer}>
        <ToolbarItem name="State">
          <ButtonGroup variant="contained" color="default" aria-label="text primary button group">
            <Button color={filterStyle("open")} onClick={() => onShowChange("open")}>
              Open
            </Button>
            <Button color={filterStyle("closed")} onClick={() => onShowChange("closed")}>
              Closed
            </Button>
            <Button color={filterStyle("both")} onClick={() => onShowChange("both")}>
              Both
            </Button>
          </ButtonGroup>
        </ToolbarItem>

        <ToolbarItem name="Acked">
          <ButtonGroup variant="contained" color="default" aria-label="text primary button group">
            <Button color={ackedStyle(false)} onClick={() => onShowAchedChange(false)}>
              Only unacked
            </Button>
            <Button color={ackedStyle(true)} onClick={() => onShowAchedChange(true)}>
              All
            </Button>
          </ButtonGroup>
        </ToolbarItem>

        {ENABLE_WEBSOCKETS_SUPPORT && (
          <ToolbarItem name="Realtime">
            <Checkbox
              disabled={disabled}
              checked={filter.realtime}
              onClick={() => onRealtimeChange(!filter.realtime)}
            />
          </ToolbarItem>
        )}

        <ToolbarItem name="Sources" className={classNames(style.medium)}>
          <SourceSelector
            disabled={disabled}
            sources={knownSources}
            onSelectionChange={(selection: string[]) => {
              onSourcesChange((selection.length !== 0 && selection) || "AllSources");
            }}
            defaultSelected={filter.sources === "AllSources" ? [] : filter.sources || []}
          />
        </ToolbarItem>

        <ToolbarItem name="Tags" className={classNames(style.large, style.rightAligned)}>
          <TagSelector
            disabled={disabled}
            tags={filter.tags}
            onSelectionChange={(selection: Tag[]) =>
              selection.length !== 0 && selection && onFilterChange({ ...filter, tags: selection })
            }
          />
        </ToolbarItem>
      </Toolbar>
    </div>
  );
};
