import React, { useEffect, useState } from "react";

// Api
import { Incident } from "../../api";
import { RealtimeService, RealtimeServiceState, RealtimeServiceConfig } from "../../services/RealtimeService";

// Contexts/Hooks
import { useAlerts } from "../../components/alertsnackbar";
import { useIncidents } from "../../api/actions";
import { useIncidentsContext } from "../../components/incidentsprovider";
import { useSelectedFilter } from "../../components/filterprovider";

// Providers
import FilteredIncidentsProvider, { matchesFilter } from "../../components/filteredincidentprovider";

// Components
import { MinimalIncidentTable } from "./IncidentTable";

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
      return matchesFilter(incident, { showAcked, show, tags, sourcesById });
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
