import React from "react";

import { Route, Switch } from "react-router-dom";
import { ProtectedRoute } from "./protected.route";

// CSS
import "./variables.css";
import "./colorscheme.css";

// Views
import IncidentDetailsView from "./views/incident/IncidentDetailView";
import IncidentView from "./views/incident/IncidentView";
import LoginView from "./views/login/LoginView";
import NotificationProfileView from "./views/notificationprofile/NotificationProfileView";
import TimeslotView from "./views/timeslot/TimeslotView";

// MUI
import { ThemeProvider } from "@material-ui/core/styles";

// Components
import Header from "./components/header/Header";
import ApiInterceptor from "./components/apiinterceptor";

import { MUI_THEME } from "./colorscheme";
import { AlertSnackbarProvider } from "./components/alertsnackbar";
import DestinationsView from "./views/destinations/DestinationsView";

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

const App = () => {
  return (
    <div>
      <ThemeProvider theme={MUI_THEME}>
        <AlertSnackbarProvider>
          <ApiInterceptor>
            <Switch>
              <ProtectedRoute exact path="/" component={withHeader(IncidentView)} />
              <ProtectedRoute path="/incidents/:pk" component={withHeader(IncidentDetailsView)} />
              <ProtectedRoute exact path="/incidents" component={withHeader(IncidentView)} />
              <ProtectedRoute path="/notificationprofiles" component={withHeader(NotificationProfileView)} />
              <ProtectedRoute path="/timeslots" component={withHeader(TimeslotView)} />
              <ProtectedRoute path="/destinations" component={withHeader(DestinationsView)} />
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
          </ApiInterceptor>
        </AlertSnackbarProvider>
      </ThemeProvider>
    </div>
  );
};

export default App;
