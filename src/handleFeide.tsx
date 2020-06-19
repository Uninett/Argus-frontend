import { Cookies } from 'react-cookie';
import Axios from 'axios';
import auth from './auth';
import { BACKEND_URL } from './config'
import Api, {User} from './api'

const cookies = new Cookies();

class HandleFeide {
  async loggedIn() {
    const token = cookies.get('token');
    console.log("token", token)
    if (token !== undefined) {
        auth.login(token, () => {
          Api.authGetUser().then((user: User) => {
            localStorage.setItem('user', user.first_name.split(' ')[0]);
          }).catch(error => {
            console.log("error", error)
          })
        })
    }
  }
}
export default new HandleFeide();
