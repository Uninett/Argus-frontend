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
      setPromise(api.postFilterPreview(filter));
    }
  }, [filter, setPromise]);

  const noDataText = isLoading ? LOADING_TEXT : isError ? ERROR_TEXT : NO_DATA_TEXT;
  return <IncidentTable incidents={result || []} noDataText={noDataText} />;
};

export default IncidentsPreview;
