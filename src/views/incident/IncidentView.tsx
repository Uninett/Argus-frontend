import React, { useCallback, useEffect, useMemo, useState } from "react";
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

import api, { Incident } from "../../api";
import { useApiIncidents } from "../../api/hooks";
import { removeUndefined, groupBy } from "../../utils";

import TagSelector, { Tag } from "../../components/tagselector";
import SourceSelector from "../../components/sourceselector";

import { LOADING_TEXT, ERROR_TEXT, NO_DATA_TEXT } from "../../constants";

type IncidentViewPropsType = {};

const IncidentView: React.FC<IncidentViewPropsType> = ({}: IncidentViewPropsType) => {
  const [realtime, setRealtime] = useState<boolean>(true);
  const [showAcked, setShowAcked] = useState<boolean>(false);
  const [tagsFilter, setTagsFilter] = useState<Tag[]>([]);
  const [sources, setSources] = useState<Set<string> | "AllSources">("AllSources");
  const [show, setShow] = useState<"open" | "closed" | "both">("open");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tags, setTags] = useState<Tag[]>([
    { key: "url", value: "https://test.test", original: "url=https://test.test" },
    { key: "host", value: "localhost", original: "host=localhost" },
  ]);

  const [{ result: incidents, isLoading, isError }, setPromise] = useApiIncidents();

  useEffect(() => {
    if (show === "open") {
      if (showAcked) setPromise(api.getOpenIncidents());
      else setPromise(api.getOpenUnAckedIncidents());
    } else setPromise(api.getAllIncidents());
  }, [setPromise, show, showAcked]);

  const noDataText = isLoading ? LOADING_TEXT : isError ? ERROR_TEXT : NO_DATA_TEXT;

  const [incidentsMap, incidentsTags] = useMemo<
    [Map<Incident["pk"], Incident>, Map<string, Set<Incident["pk"]>>]
  >(() => {
    const incidentsMap = new Map<Incident["pk"], Incident>();
    const incidentsTags = new Map<string, Set<Incident["pk"]>>();
    for (const incident of incidents || []) {
      incidentsMap.set(incident.pk, incident);
      for (const incidentTag of incident.tags) {
        if (incidentsTags.has(incidentTag.tag)) {
          const tagSet = incidentsTags.get(incidentTag.tag) || new Set<Incident["pk"]>();
          tagSet.add(incident.pk);
          incidentsTags.set(incidentTag.tag, tagSet);
        } else {
          incidentsTags.set(
            incidentTag.tag,
            new Set<Incident["pk"]>([incident.pk]),
          );
        }
      }
    }
    return [incidentsMap, incidentsTags];
  }, [incidents]);

  const filteredIncidents = useMemo<Incident[]>(() => {
    const filterOnSources = (incident: Incident) => sources === "AllSources" || sources.has(incident.source.name);

    const tagsFilterByType = groupBy<Tag["key"], Tag>(tagsFilter, (elem: Tag) => elem.key);

    // returns incidents matching any tag of that type
    const getIncidentsMatchingType = (type: string): Set<Incident["pk"]> => {
      const allMatching = new Set<Incident["pk"]>();

      const tagsOfType = tagsFilterByType.get(type);
      if (!tagsOfType) return new Set<Incident["pk"]>();

      for (const tag of tagsOfType) {
        const incidentsWithTag = incidentsTags.get(tag.original);
        if (!incidentsWithTag) continue;

        [...incidentsWithTag.values()].forEach((pk: Incident["pk"]) => allMatching.add(pk));
      }
      return allMatching;
    };

    let filteredByTags: Incident[];
    if (tagsFilter.length > 0) {
      const matchingSets = getIncidentsMatchingType(tagsFilter[0].key);
      if (!matchingSets) {
        filteredByTags = [];
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [type, ...rest] of tagsFilterByType) {
          const incidentsMatchingTag = getIncidentsMatchingType(type);
          for (const pk of matchingSets) {
            if (!incidentsMatchingTag.has(pk)) matchingSets.delete(pk);
          }
        }
        filteredByTags = removeUndefined([...matchingSets.values()].map((pk: Incident["pk"]) => incidentsMap.get(pk)));
      }
    } else {
      filteredByTags = [...incidentsMap.values()];
    }

    // TODO: filtering on active should be done in the backend API
    return (
      filteredByTags
        .filter((incident: Incident) => (show === "open" ? incident.open : show === "closed" ? !incident.open : true))
        .filter((incident: Incident) => showAcked || !incident.acked)
        .filter(filterOnSources) || []
    );
  }, [incidentsMap, incidentsTags, show, showAcked, tagsFilter, sources]);

  const sourceAlts = useMemo(
    () => [...new Set([...(incidents || []).map((incident: Incident) => incident.source.name)]).values()],
    [incidents],
  );

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
              <Select variant="outlined" value={show} onChange={handleShowChange}>
                <MenuItem value={"open"}>Open</MenuItem>
                <MenuItem value={"closed"}>Closed</MenuItem>
                <MenuItem value={"both"}>Both</MenuItem>
              </Select>
            </Grid>

            <Grid item md>
              <Typography>Show acked events</Typography>
              <Checkbox checked={showAcked} onClick={() => setShowAcked((old) => !old)} />
            </Grid>

            <Grid item md>
              <Typography>Realtime</Typography>
              <Checkbox checked={realtime} onClick={() => setRealtime((old) => !old)} />
            </Grid>

            <Grid item md>
              <Typography>Sources to display</Typography>
              <SourceSelector
                sources={sourceAlts}
                onSelectionChange={(selection: string[]) => {
                  console.log("source selection changed", selection);
                  setSources((selection.length !== 0 && new Set<string>(selection)) || "AllSources");
                }}
              />
            </Grid>

            <Grid item md>
              <Typography>Tags filter</Typography>
              <TagSelector
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
          realtime={realtime}
          open={show === "open"}
          incidents={filteredIncidents}
          noDataText={noDataText}
        />
      </div>
    </div>
  );
};

export default withRouter(IncidentView);
