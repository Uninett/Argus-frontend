import moment from "moment";
import api, { Alert, User, Token } from "./api";
import auth from "./auth"

export interface AlertWithFormattedTimestamp extends Alert {
  formattedTimestamp: string;
}

export function alertWithFormattedTimestamp(
  alert: Alert
): AlertWithFormattedTimestamp {
  return {
    ...alert,
    formattedTimestamp: moment(alert.timestamp).format("YYYY.MM.DD  hh:mm:ss"),
  };
}

export async function loginAndSetUser(token: Token): Promise<void> {
  return auth.login(token, () => {
    api.authGetUser().then((user: User) => {
      localStorage.setItem('user', user.first_name.split(' ')[0]);
    }).catch(error => {
      console.log("error", error)
    })
  })
}
