import React from "react";
import "./variables.css";
import "./colorscheme.css";
import AlertView from "./views/alertView/AlertView";
import LoginView from "./views/loginView/LoginView";
import { Route, Switch } from "react-router-dom";
import { ProtectedRoute } from "./protected.route";
import NotificationProfileView from "./views/notificationProfileView/NotificationProfileView";
import FilterBuildingView from "./views/filterBuildingView/filterBuildingView";
import TimeslotView from "./views/timeslotView/TimeslotView";

const App: React.SFC = () => {
  return (
    <div>
      <Switch>
        <ProtectedRoute exact path="/" component={AlertView} />
        <ProtectedRoute
          path="/notification-profile"
          component={NotificationProfileView}
        />
        <ProtectedRoute path="/timeslots" component={TimeslotView} />
        <Route path="/login" component={LoginView} />
        <ProtectedRoute path="/customfilter" component={FilterBuildingView} />
        <Route path="*" component={() => <div id="not-found"><h1>404 not found</h1></div>} />
      </Switch>
    </div>
  );
};

export default App;
