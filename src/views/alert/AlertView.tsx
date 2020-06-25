import React, { useState, useEffect } from "react";
import "./AlertView.css";
import Header from "../../components/header/Header";
import AlertTable from "../../components/alerttable/AlertTable";
import "../../components/alerttable/alerttable.css";
import { withRouter } from "react-router-dom";
import api, { Alert } from "../../api";
import { AlertWithFormattedTimestamp, alertWithFormattedTimestamp } from "../../utils";

type AlertViewPropsType = {};

const AlertView: React.FC<AlertViewPropsType> = () => {
  const LOADING_TEXT = "Loading...";
  const NO_DATA_TEXT = "No data";

  const [alerts, setAlerts] = useState<AlertWithFormattedTimestamp[]>([]);
  const [noDataText, setNoDataText] = useState<string>(LOADING_TEXT);

  useEffect(() => {
    const getAlerts = async () => {
      await api.getActiveAlerts().then((alerts: Alert[]) => {
        const alertsWithFormattedTimestamps = alerts.map(alertWithFormattedTimestamp);
        setNoDataText(alerts.length === 0 ? NO_DATA_TEXT : LOADING_TEXT);
        setAlerts(alertsWithFormattedTimestamps);
      });
    };

    getAlerts();
  }, []);

  return (
    <div>
      <header>
        <Header />
      </header>
      <h1 className={"filterHeader"}>Active Alerts </h1>
      <div className="table">
        <AlertTable alerts={alerts} noDataText={noDataText} />
      </div>
    </div>
  );
};

export default withRouter(AlertView);
