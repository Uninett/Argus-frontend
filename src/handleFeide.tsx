import { Cookies } from 'react-cookie';
import Axios from 'axios';
import auth from './auth';
import { BACKEND_URL } from './config'
import Api, { User } from './api'
import { loginAndSetUser } from "./utils"

const cookies = new Cookies();

class HandleFeide {
  async loggedIn() {
    const token = cookies.get('token');
    if (token !== undefined) {
        await loginAndSetUser(token)
    }
  }
}
export default new HandleFeide();
