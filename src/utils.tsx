import moment from "moment";
import api, { Alert, User, Token } from "./api";
import auth from "./auth";

export interface AlertWithFormattedTimestamp extends Alert {
  formattedTimestamp: string;
}

export function alertWithFormattedTimestamp(alert: Alert): AlertWithFormattedTimestamp {
  return {
    ...alert,
    formattedTimestamp: moment(alert.timestamp).format("YYYY.MM.DD  hh:mm:ss"),
  };
}

export async function loginAndSetUser(token: Token): Promise<void> {
  return auth.login(token, () => {
    api
      .authGetUser()
      .then((user: User) => {
        const userName: string = user.first_name.split(" ")[0];
        localStorage.setItem("user", userName);
      })
      .catch((error) => {
        console.log("error", error);
      });
  });
}

export function calculateTableCellWidth(cellString: string, cssMagicSpacing: number = 10): number {
  return cssMagicSpacing * cellString.length;
}

export function objectGetPropertyByPath(obj: object, path: string): any {
  return objectGetPropertyByPathArray(obj, path.split("."));
}

export function objectGetPropertyByPathArray(obj: any, path: string[]): any {
  return path.reduce((obj: any, property: string): any => obj[property], obj);
}
