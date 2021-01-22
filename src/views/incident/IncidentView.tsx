import React, { useEffect } from "react";
import { withRouter } from "react-router-dom";

import FilteredIncidentTable from "../../components/incidenttable/FilteredIncidentTable";

import { IncidentFilterToolbar } from "../../components/incident/IncidentFilterToolbar";

// Context/Hooks
import { useFilters } from "../../api/actions";
import { useAlerts } from "../../components/alertsnackbar";
import SelectedFilterProvider from "../../components/filterprovider"; // TODO: move

type IncidentViewPropsType = {};

const IncidentView: React.FC<IncidentViewPropsType> = () => {
  const [, { loadAllFilters }] = useFilters();
  const displayAlert = useAlerts();

  useEffect(() => {
    loadAllFilters().catch((error) => displayAlert(`Failed to fetch filters: ${error}`, "error"));
  }, [loadAllFilters, displayAlert]);

  return (
    <div>
      <SelectedFilterProvider>
        <IncidentFilterToolbar />
        <FilteredIncidentTable />
      </SelectedFilterProvider>
    </div>
  );
};

export default withRouter(IncidentView);
