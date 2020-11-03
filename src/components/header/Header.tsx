import React from "react";
import "./Header.css";
import auth from "../../auth";
import { Link, withRouter, RouteComponentProps } from "react-router-dom";

import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import TimeslotIcon from "@material-ui/icons/TimelapseRounded";
import FilterListRoundedIcon from "@material-ui/icons/FilterListRounded";
import NotificationsRoundedIcon from "@material-ui/icons/NotificationsRounded";
import IncidentsIcon from "@material-ui/icons/ErrorOutlineRounded";

import Logo from "../logo/Logo";

type historyType = RouteComponentProps["history"];

type UserbuttonPropsType = {
  history: historyType;
  user: string;
};

const Userbutton: React.FC<UserbuttonPropsType> = (props: UserbuttonPropsType) => {
  return (
    <div id="header-user" className="headerbutton dropdown">
      <AccountCircleIcon />
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

  const currentPath = history.location.pathname;

  const getStyleProps = (expectedPath: string) => {
    if (currentPath === expectedPath) {
      return { to: expectedPath, className: "headerbutton selected" };
    }
    return { to: expectedPath, className: "headerbutton" };
  };

  return (
    <div className="header">
      <Link id="logo" className="logo" to="/" style={{ top: 0, left: 0, right: "100%", position: "absolute" }}>
        <Logo />
      </Link>
      <div id="headerbuttons">
        <Link id="header-incidents" {...getStyleProps("/")}>
          <IncidentsIcon />
          <p>Incidents</p>
        </Link>
        <Link id="header-timeslots" {...getStyleProps("/timeslots")}>
          <TimeslotIcon />
          <p>Timeslots</p>
        </Link>
        <Link id="header-filters" {...getStyleProps("/filters")}>
          <FilterListRoundedIcon />
          <p>Filters</p>
        </Link>
        <Link id="header-notificationProfiles" {...getStyleProps("/notificationprofiles")}>
          <NotificationsRoundedIcon />
          <p>Notification profiles</p>
        </Link>

        <Userbutton history={history} user={user} />
      </div>
    </div>
  );
};

export default withRouter(Header);
