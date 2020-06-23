import React from "react";
import "./variables.css";
import "./colorscheme.css";
import AlertView from "./views/alert/AlertView";
import LoginView from "./views/login/LoginView";
import { Route, Switch, useHistory } from "react-router-dom";
import { ProtectedRoute } from "./protected.route";
import NotificationProfileView from "./views/notificationprofile/NotificationProfileView";
import FilterBuildingView from "./views/filterbuilding/FilterBuildingView";
import TimeslotView from "./views/timeslot/TimeslotView";

import api from "./api";
import auth from "./auth";

const App: React.SFC = () => {
  const history = useHistory();
  api.registerUnauthorizedCallback((reponse, error) => {
    console.log("Unauthorized response recieved, logging out!");
    auth.logout();
    history.push("/login");
  });

  return (
    <div>
      <Switch>
        <ProtectedRoute exact path="/" component={AlertView} />
        <ProtectedRoute path="/notification-profile" component={NotificationProfileView} />
        <ProtectedRoute path="/timeslots" component={TimeslotView} />
        <Route path="/login" component={LoginView} />
        <ProtectedRoute path="/customfilter" component={FilterBuildingView} />
        <Route
          path="*"
          component={() => (
            <div id="not-found">
              <h1>404 not found</h1>
            </div>
          )}
        />
      </Switch>
    </div>
  );
};

export default App;
