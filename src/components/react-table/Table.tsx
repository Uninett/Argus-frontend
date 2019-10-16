import React, { useState, useEffect } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import axios from 'axios';

const Table: React.FC = () => {
  const [alerts, setAlerts] = useState<Object[]>([]);

  useEffect(() => {
    getAlert();
  }, []);

  //fetch data
  const getAlert = async () => {
    axios
      .get('http://localhost:8000/alert/all/')
      .then(response => {
        const alertList = fixAlert(response.data);
        setAlerts(alertList);
        console.log('dette får vi:', alertList);
      })
      .catch(error => {
        console.log(error);
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
