import React, { useEffect } from "react";
import { withRouter } from "react-router-dom";

import FilteredIncidentTable from "../../components/incidenttable/FilteredIncidentTable";
import RealtimeIncidentTable from "../../components/incidenttable/RealtimeIncidentTable";

import { IncidentFilterToolbar } from "../../components/incident/IncidentFilterToolbar";

// Context/Hooks
import { useFilters } from "../../api/actions";
import { useAlerts } from "../../components/alertsnackbar";
import SelectedFilterProvider, { useSelectedFilter } from "../../components/filterprovider"; // TODO: move
import IncidentsProvider from "../../components/incidentsprovider"; // TODO: move

const IncidentComponent = () => {
  const [{ incidentsFilter }] = useSelectedFilter();
  return incidentsFilter.autoUpdate === "realtime" ? (
    <RealtimeIncidentTable key="realtime" />
  ) : (
    <FilteredIncidentTable key="interval" />
  );
};

type IncidentViewPropsType = {};

const IncidentView: React.FC<IncidentViewPropsType> = () => {
  const [, { loadAllFilters }] = useFilters();
  // TODO: Fix useAlerts() so that it doesn't result in refresh all the time.
  const displayAlert = useAlerts();

  useEffect(() => {
    loadAllFilters()
      // .then(() => displayAlert("Loaded filters", "success"))
      .catch((error) => displayAlert(`Failed to fetch filters: ${error}`, "error"));
  }, []);

  return (
    <div>
      <SelectedFilterProvider>
        <IncidentsProvider>
          <IncidentFilterToolbar />
          <IncidentComponent />
        </IncidentsProvider>
      </SelectedFilterProvider>
    </div>
  );
};

export default withRouter(IncidentView);
