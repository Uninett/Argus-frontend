import React, { useState, useEffect } from 'react';
import './Header.css';
import auth from '../../auth';
import aaslogo from '../../Media/img//logo/logo_white.svg';
import { withRouter } from 'react-router-dom';

const Userbutton: React.FC<{ history: any }> = props => {
  const [user, setUser] = useState<any>('');

  useEffect(() => {
    setTimeout(() => {
      setUser(localStorage.getItem('user'));
    }, 10);
  }, []);

  return (
    <div id='header-user' className='headerbutton dropdown'>
      <p>{user}</p>
      <div className='dropdown-content'>
        <a
          href='/settings'
          id='header-settings'
          className='headerbutton dropdown-button'>
          <p id='header-settings' className='headerbutton dropdown-button'>
            Settings
          </p>
        </a>
        <button
          className='headerbutton dropdown-button'
          id='header-logout'
          onClick={() => {
            auth.logout(() => {
              props.history.push('/login');
            });
          }}>
          Logout
        </button>
      </div>
    </div>
  );
};

const Header: React.FC<{ history: any }> = props => {
  return (
    <div className='header'>
      <a href='/'>
        <img src={aaslogo} alt='AAS logo' className='logo' />
      </a>
      <a id='header-about' className='headerbutton' href='/about'>
        <p>About</p>
      </a>
      <Userbutton history={props.history} />
    </div>
  );
};

export default withRouter(Header);
