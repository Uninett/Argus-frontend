import React from "react";
import "./NotificationProfileView.css";
import { withRouter } from "react-router-dom";
import ProfileList from "../../components/profilelist/ProfileList";

const NotificationProfileView: React.FC = () => {
  return (
    <div>
      <div className="profileList-container">
        <ProfileList />
      </div>
    </div>
  );
};

export default withRouter(NotificationProfileView);
