import React from "react";
import "./NotificationProfileView.css";
import { withRouter } from "react-router-dom";
import { Helmet } from "react-helmet";
import NotificationProfileList from "../../components/notificationprofile/NotificationProfileList";
import { Container } from "@material-ui/core";
import {useBackground} from "../../hooks";

const NotificationProfileView: React.FC = () => {
  useBackground("");
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
