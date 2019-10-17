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
    this.authenticated = false;
    cb();
  }
  isAuthenticated() {
    return this.authenticated;
  }
}
export default new Auth();
