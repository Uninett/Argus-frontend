import React from 'react';
import './Header.css';
import navlogo from '../../Media/img/logo/nav-logo.svg'
import aaslogo from '../../Media/img//logo/logo (4).svg'

const Header: React.FC = () => {
  return (
    <div className='header'>
      <img src={aaslogo} alt="" className='logo'/>
   </div>
  );
}

export default Header;
