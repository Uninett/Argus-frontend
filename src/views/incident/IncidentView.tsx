import React, { useState } from "react";
import "./IncidentView.css";
import { withRouter } from "react-router-dom";

import FilteredIncidentTable, { IncidentsFilter } from "../../components/incidenttable/FilteredIncidentTable";
import "../../components/incidenttable/incidenttable.css";

import { ENABLE_WEBSOCKETS_SUPPORT } from "../../config";

import { IncidentFilterToolbar } from "../../components/incident/IncidentFilterToolbar";

type IncidentViewPropsType = {};

const IncidentView: React.FC<IncidentViewPropsType> = ({}: IncidentViewPropsType) => {
  const [filter, setFilter] = useState<IncidentsFilter>({
    realtime: ENABLE_WEBSOCKETS_SUPPORT,
    showAcked: false,
    tags: [],
    sources: "AllSources",
    sourcesById: undefined,
    show: "open",
  });

  return (
    <div>
      <IncidentFilterToolbar filter={filter} onFilterChange={setFilter} />
      <FilteredIncidentTable filter={filter} />
    </div>
  );
};

export default withRouter(IncidentView);
