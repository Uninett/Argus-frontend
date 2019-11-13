import React from "react";
import AlertView from "./views/alertView/AlertView";
import LoginView from "./views/loginView/LoginView";
import { Route, Switch } from "react-router-dom";
import { ProtectedRoute } from "./protected.route";
import "./variables.css";
import "./colorscheme.css";
import NotificationProfileView from "./views/notificationProfileView/NotificationProfileView";
import ActiveProfile from "./components/active-profiles/ActiveProfile";
import ProfileList from "./components/profileList/ProfileList";
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
        <Route path="/real-profile" component={ProfileList} />
        <Route path="/login" component={LoginView} />
        <Route path="/profile" component={ActiveProfile} />
        <ProtectedRoute path="/customfilter" component={FilterBuildingView} />
        <Route path="*" component={() => <h1>404 not found</h1>} />
      </Switch>
    </div>
  );
};

export default App;
