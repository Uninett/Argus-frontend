import { Cookies } from "react-cookie";

const cookies = new Cookies();

class Auth {
  authenticated: boolean;
  private _token?: string

  constructor() {
    this.authenticated = false;
  }

  login(token: string, callback?: () => void) {
    this.authenticated = true;
    this._token = token
    cookies.set("token", token, { path: "/" })
    if (callback) callback();
  }
  logout(callback?: () => void) {
    this.authenticated = false;
    this._token = undefined
    cookies.remove("token")
    localStorage.removeItem("user")
    if (callback) callback();
  }

  token(): string | undefined {
    return this._token
  }

  isAuthenticated() {
    return this.authenticated;
  }
}
export default new Auth();
