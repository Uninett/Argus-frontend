import { Cookies } from 'react-cookie';
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
