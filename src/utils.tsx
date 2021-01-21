import { useState, useEffect, Dispatch, SetStateAction } from "react";
import moment from "moment";
import api, { Incident, User, Token } from "./api";
import auth from "./auth";
import { DEBUG } from "./config";

export type ErrorType = string | Error;

export interface IncidentWithFormattedTimestamp extends Incident {
  formattedTimestamp: string;
}

export function incidentWithFormattedTimestamp(incident: Incident): IncidentWithFormattedTimestamp {
  return {
    ...incident,
    formattedTimestamp: moment(incident.start_time).format("YYYY.MM.DD  hh:mm:ss"),
  };
}

export async function loginAndSetUser(token: Token): Promise<void> {
  return auth.login(token, () => {
    api
      .authGetCurrentUser()
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

export function toMapNum<T>(elements: T[], getter: (elem: T, index: number) => number): { [key: number]: T } {
  const out: { [key: number]: T } = {};
  elements.forEach((elem: T, index: number): void => {
    out[getter(elem, index)] = elem;
  });
  return out;
}

export function toMapStr<T>(elements: T[], getter: (elem: T, index: number) => string): { [key: string]: T } {
  const out: { [key: string]: T } = {};
  elements.forEach((elem: T, index: number): void => {
    out[getter(elem, index)] = elem;
  });
  return out;
}

export function groupBy<K extends number | string, T>(
  elements: T[],
  groupByGetter: (elem: T, index: number) => K,
): Map<K, Set<T>> {
  const map = new Map<K, Set<T>>();
  elements.forEach((elem: T, index: number) => {
    const group = groupByGetter(elem, index);
    if (map.has(group)) {
      const groupSet = map.get(group) || new Set();
      groupSet.add(elem);
      map.set(group, groupSet);
    } else {
      map.set(
        group,
        new Set<T>([elem]),
      );
    }
  });
  return map;
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

export function dateFromTimeOfDayString(timeOfDay: string): Date {
  const [hours, minutes, seconds] = timeOfDay.split(":").map((str: string) => Number.parseInt(str));
  return new Date(1970, 1, 1, hours, minutes, seconds);
}

export function timeOfDayFromDate(date: Date): string {
  const [hours, minutes, seconds] = [date.getHours(), date.getMinutes(), date.getSeconds()];
  return `${hours}:${minutes}:${seconds}`;
}

function pad(n: number) {
    return n<10 ? '0'+n : n;
}

function formatTimezoneOffset(timezoneOffset: number): string {
    const sign = timezoneOffset > 0 ? "-" : "+";
    const hours = pad(Math.floor(Math.abs(timezoneOffset)/60));
    const minutes = pad(Math.abs(timezoneOffset)%60);
    return sign + hours + ":" + minutes;
}

export function formatTimestamp(timestamp: Date | string): string {
  // TODO: Have (global?) setting on user to allow choosing style
  const dateTimestamp = new Date(timestamp);
  // ISO w/out T and ith local timezone: 2021-01-21 12:34:56+02:00
  const timezoneOffset = formatTimezoneOffset(dateTimestamp.getTimezoneOffset());
  const year = dateTimestamp.getFullYear();
  const month = pad(dateTimestamp.getMonth() + 1);
  const day = pad(dateTimestamp.getDate());
  const date = year + '-' + month + '-' + day;
  const hours = pad(dateTimestamp.getHours());
  const minutes = pad(dateTimestamp.getMinutes());
  const seconds = pad(dateTimestamp.getSeconds());
  const time = hours + ':' + minutes + ':' + seconds + timezoneOffset;
  return date + ' ' + time;
}

// eslint-disable-next-line @typescript-eslint/camelcase
export function formatDuration(start_time: Date | string, end_time?: Date | string): string {
  const start = moment(start_time);

  let end;
  // eslint-disable-next-line @typescript-eslint/camelcase
  if (end_time !== "infinity" && end_time) {
    end = moment(end_time);
  } else {
    end = moment.now();
  }

  return moment.duration(start.diff(end)).humanize();
}

export function truncateMultilineString(multilineString: string, length: number): string {
  const truncatedString = multilineString.split("\n", 1)[0].slice(0, length) + "…";
  if (truncatedString.length < multilineString.length) {
    return truncatedString;
  }
  return multilineString;
}

export const copyTextToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};
