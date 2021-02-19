export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
export const ENABLE_WEBSOCKETS_SUPPORT = process.env.REACT_APP_ENABLE_WEBSOCKETS_SUPPORT === "true" || false;
export const BACKEND_WS_URL = process.env.REACT_APP_BACKEND_WS_URL || "";
export const USE_SECURE_COOKIE = process.env.REACT_APP_USE_SECURE_COOKIE !== "false";
export const DEBUG = process.env.REACT_APP_DEBUG === "true" || false;

let refreshInterval = 30;
if (process.env.REACT_APP_DEFAULT_AUTO_REFRESH_INTERVAL) {
  const parsedInterval = Number.parseInt(process.env.REACT_APP_DEFAULT_AUTO_REFRESH_INTERVAL);
  if (parsedInterval > 0) refreshInterval = parsedInterval;
}

export const DEFAULT_AUTO_REFRESH_INTERVAL = refreshInterval; // seconds

// Will be replaced by user-settable config later
// NOTE: You need to update the TIMESTAMP_TIME_FORMAT
// if you want timestamps to be 24h/AM-PM
export const USE_24H_TIME = true;

// The full timestamp format should include seconds and timezone offset
// See here for format syntax: https://date-fns.org/v2.17.0/docs/format
export const TIMESTAMP_DATE_FORMAT = "yyyy-MM-dd";
export const TIMESTAMP_TIME_FORMAT = "HH:mm:ss";
export const TIMESTAMP_TIME_NO_SECONDS = "HH:mm";
export const TIMESTAMP_TIMEZONE_OFFSET_FORMAT = "x";

// String replacements are used on this format string to build
// the timestamp. This allows for switching of time, and disabling
// of timezone offset, etc.
export const TIMESTAMP_FORMAT = "{date} {time}{timezone_offset}";
