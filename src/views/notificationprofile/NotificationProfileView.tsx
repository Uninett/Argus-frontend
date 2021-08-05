import React from "react";
import "./NotificationProfileView.css";
import { withRouter } from "react-router-dom";
import ProfileList from "../../components/profilelist/ProfileList";
import { Helmet } from "react-helmet";
import { NotificationProfileCard } from "../../components/profile/Profile";
import { Container } from "@material-ui/core";

const NotificationProfileView: React.FC = () => {
  return (
    <div>
      <Helmet>
        <title>Argus | Profiles</title>
      </Helmet>
      <div className="profileList-container">
        <Container>
          <NotificationProfileCard />
        </Container>
      </div>
    </div>
  );
};

export default withRouter(NotificationProfileView);
