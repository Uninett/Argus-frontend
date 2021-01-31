import React, { useEffect, useState, useContext, useMemo } from "react";

// Api
import { Incident, IncidentTag } from "../../api";
import { RealtimeService, RealtimeServiceState, RealtimeServiceConfig } from "../../services/RealtimeService";

// Contexts/Hooks
import { useAlerts } from "../../components/alertsnackbar";
import { useIncidents } from "../../api/actions";
import { useIncidentsContext, IncidentsContext } from "../../components/incidentsprovider";
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
  const openState = show == "open";
  return incident.open === openState;
  // return incident.open ? show === "open" : show === "closed";
};

const matchesAcked = (incident: Incident, showAcked: boolean): boolean => {
  if (showAcked) return true;
  return !incident.acked;
};

export const FilteredIncidentsProvider = ({
  filterMatcher,
  children,
}: {
  filterMatcher: ((incident: Incident) => boolean) | undefined;
  children?: React.ReactNode;
}) => {
  const { state, dispatch } = useContext(IncidentsContext);

  const filteredIncidents = useMemo(() => {
    if (filterMatcher === undefined) return state.incidents;
    return state.incidents.filter(filterMatcher);
  }, [filterMatcher, state.incidents]);

  return (
    <IncidentsContext.Provider value={{ state: { ...state, incidents: filteredIncidents }, dispatch }}>
      {children}
    </IncidentsContext.Provider>
  );
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
  const [{}, { addIncident, modifyIncident, removeIncident }] = useIncidentsContext();
  const [{}, { loadIncidentsFiltered }] = useIncidents();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingRealtime, setIsLoadingRealtime] = useState<boolean>(true);
  const [filterMatcher, setFilterMatcher] = useState<((incident: Incident) => boolean) | undefined>(undefined);

  const [rtsState, setRtsState] = useState<RealtimeServiceState | undefined>(undefined);
  const [rtsConfig, setRtsConfig] = useState<RealtimeServiceConfig | undefined>(undefined);
  const [realtimeService, setRealtimeService] = useState<RealtimeService | undefined>(undefined);

  // const onIncidentsInitial = (/* incidents: Incident[] */) => {
  //   // const matchesFilter = incidents.filter((incident: Incident) =>
  //   //   incidentMatchesFilter(incident, { showAcked, show, tags, sourcesById, autoUpdate }),
  //   // );
  //   // loadAllIncidents(matchesFilter);
  //   // setIsLoading(false);
  // };

  useEffect(() => {
    console.log("rtsState", rtsState);
    switch (rtsState) {
      case "opened":
        // displayAlert("Realtime opened", "info");
        setIsLoadingRealtime(true);
        break;

      case "connected":
        displayAlert("Realtime connected", "success");
        setIsLoadingRealtime(false);
        break;

      case "closed": {
        setIsLoadingRealtime(true);
        displayAlert("Realtime closed", "warning");
        break;
      }

      case "disconnecting":
        setIsLoadingRealtime(true);
        displayAlert("Realtime disconnecting", "info");
        break;

      case "connecting":
        displayAlert("Realtime connecting", "info");
        setIsLoadingRealtime(true);
        break;
    }
  }, [rtsState, displayAlert]);

  useEffect(() => {
    setIsLoading(true);
    // We still load incidents initially using REST, because
    // the websockets implementation in the backend is lacking
    // some features....
    loadIncidentsFiltered({ showAcked, show, tags, sourcesById, autoUpdate }).then(() => {
      setIsLoading(false);
    });

    // In order for the websockets callbacks to call the updated filter matching
    // function we need to create a new such function every time the filter changes.
    const incidentMatchesFilter = (incident: Incident): boolean => {
      const filter = { showAcked, show, tags, sourcesById, autoUpdate };

      /*
      // Useful for debugging
      const matches = [
        ["open", incident.open, filter.show, matchesShow(incident, filter.show)],
        ["acked", incident.acked, filter.showAcked, matchesAcked(incident, filter.showAcked)],
        ["tags", incident.tags, filter.tags, matchesOnTags(incident, filter.tags)],
        ["source", incident.source, filter.sourcesById, matchesOnSources(incident, filter.sourcesById)],
      ];

      console.debug("Checking match on filter: ");
      matches.forEach(([name, incidentValue, filterValue, match]) => {
        console.debug(match ? "match" : "fail", `${name}: `, incidentValue, filterValue);
      });

      return matches.every(([name, incidentValue, filterValue, match]) => match);
       */
      return (
        matchesShow(incident, filter.show) &&
        matchesAcked(incident, filter.showAcked) &&
        matchesOnTags(incident, filter.tags) &&
        matchesOnSources(incident, filter.sourcesById)
      );
    };
    setFilterMatcher(() => incidentMatchesFilter);
  }, [showAcked, show, tags, sourcesById, autoUpdate, loadIncidentsFiltered]);

  // Effect for creating RealtimeServiceConfig
  useEffect(() => {
    if (filterMatcher === undefined) {
      // Wait until it is set.
      return;
    }

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

    const config: RealtimeServiceConfig = {
      onIncidentAdded,
      onIncidentModified,
      onIncidentRemoved,
      onIncidentsInitial: () => undefined,
    };
    setRtsConfig(config);
  }, [filterMatcher, addIncident, modifyIncident, removeIncident]);

  // Update realtime service instance config
  useEffect(() => {
    if (rtsConfig === undefined || realtimeService === undefined) {
      return;
    }

    if (realtimeService.config === rtsConfig) {
      return;
    }
    console.log("updating config", rtsConfig);
    realtimeService.setConfig(rtsConfig);

    realtimeService.onStateChange = (prev: RealtimeServiceState, curr: RealtimeServiceState) => {
      console.log("rts.onStateChange", prev, curr);

      if (curr === prev) {
        // Ignore.
        return;
      }

      switch (curr) {
        case "opened":
          displayAlert("Realtime opened", "info");
          setIsLoadingRealtime(true);
          break;

        case "connected":
          displayAlert("Realtime connected", "success");
          setIsLoadingRealtime(false);
          break;

        case "closed": {
          setIsLoadingRealtime(true);
          displayAlert("Realtime closed", "warning");
          break;
        }

        case "disconnecting":
          setIsLoadingRealtime(true);
          displayAlert("Realtime disconnecting", "info");
          break;

        case "connecting":
          displayAlert("Realtime connecting", "info");
          setIsLoadingRealtime(true);
          break;
      }
      setRtsState(curr);
      return;
    };
  }, [rtsConfig, realtimeService, displayAlert]);

  useEffect(() => {
    if (rtsConfig === undefined) {
      // Wait until rtsConfig is set
      return;
    }

    if (realtimeService !== undefined) {
      // We have already created an realtime service,
      // so don't make another one.
      return;
    }

    console.log("Creating realtime service!");

    setIsLoadingRealtime(true);

    const rts = new RealtimeService(rtsConfig);
    setRealtimeService(rts);
    rts.connect();
    console.debug("created rts and connect()");

    return () => {
      console.debug("disconnecting rts");
      rts.disconnect();
      rts.resetOnStateChange();
    };
  }, [rtsConfig, realtimeService, displayAlert]);

  return (
    <FilteredIncidentsProvider filterMatcher={filterMatcher}>
      <MinimalIncidentTable isRealtime isLoading={isLoading} isLoadingRealtime={isLoadingRealtime} />
    </FilteredIncidentsProvider>
  );
};

export default RealtimeIncidentTable;
