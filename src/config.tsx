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
export const USE_24H_TIME = true;
