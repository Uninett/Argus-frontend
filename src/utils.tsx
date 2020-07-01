import { useState, useEffect, Dispatch, SetStateAction } from "react";
import moment from "moment";
import api, { Alert, User, Token } from "./api";
import auth from "./auth";
import { DEBUG } from "./config";

export type ErrorType = string | Error;

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

export function identity<T>(inp: T): T {
  return inp;
}

export function removeUndefined<T>(unsafe: (T | undefined)[]): T[] {
  const safe: T[] = [];
  for (let i = 0; i < unsafe.length; i++) {
    const elem: T | undefined = unsafe[i];
    if (elem !== undefined) {
      safe.push(elem);
    }
  }
  return safe;
}

export function toMap<K extends number | string, T>(elements: T[], getter: (elem: T, index: number) => K): Map<K, T> {
  return new Map<K, T>(elements.map((elem: T, index: number): [K, T] => [getter(elem, index), elem]));
}

export function pkGetter<K, T extends { pk: K }>(elem: T): K {
  return elem.pk;
}

// From https://github.com/facebook/react/issues/15523
export function useStateWithDynamicDefault<T>(defaultVal: T): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(defaultVal);

  useEffect(() => {
    setState(defaultVal);
  }, [defaultVal]);

  return [state, setState];
}
