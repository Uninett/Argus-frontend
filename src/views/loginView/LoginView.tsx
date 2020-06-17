import React, { useState, useContext } from 'react';
import './LoginView.css';
import Axios from 'axios';
import { Store } from '../../store';
import auth from '../../auth';
import { BACKEND_URL } from '../../config'


const LoginView: React.FC<any> = props => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginAttemptFailed, setLoginAttemptFailed] = useState(false);
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
      url: `${BACKEND_URL}/api/v1/token-auth/`,
      method: 'POST',
      data: { username: username, password: password }
    })
      .then(result => {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', result.data.token ? username : 'null');
        localStorage.setItem('loggedin', result.data.token ? 'true' : 'false');
        dispatch({ type: 'setUser', payload: username });
        dispatch({ type: 'setToken', payload: result.data.token });
        dispatch({
          type: 'setLoggedin',
          payload: result.data.token ? true : false
        });
      })
      .catch(error => {
        setLoginAttemptFailed(true);
      });
  };

  return (
    <div>
      <div className='container'>
        <div className='login-container'>
          <svg
            id='login-logo'
            viewBox='0 0 74 70'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M22.4953 47.7931L45.3656 3.0137L68.2359 47.7931H22.4953Z'
              strokeWidth='2.74152'
            />
            <path
              d='M2.39699 47.7931L25.6164 2.9796L48.8358 47.7931H2.39699Z'
              strokeWidth='2.74152'
            />
            <path
              id='login-text'
              d='M12.2135 69.5416H9.05634L8.08492 65.2743H3.67882L2.7074 69.5416H-0.438156L3.74821 52.5649H8.01553L12.2135 69.5416ZM7.49513 62.4872L6.59309 58.5553C6.57767 58.4936 6.46203 57.9308 6.24616 56.8669C6.03799 55.7952 5.91849 55.1168 5.88765 54.8315C5.77972 55.5408 5.65636 56.254 5.51759 56.971C5.37881 57.688 4.97405 59.5267 4.30331 62.4872H7.49513ZM44.7598 69.5416H41.6027L40.6313 65.2743H36.2252L35.2538 69.5416H32.1082L36.2946 52.5649H40.5619L44.7598 69.5416ZM40.0415 62.4872L39.1394 58.5553C39.124 58.4936 39.0084 57.9308 38.7925 56.8669C38.5843 55.7952 38.4648 55.1168 38.434 54.8315C38.3261 55.5408 38.2027 56.254 38.0639 56.971C37.9252 57.688 37.5204 59.5267 36.8497 62.4872H40.0415ZM68.9219 67.0321C69.5155 67.0321 69.9665 66.8702 70.2749 66.5464C70.5833 66.2226 70.7375 65.7754 70.7375 65.2049C70.7375 64.6344 70.5563 64.114 70.194 63.6437C69.8393 63.1734 69.2765 62.6761 68.5055 62.1519C67.7423 61.6276 67.1563 61.1265 66.7477 60.6485C66.3777 60.1859 66.0886 59.6694 65.8804 59.0988C65.6799 58.5206 65.5797 57.8576 65.5797 57.1097C65.5797 55.6603 65.9806 54.5116 66.7824 53.6635C67.5919 52.8154 68.6597 52.3914 69.9858 52.3914C71.3196 52.3914 72.5801 52.7538 73.7674 53.4785L72.7266 55.9995C71.7629 55.4444 70.9418 55.1669 70.2634 55.1669C69.7622 55.1669 69.3729 55.3326 69.0953 55.6642C68.8178 55.9957 68.679 56.4506 68.679 57.0288C68.679 57.5993 68.8409 58.1004 69.1647 58.5322C69.4962 58.9562 70.0706 59.4381 70.8878 59.9777C72.0057 60.7256 72.7729 61.4811 73.1892 62.2444C73.6286 63.0231 73.8484 63.902 73.8484 64.8811C73.8484 66.4616 73.4475 67.672 72.6457 68.5124C71.8516 69.3527 70.7105 69.7729 69.2225 69.7729C67.7346 69.7729 66.474 69.4838 65.4409 68.9056V65.7947C66.7053 66.6196 67.8656 67.0321 68.9219 67.0321Z'
              fill='#006D91'
            />
          </svg>
          <form onSubmit={onSubmit} id='login-form'>
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

            <button type='submit' id='login-button'>
              {' '}
              Log in
            </button>
          </form>
          <p id='login-warning'>
            {loginAttemptFailed ? 'Username and/or password is incorrect' : ''}
          </p>
          <a
            id='login-feide'
            href={`${BACKEND_URL}/oidc/login/dataporten_feide/`}
            >
            Log in with Feide
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
