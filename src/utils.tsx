import { useState, useEffect, Dispatch, SetStateAction } from "react";

import format from "date-fns/format";
import formatDistance from "date-fns/formatDistance";

// Api
import type { Incident, User, Token } from "./api/types.d";
import api from "./api";
import auth from "./auth";

// Config
import {
  DEBUG,
  TIMESTAMP_FORMAT,
  TIMESTAMP_DATE_FORMAT,
  TIMESTAMP_TIME_FORMAT,
  TIMESTAMP_TIME_NO_SECONDS,
  TIMESTAMP_TIMEZONE_OFFSET_FORMAT,
} from "./config";

export type ErrorType = string | Error;

export interface IncidentWithFormattedTimestamp extends Incident {
  formattedTimestamp: string;
}

export function incidentWithFormattedTimestamp(incident: Incident): IncidentWithFormattedTimestamp {
  return {
    ...incident,
    formattedTimestamp: format(new Date(incident.start_time), "YYYY.MM.DD  hh:mm:ss"),
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

export type FormatTimestampOptions = Partial<{
  withSeconds: boolean;
  withTimezoneOffset: boolean;
}>;

export function formatTimestamp(timestamp: Date | string, options?: FormatTimestampOptions): string {
  /* TODO: Have (global?) setting on user to allow forcing of ISO 8601 */
  const dateTimestamp = new Date(timestamp);

  let formatString = TIMESTAMP_FORMAT;
  formatString = formatString.replace("{date}", TIMESTAMP_DATE_FORMAT);

  if (options?.withSeconds) {
    formatString = formatString.replace("{time}", TIMESTAMP_TIME_FORMAT);
  } else {
    formatString = formatString.replace("{time}", TIMESTAMP_TIME_NO_SECONDS);
  }

  if (options?.withTimezoneOffset) {
    formatString = formatString.replace("{timezone_offset}", TIMESTAMP_TIMEZONE_OFFSET_FORMAT);
  } else {
    formatString = formatString.replace("{timezone_offset}", "");
  }

  return format(dateTimestamp, formatString);
}

export function formatDuration(startTime: Date | string, endTime?: Date | string): string {
  const start = new Date(startTime);

  let end;
  if (endTime !== "infinity" && endTime) {
    end = new Date(endTime);
  } else {
    end = new Date();
  }
  return formatDistance(start, end, { addSuffix: false });
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

type LocalStorageItem<T = { [key: string]: unknown }> = { timestamp: number; value: T };

export function saveToLocalStorage<T>(key: string, data: T): boolean {
  const exists = !!window.localStorage.getItem(key);

  // Store a timestamp for easy debugging
  const item: LocalStorageItem<T> = { timestamp: new Date().getTime(), value: data };
  window.localStorage.setItem(key, JSON.stringify(item));
  return exists;
}

export function fromLocalStorageOrDefault<T>(key: string, defaultData: T, validate?: (data: T) => boolean): T {
  const data = window.localStorage.getItem(key);
  if (!data) {
    return defaultData;
  }

  const { value }: LocalStorageItem<T> = JSON.parse(data);

  if (validate && !validate(value)) {
    console.warn("LocalStorage item with key", key, "failed to validate:", value);
    return defaultData;
  }

  return value;
}
