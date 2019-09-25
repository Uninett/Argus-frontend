import React from 'react';
import './Header.css';
import navlogo from '../../Media/img/nav-logo.svg'

const Header: React.FC = () => {
  return (
    <div className='header'>
      <img src={navlogo} alt="" className='navlogo'/>
   </div>
  );
}

export default Header;
