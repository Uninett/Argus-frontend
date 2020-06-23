import React from "react";
import "./Header.css";
import auth from "../../auth";
import { Link, withRouter } from "react-router-dom";

import Logo from "../logo/Logo";

const Userbutton: React.FC<{ history: any; user: string }> = (props) => {
  return (
    <div id="header-user" className="headerbutton dropdown">
      <p>{props.user}</p>
      <div className="dropdown-content">
        <button
          className="headerbutton dropdown-button"
          id="header-logout"
          onClick={() => {
            auth.logout(() => {
              props.history.push("/login");
            });
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

const Header: React.FC<{ history: any }> = (props) => {
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

        <Userbutton history={props.history} user={user} />
      </div>
    </div>
  );
};

export default withRouter(Header);
