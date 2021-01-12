import React, { useEffect, useState, useMemo } from "react";
import "./IncidentView.css";
import { withRouter } from "react-router-dom";

import FilteredIncidentTable, { IncidentsFilter } from "../../components/incidenttable/FilteredIncidentTable";
import "../../components/incidenttable/incidenttable.css";

import { ENABLE_WEBSOCKETS_SUPPORT } from "../../config";

import { IncidentFilterToolbar } from "../../components/incident/IncidentFilterToolbar";
import api, { Filter } from "../../api";
import { originalToTag } from "../../components/tagselector";

type IncidentViewPropsType = {};

const IncidentView: React.FC<IncidentViewPropsType> = ({}: IncidentViewPropsType) => {
  const [existingFilters, setExistingFilters] = useState<Filter[]>([]);

  useEffect(() => {
    api.getAllFilters().then((filters: Filter[]) => {
      setExistingFilters(filters);
    });
  }, []);

  const [existingFilter, setExistingFilter] = useState<number>(-1);

  const [filter, setFilter] = useState<IncidentsFilter>({
    autoUpdate: ENABLE_WEBSOCKETS_SUPPORT ? "realtime" : "interval",
    showAcked: false,
    tags: [],
    sources: "AllSources",
    sourcesById: undefined,
    show: "open",
  });

  const mergedFilter = useMemo(() => {
    if (existingFilter || existingFilter >= existingFilters.length || existingFilter < 0) {
      return filter;
    }

    const existing: Filter = existingFilters[existingFilter];

    const tags = [...existing.tags.map(originalToTag)];
    const sources = undefined;
    const sourcesById = existing.sourceSystemIds;

    return { ...filter, tags, sources, sourcesById };
  }, [filter, existingFilter, existingFilters]);

  return (
    <div>
      <IncidentFilterToolbar
        existingFilter={existingFilter}
        existingFilters={existingFilters}
        filter={filter}
        onExistingFilterChange={setExistingFilter}
        onFilterChange={setFilter}
      />
      <FilteredIncidentTable filter={mergedFilter} />
    </div>
  );
};

export default withRouter(IncidentView);
