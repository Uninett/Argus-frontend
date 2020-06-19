import React, { useState, useEffect } from 'react';
import './AlertView.css';
import Header from '../../components/header/Header';
import Table from '../../components/react-table/Table';
import '../../components/react-table/table.css';
import { withRouter } from 'react-router-dom';
import Api, {Alert} from "../../api";
import {AlertWithFormattedTimestamp, alertWithFormattedTimestamp} from "../../utils";

type PropType = {};

const AlertView: React.FC<PropType> = props => {
  const LOADING_TEXT = "Loading...";
  const NO_DATA_TEXT = "No data";

  const [alerts, setAlerts] = useState<AlertWithFormattedTimestamp[]>([]);
  const [noDataText, setNoDataText] = useState<string>(LOADING_TEXT);

  useEffect(() => { getAlerts(); }, [])

  //fetches alerts and sets state
  const getAlerts = async () => {   
    await Api.getActiveAlerts().then((alerts: Alert[]) => {
       const alertsWithFormattedTimestamps = alerts.map(alertWithFormattedTimestamp)
       setNoDataText(alerts.length === 0 ? NO_DATA_TEXT : LOADING_TEXT);
       setAlerts(alertsWithFormattedTimestamps);
    })
  }
  return (
    <div>
      <header>
        <Header />
      </header>
      <h1 className={'filterHeader'}>Active Alerts </h1>
      <div className='table'>
        <Table alerts={alerts} noDataText={noDataText} />
      </div>
    </div>
  );
};

export default withRouter(AlertView);
