import React, { useEffect, useState, useMemo, useContext } from "react";
import { withRouter } from "react-router-dom";

import FilteredIncidentTable, { IncidentsFilter } from "../../components/incidenttable/FilteredIncidentTable";

import { ENABLE_WEBSOCKETS_SUPPORT } from "../../config";

import { IncidentFilterToolbar } from "../../components/incident/IncidentFilterToolbar";
import api, { Filter } from "../../api";
import { originalToTag } from "../../components/tagselector";

// Store
import { AppContext } from "../../contexts";
import { loadAllFilters } from "../../reducers/filter";

type IncidentViewPropsType = {};

const IncidentView: React.FC<IncidentViewPropsType> = () => {
  const {
    state: { filters },
    dispatch,
  } = useContext(AppContext);

  useEffect(() => {
    api.getAllFilters().then((filters: Filter[]) => {
      dispatch(loadAllFilters(filters));
    });
  }, [dispatch]);

  const [existingFilter, setExistingFilter] = useState<number>(-1);

  const [filter, setFilter] = useState<IncidentsFilter>({
    autoUpdate: ENABLE_WEBSOCKETS_SUPPORT ? "realtime" : "interval",
    showAcked: false,
    tags: [],
    sources: "AllSources",
    sourcesById: undefined,
    show: "open",
  });

  // If the user has chosen to use an existing filter
  // it will take the sources and tags from that filter.
  // AND it will use the following properties:
  // show=open, showAcked=true, autoupdate=interval
  // The reasoning being that this is what the preview does.
  // TODO: When real-time is supported better it should be enabled
  const selectedFilter = useMemo((): IncidentsFilter => {
    if (existingFilter === -1 || existingFilter >= filters.length || existingFilter < 0) {
      return filter;
    }

    const existing: Filter = filters[existingFilter];

    const tags = [...existing.tags.map(originalToTag), ...filter.tags];
    const sources = undefined;
    const sourcesById = [...existing.sourceSystemIds, ...(filter.sourcesById || [])];
    return { tags, sources, sourcesById, show: "open", showAcked: true, autoUpdate: "interval" };
  }, [filter, existingFilter, filters]);

  return (
    <div>
      <IncidentFilterToolbar
        existingFilter={existingFilter}
        existingFilters={filters}
        filter={filter}
        onExistingFilterChange={setExistingFilter}
        onFilterChange={setFilter}
      />
      <FilteredIncidentTable filter={selectedFilter} />
    </div>
  );
};

export default withRouter(IncidentView);
