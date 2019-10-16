import React, { useState, useEffect } from 'react';
import './AlertView.css';
import axios from 'axios';
import Header from '../../components/header/Header';

const AlertView: React.FC = (props: any) => {
  const [alerts, setAlerts] = useState<Object[]>([]);

  useEffect(() => {
    getAlert();
  }, []);

  //fetches alerts and sets state
  const getAlert = async () => {
    await axios({
      url: 'http://localhost:8000/alert/all/',
      method: 'GET',
      headers: {
        Authorization: 'Token ' + localStorage.getItem('token')
      }
    }).then((response: any) => {
      const alertList = fixAlert(response.data);
      setAlerts(alertList);
    });
  };
  //helper-function to format the result
  const fixAlert = (e: any) => {
    let list: any = [];
    for (let i = 0; i < e.length; i++) {
      list.push(e[i].fields);
    }
    return list;
  };

  return (
    <div>
      <Header />
      <div className='container'>
        <div className='alertbox'>
          {alerts.map((alert: any) => {
            const s: string = JSON.stringify(alert).replace(/['"{}]+/g, '');
            return <li key={alert.alert_id}>{s.replace(/[,]+/g, ' ')}</li>;
          })}
        </div>
      </div>
    </div>
  );
};

export default AlertView;
