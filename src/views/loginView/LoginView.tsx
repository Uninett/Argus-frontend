import React, { useState, useContext } from 'react';
import './LoginView.css';
import Axios from 'axios';
import { Store } from '../../store';
import auth from '../../auth';
import aaslogo from '../../Media/img/logo/logo_white.svg'

const LoginView: React.FC<any> = props => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { dispatch } = useContext(Store);

  //runs when the form is submitted. GetToken() will run and then it will redirect to AlertView
  const onSubmit = async (e: any) => {
    e.preventDefault();
    await getToken();
    if (localStorage.getItem('token')) {
      auth.login(() => {
        props.history.push('/');
      });
    }
  };

  //get Token and set localStorage with token, username and isloggedin
  const getToken = async () => {
    await Axios({
      url: 'http://127.0.0.1:8000/api-token-auth/',
      method: 'POST',
      data: { username: username, password: password }
    }).then(result => {
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', result.data.token ? username : 'null');
      localStorage.setItem('loggedin', result.data.token ? 'true' : 'false');
      dispatch({ type: 'setUser', payload: username });
      dispatch({ type: 'setToken', payload: result.data.token });
      dispatch({
        type: 'setLoggedin',
        payload: result.data.token ? true : false
      });
    });
  };

  return (
    <div>
      <div className='container'>
        <div className='login-container'>
      <img className='login-logo' src={aaslogo} alt="logo"/>
          <h1 className="login-header">Login</h1>
          <form onSubmit={onSubmit} className="login-form">
            <div>
              <input
                name={'username'}
                value={username}
                placeholder={'Email'}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div>
              <input
                name='password'
                type='password'
                value={password}
                placeholder='Password'
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button type='submit'> Log in</button>
          </form>
          <a className="login-feide" href={'http://localhost:8000/login/dataporten_feide/'}>
            login with feide
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
