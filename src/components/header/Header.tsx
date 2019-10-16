import React from "react";
import "./Header.css";
import { Store } from "../../store";
import aaslogo from '../../Media/img//logo/logo_white.svg'

function Userbutton() {
  const { state } = React.useContext(Store);
  if (state.user!='' ) {
    return (<a id="loginbutton" className='headerbutton' href="/login">
    <p>
    {state.user}
      </p>
    </a>);
  }
  else {
    return (<a id="loginbutton" className='headerbutton' href="/login">
  <p>
  Login
    </p>
  </a>);}
}

const Header: React.FC = () => {
  const { state } = React.useContext(Store);
  console.log(state.user);
  console.log(state);
  
  return (
    <div className='header' >
      <a href="/">
      <img src={aaslogo} alt="AAS logo" className='logo'/>
      </a>
      <a id="aboutbutton" className='headerbutton' href="/about">
        <p>
        About
          </p>
        </a>
      <Userbutton></Userbutton>
   </div>
  );
};

export default Header;
