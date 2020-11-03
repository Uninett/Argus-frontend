import React, { useCallback, useEffect, useState } from "react";
import "./IncidentView.css";
import Header from "../../components/header/Header";
import FilteredIncidentTable from "../../components/incidenttable/FilteredIncidentTable";
import "../../components/incidenttable/incidenttable.css";
import { withRouter } from "react-router-dom";

import Checkbox from "@material-ui/core/Checkbox";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import Grid from "@material-ui/core/Grid";

import Typography from "@material-ui/core/Typography";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

import api, { IncidentMetadata, SourceSystem } from "../../api";

import TagSelector, { Tag } from "../../components/tagselector";
import SourceSelector from "../../components/sourceselector";

import { ENABLE_WEBSOCKETS_SUPPORT } from "../../config";

type IncidentViewPropsType = {};

const IncidentView: React.FC<IncidentViewPropsType> = ({}: IncidentViewPropsType) => {
  const [realtime, setRealtime] = useState<boolean>(ENABLE_WEBSOCKETS_SUPPORT);
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

  useEffect(() => {
    api.getAllIncidentsMetadata().then((incidentMetadata: IncidentMetadata) => {
      setKnownSources(incidentMetadata.sourceSystems.map((source: SourceSystem) => source.name));
    });
  }, []);

  const handleShowChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setShow(event.target.value as "open" | "closed" | "both");
  };

  const disabled = false;

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
              <Select disabled={disabled} variant="outlined" value={show} onChange={handleShowChange}>
                <MenuItem value={"open"}>Open</MenuItem>
                <MenuItem value={"closed"}>Closed</MenuItem>
                <MenuItem value={"both"}>Both</MenuItem>
              </Select>
            </Grid>

            <Grid item md>
              <Typography>Show acked events</Typography>
              <Checkbox disabled={disabled} checked={showAcked} onClick={() => setShowAcked((old) => !old)} />
            </Grid>

            {ENABLE_WEBSOCKETS_SUPPORT && (
              <Grid item md>
                <Typography>Realtime</Typography>
                <Checkbox disabled={disabled} checked={realtime} onClick={() => setRealtime((old) => !old)} />
              </Grid>
            )}

            <Grid item md>
              <Typography>Sources to display</Typography>
              <SourceSelector
                disabled={disabled}
                sources={knownSources}
                onSelectionChange={(selection: string[]) => {
                  setSources((selection.length !== 0 && selection) || "AllSources");
                }}
              />
            </Grid>

            <Grid item md>
              <Typography>Tags filter</Typography>
              <TagSelector
                disabled={disabled}
                tags={tags}
                onSelectionChange={useCallback((selection: Tag[]) => {
                  setTagsFilter(selection);
                }, [])}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <FilteredIncidentTable filter={{ tags: tagsFilter, sources, show, showAcked, realtime }} />
    </div>
  );
};

export default withRouter(IncidentView);
