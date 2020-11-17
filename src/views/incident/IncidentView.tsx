import React, { useCallback, useEffect, useState } from "react";
import "./IncidentView.css";
import Header from "../../components/header/Header";
import FilteredIncidentTable from "../../components/incidenttable/FilteredIncidentTable";
import "../../components/incidenttable/incidenttable.css";
import { withRouter } from "react-router-dom";

import Checkbox from "@material-ui/core/Checkbox";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

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

  // const handleShowChange = (event: React.ChangeEvent<{ value: unknown }>) => {
  //   setShow(event.target.value as "open" | "closed" | "both");
  // };
  const disabled = false;

  return (
    <div>
      <header>
        <Header />
      </header>
      <h1 className={"filterHeader"}>Incidents</h1>
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
                  <Button color={show === "open" ? "primary" : undefined} onClick={() => setShow("open")}>
                    Open
                  </Button>
                  <Button color={show === "closed" ? "primary" : undefined} onClick={() => setShow("closed")}>
                    Closed
                  </Button>
                  <Button color={show === "both" ? "primary" : undefined} onClick={() => setShow("both")}>
                    Both
                  </Button>
                </ButtonGroup>
              </Grid>

              <Grid item sm>
                <Typography>Acked</Typography>
                <ButtonGroup variant="contained" color="default" aria-label="text primary button group">
                  <Button color={!showAcked ? "primary" : undefined} onClick={() => setShowAcked(false)}>
                    Only unacked
                  </Button>
                  <Button color={showAcked ? "primary" : undefined} onClick={() => setShowAcked(true)}>
                    All
                  </Button>
                </ButtonGroup>
              </Grid>
            </Grid>

            {ENABLE_WEBSOCKETS_SUPPORT && (
              <Grid item md>
                <Typography>Realtime</Typography>
                <Checkbox disabled={disabled} checked={realtime} onClick={() => setRealtime((old) => !old)} />
              </Grid>
            )}

            <Grid item container md direction="row" spacing={4}>
              <Grid item md>
                <Typography>Sources to display</Typography>
                <SourceSelector
                  disabled={disabled}
                  sources={knownSources}
                  onSelectionChange={(selection: string[]) => {
                    setSources((selection.length !== 0 && selection) || "AllSources");
                  }}
                  defaultSelected={sources === "AllSources" ? [] : sources}
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
          </Grid>
        </CardContent>
      </Card>
      <FilteredIncidentTable
        filter={{ tags: tagsFilter, sources, sourcesById: undefined, show, showAcked, realtime }}
      />
    </div>
  );
};

export default withRouter(IncidentView);
