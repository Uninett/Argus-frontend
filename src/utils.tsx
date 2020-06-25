import moment from "moment";
import api, { Alert, User, Token } from "./api";
import auth from "./auth";
import { DEBUG } from "./config";

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

export function calculateTableCellWidth(cellString: string, cssMagicSpacing = 10): number {
  return cssMagicSpacing * cellString.length;
}

// eslint-disable-next-line
export function objectGetPropertyByPathArray(obj: any, path: string[]): any {
  // eslint-disable-next-line
  return path.reduce((obj: any, property: string): any => obj[property], obj);
}

// eslint-disable-next-line
export function objectGetPropertyByPath(obj: object, path: string): any {
  return objectGetPropertyByPathArray(obj, path.split("."));
}

export function getPropertyByPathArray<T, R = string>(obj: T, path: string[]): R {
  // eslint-disable-next-line
  return path.reduce((obj: any, property: string): any => obj[property], obj);
}

// eslint-disable-next-line
export function getPropertyByPath<T>(obj: T, path: string): any {
  return objectGetPropertyByPathArray(obj, path.split("."));
}

// eslint-disable-next-line
export const debuglog = DEBUG ? console.log.bind(null, "[DEBUG]") : () => {};
