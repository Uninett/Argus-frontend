import React, { useEffect } from "react";
import "./AlertView.css";
import Header from "../../components/header/Header";
import AlertTable from "../../components/alerttable/AlertTable";
import "../../components/alerttable/alerttable.css";
import { withRouter } from "react-router-dom";
import api from "../../api";
import { useApiAlerts } from "../../api/hooks";

import { LOADING_TEXT, ERROR_TEXT, NO_DATA_TEXT } from "../../constants";

type AlertViewPropsType = {};

const AlertView: React.FC<AlertViewPropsType> = () => {
  const [{ result: alerts, isLoading, isError }, setPromise] = useApiAlerts();

  useEffect(() => {
    setPromise(api.getActiveAlerts());
  }, [setPromise]);

  const noDataText = isLoading ? LOADING_TEXT : isError ? ERROR_TEXT : NO_DATA_TEXT;

  return (
    <div>
      <header>
        <Header />
      </header>
      <h1 className={"filterHeader"}>Active Alerts </h1>
      <div className="table">
        <AlertTable alerts={alerts || []} noDataText={noDataText} />
      </div>
    </div>
  );
};

export default withRouter(AlertView);
