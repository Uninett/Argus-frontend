import React, { useEffect, useState } from "react";

// Api
import { Incident, IncidentTag } from "../../api";
import { RealtimeService } from "../../services/RealtimeService";

// Contexts/Hooks
import { useAlerts } from "../../components/alertsnackbar";
import { useIncidents } from "../../api/actions";
import { useIncidentsContext } from "../../components/incidentsprovider";
import { useSelectedFilter } from "../../components/filterprovider";

// Utils
import { groupBy } from "../../utils";

// Components
import { MinimalIncidentTable } from "./IncidentTable";
import { Tag } from "../../components/tagselector";

// for all different tags "keys", THERE HAS TO BE ONE tag with
// matching value in incident.tags
const matchesOnTags = (incident: Incident, tags: Tag[]): boolean => {
  if (tags.length === 0) {
    return true;
  }

  const incidentTagsSet = new Set(incident.tags.map((it: IncidentTag) => it.tag));
  const tagsGroupedByKey: Map<string, Set<Tag>> = groupBy(tags, (tag: Tag) => tag.key);
  const returnVal = [...tagsGroupedByKey.keys()].every((tagKey: string) => {
    const tagsOnKey = tagsGroupedByKey.get(tagKey) || new Set<Tag>();
    return [...tagsOnKey.values()].some((tag: Tag) => incidentTagsSet.has(tag.original));
  });
  console.log("incidentTagsSet", incidentTagsSet, "tagsGroupedByKey", tagsGroupedByKey);
  return returnVal;
};

const matchesOnSources = (incident: Incident, sources: number[] | undefined): boolean => {
  if (sources === undefined || sources.length === 0) {
    return true;
  }
  return sources.some((source: number) => incident.source.pk === source);
};

const matchesShow = (incident: Incident, show: "open" | "closed" | "both"): boolean => {
  if (show === "both") return true;
  return incident.open ? show === "open" : show === "closed";
};

const matchesAcked = (incident: Incident, showAcked: boolean): boolean => {
  if (showAcked) return true;
  return !incident.acked;
};

type RealtimeIncidentTablePropsType = {};

const RealtimeIncidentTable = () => {
  const displayAlert = useAlerts();

  const [
    {
      filter: { showAcked, show, tags, sourcesById, autoUpdate },
    },
    {},
  ] = useSelectedFilter();
  const [{ incidents }, { loadAllIncidents, addIncident, modifyIncident, removeIncident }] = useIncidentsContext();
  const [{}, { loadIncidentsFiltered }] = useIncidents();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingRealtime, setIsLoadingRealtime] = useState<boolean>(true);
  const [filterMatcher, setFilterMatcher] = useState<(incident: Incident) => boolean>(() => false);

  useEffect(() => {
    // We still load incidents initially using REST, because
    // the websockets implementation in the backend is lacking
    // some features....
    loadIncidentsFiltered({ showAcked, show, tags, sourcesById, autoUpdate });

    // In order for the websockets callbacks to call the updated filter matching
    // function we need to create a new such function every time the filter changes.
    const incidentMatchesFilter = (incident: Incident): boolean => {
      const filter = { showAcked, show, tags, sourcesById, autoUpdate };
      const matches =
        matchesShow(incident, filter.show) &&
        matchesAcked(incident, filter.showAcked) &&
        matchesOnTags(incident, filter.tags) &&
        matchesOnSources(incident, filter.sourcesById);
      return matches;
    };
    setFilterMatcher(() => incidentMatchesFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAcked, show, tags, sourcesById, autoUpdate]);

  useEffect(() => {
    setIsLoadingRealtime(true);

    const onIncidentAdded = (incident: Incident) => {
      if (filterMatcher(incident)) {
        addIncident(incident);
      }
    };

    const onIncidentModified = (incident: Incident) => {
      if (filterMatcher(incident)) {
        modifyIncident(incident);
      } else {
        removeIncident(incident.pk);
      }
    };

    const onIncidentRemoved = (incident: Incident) => {
      removeIncident(incident.pk);
    };

    const onIncidentsInitial = (incidents: Incident[]) => {
      // const matchesFilter = incidents.filter((incident: Incident) =>
      //   incidentMatchesFilter(incident, { showAcked, show, tags, sourcesById, autoUpdate }),
      // );
      // loadAllIncidents(matchesFilter);
      // setIsLoading(false);
      setIsLoadingRealtime(false);
    };

    const rts = new RealtimeService({
      onIncidentAdded,
      onIncidentModified,
      onIncidentRemoved,
      onIncidentsInitial,
    });
    rts.connect();
    console.log("created rts and connect()");
    displayAlert("Realtime enabled", "success");

    return () => {
      console.log("disconnecting rts");
      displayAlert("Realtime disconnected", "warning");
      rts.disconnect();
    };
    // When the websockets backend implementation support taking filters
    // this might be useful:
    //}, [showAcked, show, tags, sourcesById, autoUpdate]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <MinimalIncidentTable isRealtime={!isLoadingRealtime} isLoading={isLoading} incidents={incidents} />;
};

export default RealtimeIncidentTable;
