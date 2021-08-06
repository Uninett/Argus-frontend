import React from "react";
import "./NotificationProfileView.css";
import { withRouter } from "react-router-dom";
import { Helmet } from "react-helmet";
import { NotificationProfileList } from "../../components/profilelist/ProfileList";
import { Container } from "@material-ui/core";

const NotificationProfileView: React.FC = () => {
  return (
    <div>
      <Helmet>
        <title>Argus | Profiles</title>
      </Helmet>
      <div className="profileList-container">
        <Container>
          <NotificationProfileList />
        </Container>
      </div>
    </div>
  );
};

export default withRouter(NotificationProfileView);
