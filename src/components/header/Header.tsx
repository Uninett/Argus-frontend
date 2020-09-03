import React from "react";
import "./Header.css";
import auth from "../../auth";
import { Link, withRouter, RouteComponentProps } from "react-router-dom";

import Logo from "../logo/Logo";

type historyType = RouteComponentProps["history"];

type UserbuttonPropsType = {
  history: historyType;
  user: string;
};

const Userbutton: React.FC<UserbuttonPropsType> = (props: UserbuttonPropsType) => {
  return (
    <div id="header-user" className="headerbutton dropdown">
      <p>{props.user}</p>
      <div className="dropdown-content">
        <Link id="header-settings" className="headerbutton" to="/settings">
          <p>Settings</p>
        </Link>
        <button
          className="headerbutton dropdown-button"
          id="header-logout"
          onClick={() => {
            auth.logout(() => props.history.push("/login"));
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
};

type HeaderPropsType = {
  history: historyType;
};

const Header: React.FC<HeaderPropsType> = ({ history }: HeaderPropsType) => {
  // TODO: Use react context
  const user = localStorage.getItem("user") || "unknown";

  return (
    <div className="header">
      <Link to="/">
        <Logo />
      </Link>
      <div id="headerbuttons">
        <Link id="header-timeslots" className="headerbutton" to="/timeslots">
          <p>Timeslots</p>
        </Link>
        <Link id="header-filters" className="headerbutton" to="/filters">
          <p>Filters</p>
        </Link>
        <Link id="header-notificationProfiles" className="headerbutton" to="/notificationprofiles">
          <p>Notification profiles</p>
        </Link>

        <Userbutton history={history} user={user} />
      </div>
    </div>
  );
};

export default withRouter(Header);
