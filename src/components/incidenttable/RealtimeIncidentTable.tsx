import React, { useEffect, useState } from "react";

// Api
import { Incident, IncidentTag } from "../../api";
import { RealtimeService } from "../../services/RealtimeService";

// Contexts/Hooks
import { useSelectedFilter } from "../../components/filterprovider";
import { useIncidents } from "../../components/incidentsprovider";

// Utils
import { groupBy } from "../../utils";

// Components
import { MinimalIncidentTable } from "./IncidentTable";
import { IncidentsFilter } from "../../components/incidenttable/FilteredIncidentTable";
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
  const [
    {
      filter: { showAcked, show, tags, sourcesById, autoUpdate },
    },
    {},
  ] = useSelectedFilter();
  const [{ incidents }, { loadAllIncidents, addIncident, modifyIncident, removeIncident }] = useIncidents();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);

    const incidentMatchesFilter = (incident: Incident, filter: Omit<IncidentsFilter, "sources">): boolean => {
      const matches =
        matchesShow(incident, filter.show) &&
        matchesAcked(incident, filter.showAcked) &&
        matchesOnTags(incident, filter.tags) &&
        matchesOnSources(incident, filter.sourcesById);
      return matches;
    };

    const onIncidentAdded = (incident: Incident) => {
      if (incidentMatchesFilter(incident, { showAcked, show, tags, sourcesById, autoUpdate })) {
        addIncident(incident);
      }
    };

    const onIncidentModified = (incident: Incident) => {
      if (incidentMatchesFilter(incident, { showAcked, show, tags, sourcesById, autoUpdate })) {
        modifyIncident(incident);
      } else {
        removeIncident(incident.pk);
      }
    };

    const onIncidentRemoved = (incident: Incident) => {
      removeIncident(incident.pk);
    };

    const onIncidentsInitial = (incidents: Incident[]) => {
      const matchesFilter = incidents.filter((incident: Incident) =>
        incidentMatchesFilter(incident, { showAcked, show, tags, sourcesById, autoUpdate }),
      );
      loadAllIncidents(matchesFilter);
      setIsLoading(false);
    };

    const rts = new RealtimeService({
      onIncidentAdded,
      onIncidentModified,
      onIncidentRemoved,
      onIncidentsInitial,
    });
    rts.connect();
    console.log("created rts and connect()");

    return () => {
      console.log("disconnecting rts");
      rts.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAcked, show, tags, sourcesById, autoUpdate]);

  return <MinimalIncidentTable isLoading={isLoading} incidents={incidents} />;
};

export default RealtimeIncidentTable;
