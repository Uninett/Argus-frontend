import React, { useState, useEffect } from "react";

import AlertTable from "../../components/alerttable/AlertTable";
import api, { Alert, FilterDefinition } from "../../api";
import { alertWithFormattedTimestamp, AlertWithFormattedTimestamp } from "../../utils";

const LOADING_TEXT = "Loading...";
const NO_DATA_TEXT = "No data";

type AlertsPreviewProps = {
  filter?: FilterDefinition;
};

const AlertsPreview: React.FC<AlertsPreviewProps> = ({ filter }: AlertsPreviewProps) => {
  const [noDataText, setNoDataText] = useState<string>(LOADING_TEXT);
  const [previewAlerts, setPreviewAlerts] = useState<AlertWithFormattedTimestamp[]>([]);

  useEffect(() => {
    const getAlerts = (filter: FilterDefinition) => {
      const promise = api.postFilterPreview(filter);
      promise.then((alerts: Alert[]) => {
        const formattedAlerts = alerts.map(alertWithFormattedTimestamp);
        setNoDataText(alerts.length === 0 ? NO_DATA_TEXT : LOADING_TEXT);
        setPreviewAlerts(formattedAlerts);
      });
    };

    if (!filter) {
      setPreviewAlerts([]);
    } else {
      getAlerts(filter);
    }
  }, [filter]);

  return <AlertTable alerts={previewAlerts} noDataText={noDataText} />;
};

export default AlertsPreview;
