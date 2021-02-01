import React from "react";

import "./variables.css";
import "./colorscheme.css";

import IncidentDetailsView from "./views/incident/IncidentDetailView";
import IncidentView from "./views/incident/IncidentView";
import LoginView from "./views/login/LoginView";
import { Route, Switch, useHistory } from "react-router-dom";
import { ProtectedRoute } from "./protected.route";
import NotificationProfileView from "./views/notificationprofile/NotificationProfileView";
import FiltersView from "./views/filters/FiltersView";
import TimeslotView from "./views/timeslot/TimeslotView";
import SettingsView from "./views/settings/SettingsView";

import api from "./api";
import auth from "./auth";

import { ThemeProvider } from "@material-ui/core/styles";
import { MUI_THEME } from "./colorscheme";

import { AlertSnackbarProvider } from "./components/alertsnackbar";
import Header from "./components/header/Header";

// eslint-disable-next-line
const withHeader = (Component: any) => {
  // eslint-disable-next-line
  return (props: any) => (
    <>
      <header>
        <Header />
      </header>
      <Component {...props} />
    </>
  );
};

const App: React.SFC = () => {
  // const { incidentSnackbar, displayAlertSnackbar } = useAlertSnackbar();

  const history = useHistory();
  api.registerUnauthorizedCallback(() => {
    console.log("Unauthorized response recieved, logging out!");
    auth.logout();
    history.push("/login");
  });

  return (
    <div>
      <ThemeProvider theme={MUI_THEME}>
        <AlertSnackbarProvider>
          <Switch>
            <ProtectedRoute exact path="/" component={withHeader(IncidentView)} />
            <ProtectedRoute path="/incidents/:pk" component={withHeader(IncidentDetailsView)} />
            <ProtectedRoute exact path="/incidents" component={withHeader(IncidentView)} />
            <ProtectedRoute path="/notificationprofiles" component={withHeader(NotificationProfileView)} />
            <ProtectedRoute path="/timeslots" component={withHeader(TimeslotView)} />
            <ProtectedRoute path="/settings" component={withHeader(SettingsView)} />
            <ProtectedRoute path="/filters" component={withHeader(FiltersView)} />
            <Route path="/login" component={LoginView} />
            <Route
              path="*"
              component={() => (
                <div id="not-found">
                  <h1>404 not found</h1>
                </div>
              )}
            />
          </Switch>
        </AlertSnackbarProvider>
      </ThemeProvider>
    </div>
  );
};

export default App;
