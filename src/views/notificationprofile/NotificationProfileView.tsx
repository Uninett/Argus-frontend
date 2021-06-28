import React from "react";
import "./NotificationProfileView.css";
import { withRouter } from "react-router-dom";
import ProfileList from "../../components/profilelist/ProfileList";
import { Helmet } from "react-helmet";

const NotificationProfileView: React.FC = () => {
  return (
    <div>
      <Helmet>
        <title>Argus | Profiles</title>
      </Helmet>
      <div className="profileList-container">
        <ProfileList />
      </div>
    </div>
  );
};

export default withRouter(NotificationProfileView);
