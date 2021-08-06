export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
export const ENABLE_WEBSOCKETS_SUPPORT = process.env.REACT_APP_ENABLE_WEBSOCKETS_SUPPORT === "true" || false;
export const BACKEND_WS_URL = process.env.REACT_APP_BACKEND_WS_URL || "";
export const USE_SECURE_COOKIE = process.env.REACT_APP_USE_SECURE_COOKIE !== "false";
export const DEBUG = process.env.REACT_APP_DEBUG === "true" || false;
export const FRONTEND_VERSION = require('../package.json').version;
export const API_VERSION = require('../package.json').apiVersion;

let refreshInterval = 30;
if (process.env.REACT_APP_DEFAULT_AUTO_REFRESH_INTERVAL) {
  const parsedInterval = Number.parseInt(process.env.REACT_APP_DEFAULT_AUTO_REFRESH_INTERVAL);
  if (parsedInterval > 0) refreshInterval = parsedInterval;
}

export const DEFAULT_AUTO_REFRESH_INTERVAL = refreshInterval; // seconds

let rtsRetries = 7;
if (process.env.REACT_APP_REALTIME_SERVICE_MAX_RETRIES) {
  const parsedRetries = Number.parseInt(process.env.REACT_APP_REALTIME_SERVICE_MAX_RETRIES);
  if (parsedRetries > 0) rtsRetries = parsedRetries;
}

// The number of times the realtime service will try to establish
// a websocket connection, with exponential backoff, before declaring
// it a failure, and stops retrying.
export const REALTIME_SERVICE_MAX_RETRIES = rtsRetries;

// Will be replaced by user-settable config later
// NOTE: You need to update the TIMESTAMP_TIME_FORMAT
// if you want timestamps to be 24h/AM-PM
export const USE_24H_TIME = true;

// The full timestamp format should include seconds and timezone offset
// See here for format syntax: https://date-fns.org/v2.17.0/docs/format
export const TIMESTAMP_DATE_FORMAT = "yyyy-MM-dd";
export const TIMESTAMP_TIME_FORMAT = "HH:mm:ss";
export const TIMESTAMP_TIME_NO_SECONDS = "HH:mm";
export const TIMESTAMP_TIMEZONE_OFFSET_FORMAT = "xxx";

// String replacements are used on this format string to build
// the timestamp. This allows for switching of time, and disabling
// of timezone offset, etc.
export const TIMESTAMP_FORMAT = "{date} {time}{timezone_offset}";

// Flag used to toggle whether severity levels will be shown in the frontend or not
export const SHOW_SEVERITY_LEVELS = true;
