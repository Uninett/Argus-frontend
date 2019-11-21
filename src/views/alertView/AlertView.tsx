import React, { useState, useEffect } from 'react';
import './AlertView.css';
import Header from '../../components/header/Header';
import Table from '../../components/react-table/Table';
import '../../components/react-table/table.css';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
type PropType = {
  history: any;
};


const AlertView: React.FC<PropType> = props => {
  const LOADING_TEXT = "Loading...";
  const NO_DATA_TEXT = "No data";

  const [alerts, setAlerts] = useState<any>([]);
  const [noDataText, setNoDataText] = useState<string>(LOADING_TEXT);

  useEffect(() => {
    getAlerts();
  }, []);

  //fetches alerts and sets state
  const getAlerts = async () => {
    await axios({
      url: 'http://localhost:8000/alerts/active/',
      method: 'GET',
      headers: {
        Authorization: 'Token ' + localStorage.getItem('token')
      }
    }).then((response: any) => {
      for(let item of response.data) {
        item.timestamp = moment(item.timestamp).format('YYYY.MM.DD  hh:mm:ss')
      }

      setNoDataText(response.data.length === 0 ? NO_DATA_TEXT : LOADING_TEXT);
      setAlerts(response.data);
    });
  };
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
