import React, { useState, useEffect } from "react";
import "./AlertView.css";
import axios from "axios";
import Header from "../../components/header/Header";

const AlertView: React.FC = () => {
  const [alerts, setAlerts] = useState<Object[]>([]);

  useEffect(() => {
    getAlert();
  }, []);

  const getAlert = async () => {
    axios
      .get("http://localhost:8000/alert/all")
      .then(response => {
        const alertList = fixAlert(response.data);
        setAlerts(alertList);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const fixAlert = (e: any) => {
    let list: any = [];
    for (let i = 0; i < e.length; i++) {
      list.push(e[i].fields);
    }
    return list;
  };

  console.log(alerts);
  return (
    <div>
      <header>
        <Header />
      </header>
      <div className="container">
        <div className="alertbox">
          <ul>
            {alerts.map((alert: any) => {
              const s: string = JSON.stringify(alert).replace(/['"{}]+/g, "");
              return <li key={alert.alert_id}>{s.replace(/[,]+/g, " ")}</li>;
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AlertView;
