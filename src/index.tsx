import React, {ReactElement} from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import {AppProvider} from "./state/contexts";
import {BrowserRouter} from "react-router-dom";
import {defaultRequiredConfigValues, globalConfig, globalConfigUrl} from "./config";
import api from "./api";

// Before rendering, first fetch the global config:
const app: ReactElement =
  <BrowserRouter>
    <AppProvider>
      <App/>
    </AppProvider>
  </BrowserRouter>

const absoluteConfigUrl = `${process.env.PUBLIC_URL}/${globalConfigUrl}`

console.log("index.tsx, fetching global config from", absoluteConfigUrl);

fetch(
  absoluteConfigUrl
  , {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
)
  .then(response => response.json())
  .then((response) => {
    globalConfig.set({...response})
    api.updateBaseUrl(response.backendUrl)
    return app;
  })
  .then((reactElement: ReactElement) => {
    ReactDOM.render(
      reactElement,
      document.getElementById("root"),
    );
  })
  .catch(e => {
    if (process.env.NODE_ENV === "development") {
      globalConfig.set(defaultRequiredConfigValues)
      api.updateBaseUrl(defaultRequiredConfigValues.backendUrl)
      ReactDOM.render(
        app,
        document.getElementById("root"),
      );
    } else {
      console.log(e);
    }
  })
;


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
