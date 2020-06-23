import React from "react";
import "./NotificationProfileView.css";
import Header from "../../components/header/Header";
import { withRouter } from "react-router-dom";
import ProfileList from "../../components/profileList/ProfileList";

const NotificationProfileView: React.FC = () => {
  return (
    <div>
      <header>
        <Header />
      </header>
      <h1>Notification Profiles</h1>
      <div className="profileList-container">
        <ProfileList />
      </div>
    </div>
  );
};

export default withRouter(NotificationProfileView);
