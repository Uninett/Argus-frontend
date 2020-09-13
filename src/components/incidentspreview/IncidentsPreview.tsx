import React, { useEffect } from "react";

import IncidentTable from "../../components/incidenttable/IncidentTable";
import api, { FilterDefinition } from "../../api";
import { useApiIncidents } from "../../api/hooks";

import { LOADING_TEXT, ERROR_TEXT, NO_DATA_TEXT } from "../../constants";

type IncidentsPreviewProps = {
  filter?: FilterDefinition;
};

const IncidentsPreview: React.FC<IncidentsPreviewProps> = ({ filter }: IncidentsPreviewProps) => {
  const [{ result, isLoading, isError }, setPromise] = useApiIncidents();

  useEffect(() => {
    if (filter) {
      // Don't send any query parameters unless it is needed
      // by setting them to undefined they won't be added.
      const filterOptions = {
        sourceSystemIds: filter.sourceSystemIds.length > 0 ? filter.sourceSystemIds : undefined,
        tags: filter.tags.length > 0 ? filter.tags : undefined,
      };
      setPromise(api.getAllIncidentsFiltered(filterOptions));
    }
  }, [filter, setPromise]);

  const noDataText = isLoading ? LOADING_TEXT : isError ? ERROR_TEXT : NO_DATA_TEXT;
  return <IncidentTable incidents={result || []} noDataText={noDataText} />;
};

export default IncidentsPreview;
