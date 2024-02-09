import React, {ReactElement} from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { AppProvider } from "./state/contexts";
import { BrowserRouter } from "react-router-dom";
import { globalConfig, globalConfigUrl } from "./config";
import api from "./api";

fetch(
  globalConfigUrl
  ,{
    headers : {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
)
  .then(response => response.json())
  .then((response) => {
    globalConfig.set({...response})
    api.updateBaseUrl(response.backendUrl)
    return (
      <BrowserRouter>
        <AppProvider>
          <App/>
        </AppProvider>
      </BrowserRouter>
    );
  })
  .then((reactElement: ReactElement) => {
    ReactDOM.render(
      reactElement,
      document.getElementById("root"),
    );
  })
  .catch(e => {
    return <p style={{color: "red", textAlign: "center"}}>Error while fetching global config</p>;
  })
;


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
