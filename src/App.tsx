import React from "react";
import "./variables.css";
import "./colorscheme.css";
import IncidentView from "./views/incident/IncidentView";
import LoginView from "./views/login/LoginView";
import { Route, Switch, useHistory } from "react-router-dom";
import { ProtectedRoute } from "./protected.route";
import NotificationProfileView from "./views/notificationprofile/NotificationProfileView";
import FiltersView from "./views/filters/FiltersView";
import TimeslotView from "./views/timeslot/TimeslotView";

import api from "./api";
import auth from "./auth";

import { ThemeProvider } from "@material-ui/core/styles";
import { MUI_THEME } from "./colorscheme";

const App: React.SFC = () => {
  const history = useHistory();
  api.registerUnauthorizedCallback(() => {
    console.log("Unauthorized response recieved, logging out!");
    auth.logout();
    history.push("/login");
  });

  return (
    <div>
      <ThemeProvider theme={MUI_THEME}>
        <Switch>
          <ProtectedRoute exact path="/" component={IncidentView} />
          <ProtectedRoute path="/notificationprofiles" component={NotificationProfileView} />
          <ProtectedRoute path="/timeslots" component={TimeslotView} />
          <Route path="/login" component={LoginView} />
          <ProtectedRoute path="/filters" component={FiltersView} />
          <Route
            path="*"
            component={() => (
              <div id="not-found">
                <h1>404 not found</h1>
              </div>
            )}
          />
        </Switch>
      </ThemeProvider>
    </div>
  );
};

export default App;
