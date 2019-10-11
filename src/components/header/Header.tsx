import React from "react";
import "./Header.css";
import navlogo from "../../Media/img/nav-logo.svg";
import { Store } from "../../store";

const Header: React.FC = () => {
  const { state } = React.useContext(Store);
  console.log(state.user);
  return (
    <div className="header">
      <img src={navlogo} alt="" className="navlogo" />
      <p className="user">{state.user}</p>
    </div>
  );
};

export default Header;
