import React, { useState, useEffect } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import axios from 'axios';

const Table: React.FC = () => {
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
  //format JSON
  const fixAlert = (e: any) => {
    let list: any = [];
    for (let i = 0; i < e.length; i++) {
      list.push(e[i].fields);
    }
    return list;
  };
  const columns: any = [
    { Header: 'Timestamp', accessor: 'start_time' },
    { Header: 'Alert ID', accessor: 'alert_id' },
    { Header: 'Source', accessor: 'source' },
    { Header: 'Netbox', accessor: 'netbox' }
  ];

  return <ReactTable columns={columns} data={alerts}></ReactTable>;
};

export default Table;
