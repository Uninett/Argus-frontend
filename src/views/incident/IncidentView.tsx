import React, { useEffect } from "react";
import "./IncidentView.css";
import Header from "../../components/header/Header";
import IncidentTable from "../../components/incidenttable/IncidentTable";
import "../../components/incidenttable/incidenttable.css";
import { withRouter } from "react-router-dom";
import api from "../../api";
import { useApiIncidents } from "../../api/hooks";

import { LOADING_TEXT, ERROR_TEXT, NO_DATA_TEXT } from "../../constants";

type IncidentViewPropsType = {};

const IncidentView: React.FC<IncidentViewPropsType> = () => {
  const [{ result: incidents, isLoading, isError }, setPromise] = useApiIncidents();

  useEffect(() => {
    setPromise(api.getActiveIncidents());
  }, [setPromise]);

  const noDataText = isLoading ? LOADING_TEXT : isError ? ERROR_TEXT : NO_DATA_TEXT;

  return (
    <div>
      <header>
        <Header />
      </header>
      <h1 className={"filterHeader"}>Active Incidents </h1>
      <div className="table">
        <IncidentTable realtime incidents={incidents || []} noDataText={noDataText} />
      </div>
    </div>
  );
};

export default withRouter(IncidentView);
