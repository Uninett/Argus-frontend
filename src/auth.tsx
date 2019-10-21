import { Cookies } from "react-cookie";

const cookies = new Cookies();
class Auth {
  authenticated: boolean;
  constructor() {
    this.authenticated = false;
  }

  login(cb: any) {
    this.authenticated = true;
    cb();
  }
  logout(cb: any) {
    localStorage.clear();
    cookies.remove('token'); 
    this.authenticated = false;
    cb();
  }
  isAuthenticated() {
    return this.authenticated;
  }
}
export default new Auth();
