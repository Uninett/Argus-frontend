import { Cookies } from "react-cookie";
import { globalConfig } from "./config";

const cookies = new Cookies();

class Auth {
  authenticated: boolean;
  private _token?: string;

  constructor() {
    this.authenticated = false;
  }

  login(token: string, callback?: () => void) {
    this.authenticated = true;
    this._token = token;

    cookies.set("token", token, { path: "/", secure: globalConfig.get().useSecureCookie });

    if (callback) callback();
  }

  logout(callback?: () => void) {
    try {
      cookies.remove("token", {path: "/", domain: `.${globalConfig.get().cookieDomain}`})
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

// eslint-disable-next-line import/no-anonymous-default-export
export default new Auth();
