import { Cookies } from "react-cookie";
import {COOKIE_DOMAIN, USE_SECURE_COOKIE} from "./config";

const cookies = new Cookies();

class Auth {
  authenticated: boolean;
  private _token?: string;

  constructor() {
    this.authenticated = false;
  }

  // feideLogin(token: string, callback?: () => void) {
  //   this.authenticated = true;
  //   this._token = token;
  //   if (callback) callback();
  // }

  login(token: string, callback?: () => void) {
    this.authenticated = true;
    this._token = token;

    cookies.set("token", token, { path: "/", secure: USE_SECURE_COOKIE });

    if (callback) callback();
  }

  logout(callback?: () => void) {
    try {
      cookies.remove("token", {path: "/", domain: `.${COOKIE_DOMAIN}`})
      cookies.remove("token", {path: "/"})
      localStorage.removeItem("user");
    } catch (e) { }

    this.authenticated = false;
    this._token = undefined;

    if (callback) callback();
  }

  token(): string | undefined {
    return this._token;
  }

  isAuthenticated() {
    return this.authenticated;
  }
}
export default new Auth();
