import React from "react";
import "./Header.css";
import navlogo from "../../Media/img/nav-logo.svg";
import { Store } from "../../store";
import aaslogo from '../../Media/img//logo/logo.svg'

const Header: React.FC = () => {
  const { state } = React.useContext(Store);
  console.log(state.user);

  return (
    <div className='header' >
      <img src={aaslogo} alt="" className='logo'/>
      <p className="user">{state.user}</p>
      <a id="aboutbutton" href="/about">
        <p>
        About
          </p>
        </a>
      <a id="loginbutton" href="/login">
        <p>
        Login
          </p>
        </a>
   </div>
  );
};

export default Header;
