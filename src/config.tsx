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
export const USE_24H_TIME = true;
