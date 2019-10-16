import React from 'react';
import './Header.css';
import navlogo from '../../Media/img/nav-logo.svg';s

const Header: React.FC = () => {
  return (
    <div className='header'>
      <img src={navlogo} alt='' className='navlogo' />
      <p className='user'>{localStorage.getItem('user')}</p>
    </div>
  );
};

export default Header;
