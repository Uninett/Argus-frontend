import React, { useState, useEffect } from 'react';
import './AlertView.css';
import Header from '../../components/header/Header';
import Table from '../../components/react-table/Table';
import '../../components/react-table/table.css';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import { getEnabledCategories } from 'trace_events';
import moment from 'moment';
type PropType = {
  history: any;
};


const AlertView: React.FC<PropType> = props => {
  const [alerts, setAlerts] = useState<any>([]);

  useEffect(() => {
    getAlerts();
  }, []);

  //fetches alerts and sets state
  const getAlerts = async () => {
    await axios({
      url: 'http://localhost:8000/alerts/',
      method: 'GET',
      headers: {
        Authorization: 'Token ' + localStorage.getItem('token')
      }
    }).then((response: any) => {
      for(let item of response.data) {
        item.timestamp = moment(item.timestamp).format('YYYY.MM.DD  hh:mm:ss')
      }


      
      setAlerts(response.data);
    });
  };
  return (
    <div>
      <header>
        <Header />
      </header>
      <div className='table'>
        <Table alerts={alerts} />
      </div>
    </div>
  );
};

export default withRouter(AlertView);
