import React from 'react';
import './Header.css';
import auth from '../../auth';
import aaslogo from '../../Media/img//logo/logo_white.svg';
import { withRouter } from 'react-router-dom';

function Userbutton() {
  if (localStorage.getItem('user')) {
    return (
      <div id='userbutton' className='headerbutton'>
        <p>{localStorage.getItem('user')}</p>
      </div>
    );
  } else {
    return (
      <a id='loginbutton' className='headerbutton' href='/login'>
        <p>Login</p>
      </a>
    );
  }
}

const Header: React.FC<{ history: any }> = props => {
  return (
    <div className='header'>
      <a href='/'>
        <img src={aaslogo} alt='AAS logo' className='logo' />
      </a>
      <a id='aboutbutton' className='headerbutton' href='/about'>
        <p>About</p>
      </a>
      <button
        className='headerbutton'
        onClick={() => {
          auth.logout(() => {
            props.history.push('/login');
          });
        }}>
        Logout
      </button>
      <Userbutton />
    </div>
  );
};

export default withRouter(Header);
