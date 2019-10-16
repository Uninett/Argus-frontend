<<<<<<< HEAD
import React from "react";
import "./Header.css";
import { Store } from "../../store";
import aaslogo from '../../Media/img//logo/logo_white.svg'

function Userbutton() {
  const { state } = React.useContext(Store);
  if (state.user!='' ) {
    return (<div id="userbutton" className='headerbutton' >
    <p>
    {state.user}
      </p>
    </div>);
  }
  else {
    return (<a id="loginbutton" className='headerbutton' href="/login">
  <p>
  Login
    </p>
  </a>);}
}

const Header: React.FC = () => {
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
=======
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
>>>>>>> 968b7540965343fe303912ac0487f4c91af33257
