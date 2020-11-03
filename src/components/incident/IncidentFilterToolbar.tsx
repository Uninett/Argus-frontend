import React, { useEffect, useState, useCallback } from "react";

import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Checkbox from "@material-ui/core/Checkbox";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

import { ENABLE_WEBSOCKETS_SUPPORT } from "../../config";

import { IncidentsFilter } from "../../components/incidenttable/FilteredIncidentTable";

import TagSelector, { Tag } from "../../components/tagselector";
import SourceSelector from "../../components/sourceselector";

import api, { IncidentMetadata, SourceSystem } from "../../api";

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

  const onTagsChanged = (tags: Tag[]) => {
    onFilterChange({ ...filter, tags });
  };

  return (
    <Card>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          Incidents filter
        </Typography>
        <Grid container xl direction="row" justify="space-evenly" spacing={4}>
          <Grid item container sm={5} direction="row">
            <Grid item sm>
              <Typography>State</Typography>

              <ButtonGroup variant="contained" color="default" aria-label="text primary button group">
                <Button color={filter.show === "open" ? "primary" : undefined} onClick={() => onShowChange("open")}>
                  Open
                </Button>
                <Button color={filter.show === "closed" ? "primary" : undefined} onClick={() => onShowChange("closed")}>
                  Closed
                </Button>
                <Button color={filter.show === "both" ? "primary" : undefined} onClick={() => onShowChange("both")}>
                  Both
                </Button>
              </ButtonGroup>
            </Grid>

            <Grid item sm>
              <Typography>Acked</Typography>
              <ButtonGroup variant="contained" color="default" aria-label="text primary button group">
                <Button color={!filter.showAcked ? "primary" : undefined} onClick={() => onShowAchedChange(false)}>
                  Only unacked
                </Button>
                <Button color={filter.showAcked ? "primary" : undefined} onClick={() => onShowAchedChange(true)}>
                  All
                </Button>
              </ButtonGroup>
            </Grid>
          </Grid>

          {ENABLE_WEBSOCKETS_SUPPORT && (
            <Grid item md>
              <Typography>Realtime</Typography>
              <Checkbox
                disabled={disabled}
                checked={filter.realtime}
                onClick={() => onRealtimeChange(!filter.realtime)}
              />
            </Grid>
          )}

          <Grid item container md direction="row" spacing={4}>
            <Grid item md>
              <Typography>Sources to display</Typography>
              <SourceSelector
                disabled={disabled}
                sources={knownSources}
                onSelectionChange={(selection: string[]) => {
                  onSourcesChange((selection.length !== 0 && selection) || "AllSources");
                }}
                defaultSelected={filter.sources === "AllSources" ? [] : filter.sources || []}
              />
            </Grid>

            <Grid item md>
              <Typography>Tags filter</Typography>
              <TagSelector
                disabled={disabled}
                tags={filter.tags}
                onSelectionChange={useCallback((selection: Tag[]) => {
                  onTagsChanged(selection);
                }, [])}
              />
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
