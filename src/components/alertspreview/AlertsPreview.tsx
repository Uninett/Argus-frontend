import React, { useEffect } from "react";

import AlertTable from "../../components/alerttable/AlertTable";
import api, { FilterDefinition } from "../../api";
import { useApiAlerts } from "../../api/hooks";

import { LOADING_TEXT, ERROR_TEXT, NO_DATA_TEXT } from "../../constants";

type AlertsPreviewProps = {
  filter?: FilterDefinition;
};

const AlertsPreview: React.FC<AlertsPreviewProps> = ({ filter }: AlertsPreviewProps) => {
  const [{ result, isLoading, isError }, setPromise] = useApiAlerts();

  useEffect(() => {
    if (filter) {
      setPromise(api.postFilterPreview(filter));
    }
  }, [filter, setPromise]);

  const noDataText = isLoading ? LOADING_TEXT : isError ? ERROR_TEXT : NO_DATA_TEXT;
  return <AlertTable alerts={result || []} noDataText={noDataText} />;
};

export default AlertsPreview;
