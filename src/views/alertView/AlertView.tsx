import React, { useState, useEffect } from 'react';
import './AlertView.css';
import Header from '../../components/header/Header';
import Table from '../../components/react-table/Table';
import '../../components/react-table/table.css';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import { getEnabledCategories } from 'trace_events';
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
