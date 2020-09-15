import React, { useCallback, useEffect, useState } from "react";
import "./IncidentView.css";
import Header from "../../components/header/Header";
import IncidentTable from "../../components/incidenttable/IncidentTable";
import "../../components/incidenttable/incidenttable.css";
import { withRouter } from "react-router-dom";

import Checkbox from "@material-ui/core/Checkbox";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import Grid from "@material-ui/core/Grid";

import Typography from "@material-ui/core/Typography";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

import api, { IncidentMetadata, IncidentsFilterOptions, SourceSystem } from "../../api";
import { useApiIncidents } from "../../api/hooks";

import TagSelector, { Tag } from "../../components/tagselector";
import SourceSelector from "../../components/sourceselector";

import { LOADING_TEXT, ERROR_TEXT, NO_DATA_TEXT } from "../../constants";

type IncidentViewPropsType = {};

const IncidentView: React.FC<IncidentViewPropsType> = ({}: IncidentViewPropsType) => {
  const [realtime, setRealtime] = useState<boolean>(true);
  const [showAcked, setShowAcked] = useState<boolean>(false);
  const [tagsFilter, setTagsFilter] = useState<Tag[]>([]);
  const [sources, setSources] = useState<string[] | "AllSources">("AllSources");
  const [show, setShow] = useState<"open" | "closed" | "both">("open");

  const [knownSources, setKnownSources] = useState<string[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tags, setTags] = useState<Tag[]>([
    { key: "url", value: "https://test.test", original: "url=https://test.test" },
    { key: "host", value: "localhost", original: "host=localhost" },
  ]);

  const [{ result: incidents, isLoading, isError }, setPromise] = useApiIncidents();

  useEffect(() => {
    const showToOpenMap: Record<"open" | "closed" | "both", boolean | undefined> = {
      open: true,
      closed: false,
      both: undefined,
    };

    const filterOptions: IncidentsFilterOptions = {
      open: showToOpenMap[show],

      // The frontend is only conserned if acked incidents should be
      // displayed, not that ONLY acked incidents should be displayed.
      // Only filter on the acked property when
      acked: showAcked === true ? undefined : false,
      tags: tagsFilter.map((tag: Tag) => tag.original),
      sourceSystemNames: sources === "AllSources" ? undefined : sources,
    };
    setPromise(api.getAllIncidentsFiltered(filterOptions));

    // Refresh metadata every time as well.
    api.getAllIncidentsMetadata().then((incidentMetadata: IncidentMetadata) => {
      setKnownSources(incidentMetadata.sourceSystems.map((source: SourceSystem) => source.name));
    });
  }, [setPromise, show, showAcked, tagsFilter, sources]);

  const noDataText = isLoading ? LOADING_TEXT : isError ? ERROR_TEXT : NO_DATA_TEXT;

  const handleShowChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setShow(event.target.value as "open" | "closed" | "both");
  };

  return (
    <div>
      <header>
        <Header />
      </header>
      <h1 className={"filterHeader"}>Incidents</h1>
      <Card>
        <CardContent>
          <Grid container xl direction="row" justify="space-evenly" alignItems="stretch">
            <Grid item md>
              <Typography>Show open/closed</Typography>
              <Select disabled={isLoading} variant="outlined" value={show} onChange={handleShowChange}>
                <MenuItem value={"open"}>Open</MenuItem>
                <MenuItem value={"closed"}>Closed</MenuItem>
                <MenuItem value={"both"}>Both</MenuItem>
              </Select>
            </Grid>

            <Grid item md>
              <Typography>Show acked events</Typography>
              <Checkbox disabled={isLoading} checked={showAcked} onClick={() => setShowAcked((old) => !old)} />
            </Grid>

            <Grid item md>
              <Typography>Realtime</Typography>
              <Checkbox disabled={isLoading} checked={realtime} onClick={() => setRealtime((old) => !old)} />
            </Grid>

            <Grid item md>
              <Typography>Sources to display</Typography>
              <SourceSelector
                disabled={isLoading}
                sources={knownSources}
                onSelectionChange={(selection: string[]) => {
                  setSources((selection.length !== 0 && selection) || "AllSources");
                }}
              />
            </Grid>

            <Grid item md>
              <Typography>Tags filter</Typography>
              <TagSelector
                disabled={isLoading}
                tags={tags}
                onSelectionChange={useCallback((selection: Tag[]) => {
                  console.log("selection changed", selection);
                  setTagsFilter(selection);
                }, [])}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <div className="table">
        <IncidentTable
          isLoading={isLoading}
          realtime={realtime}
          open={show === "open"}
          incidents={incidents || []}
          noDataText={noDataText}
        />
      </div>
    </div>
  );
};

export default withRouter(IncidentView);
