import React from "react";
import "./Header.css";
import aaslogo from '../../Media/img//logo/logo_white.svg'

const Header: React.FC = () => {

  return (
    <div className='header' >
      <a href="/">
      <img src={aaslogo} alt="AAS logo" className='logo'/>
      </a>
      <p className="user">{localStorage.getItem('user')}</p>
      <a id="aboutbutton" className='headerbutton' href="/about">
        <p>
        About
          </p>
        </a>
      <a id="loginbutton" className='headerbutton' href="/login">
        <p>
        Login
          </p>
        </a>
   </div>
  );
};

export default Header;
