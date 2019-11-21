import { Cookies } from 'react-cookie';
import Axios from 'axios';
import auth from './auth';

const cookies = new Cookies();

class HandleFeide {
  async loggedIn() {
    const token = cookies.get('token');
    if (token !== undefined) {
      localStorage.setItem('token', token);
      localStorage.setItem('loggedin', 'true');
      await Axios({
        url: 'http://127.0.0.1:8000/auth/user/',
        method: 'GET',
        headers: {
          Authorization: 'Token ' + token
        }
      }).then((response: any) => {
        localStorage.setItem('user', response.data.first_name.split(' ')[0]);
        auth.login(() => {});
      });
    }
  }
}
export default new HandleFeide();
