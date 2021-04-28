export const BACKEND_URL = "http://localhost:8000";
export const ENABLE_WEBSOCKETS_SUPPORT = true;
export const BACKEND_WS_URL = "ws://localhost:8000/ws";
export const USE_SECURE_COOKIE = false;
export const DEBUG = false;

const refreshInterval = 30;
export const DEFAULT_AUTO_REFRESH_INTERVAL = refreshInterval; // seconds

const rtsRetries = 7;

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
