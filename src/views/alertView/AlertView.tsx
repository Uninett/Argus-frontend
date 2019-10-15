import React, { useState, useEffect, useContext } from "react";
import "./AlertView.css";
import axios from "axios";
import Header from "../../components/header/Header";
import { Store } from "../../store";
import { useCookies } from "react-cookie";

const AlertView: React.FC = (props: any) => {
  const [alerts, setAlerts] = useState<Object[]>([]);
  const { state, dispatch } = useContext(Store);

  const [cookies, setCookie, removeCookie] = useCookies(["Authorization"]);

  useEffect(() => {
    getAlert();
  }, []);

  const getAlert = async () => {
    console.log(state.token + " her er token");
    await axios({
      url: "http://localhost:8000/alert/all/",
      method: "GET",
      headers: {
        Authorization: "Token " + localStorage.getItem("token")
      }
    }).then((response: any) => {
      const alertList = fixAlert(response.data);
      setAlerts(alertList);
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
        <div className="alertbox" />
      </div>
    </div>
  );
};

/**
 {alerts.map((alert: any) => {
              const s: string = JSON.stringify(alert).replace(/['"{}]+/g, "");
              return <li key={alert.alert_id}>{s.replace(/[,]+/g, " ")}</li>;
            })}
 **/

export default AlertView;
