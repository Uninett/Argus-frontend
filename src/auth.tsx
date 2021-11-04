import { Cookies } from "react-cookie";
import { USE_SECURE_COOKIE } from "./config";

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
    cookies.set("token", token, { path: "/", secure: USE_SECURE_COOKIE });
    console.log("COOKIES TOKEN SET: ", token, USE_SECURE_COOKIE)
    if (callback) callback();
  }
  logout(callback?: () => void) {
    // TODO: log out using `api.postLogout()`
    this.authenticated = false;
    const tokenTemp = this._token;
    this._token = undefined;
    try {
      cookies.remove("token");
      console.log("COOKIES TOKEN REMOVED: ", tokenTemp)
      localStorage.removeItem("user");
      console.log("LOCAL STORAGE USER REMOVED")
      if (callback) callback();
      console.log("LOGOUT CALLBACK CALLED: ", callback?.toString() || undefined)
    } catch (e) {
      console.log("ERROR ON LOGOUT CLEANUP: ", e)
    }
  }

  token(): string | undefined {
    const tokenTemp = cookies.get("token");
    console.log("RETURNING TOKEN FROM STORAGE: ", tokenTemp)
    return tokenTemp;
  }

  isAuthenticated() {
    const isAuthenticatedTemp = cookies.get("token") !== undefined && cookies.get("token") !== null;
    console.log("IS USER AUTHENTICATED IN STORAGE: ", isAuthenticatedTemp)
    return isAuthenticatedTemp;
  }
}
export default new Auth();
