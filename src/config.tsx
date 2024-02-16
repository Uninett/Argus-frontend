// Config values that must be explicitly provided in runtime-config.json
export interface RequiredConfigValues {
  backendUrl: string;
  cookieDomain: string;
}

// Config values that could be omitted in runtime-config.json and will be set to reasonable default values
export interface OptionalConfigValues {
  useSecureCookie: boolean;
  showSeverityLevels: boolean;
  enableWebsocketSupport: boolean;
  backendWSUrl: string;
  debug: boolean;
  defaultAutoRefreshInterval: number;
  realtimeServiceMaxRetries: number;
  use24hTime: boolean;
  timestampDateFormat: string;
  timestampTimeFormat: string;
  timestampTimeNoSeconds: string;
  timestampTimezoneOffsetFormat: string;
  timestampFormat: string;
}

export type EditableConfig = RequiredConfigValues & Partial<OptionalConfigValues>

export class Config {
  // Fixed values
  readonly apiVersion: string = require('../package.json').version;
  readonly frontendVersion: string = require('../package.json').version;

  // Required values
  backendUrl: string;
  cookieDomain: string;

  // Optional values
  backendWSUrl: string;
  debug: boolean;
  defaultAutoRefreshInterval: number;
  enableWebsocketSupport: boolean;
  showSeverityLevels: boolean;
  useSecureCookie: boolean;
  realtimeServiceMaxRetries: number;
  timestampDateFormat: string;
  timestampFormat: string;
  timestampTimeFormat: string;
  timestampTimeNoSeconds: string;
  timestampTimezoneOffsetFormat: string;
  use24hTime: boolean;

  constructor(config: EditableConfig) {

    if (config.backendUrl !== undefined &&
      config.cookieDomain !== undefined) {
      this.backendUrl = config.backendUrl;
      this.cookieDomain = config.cookieDomain;
    } else throw new Error("Missing one or more of the required configuration values.")

    this.useSecureCookie = config.useSecureCookie || process.env.REACT_APP_USE_SECURE_COOKIE !== "false";
    this.showSeverityLevels = config.showSeverityLevels || true;
    this.backendWSUrl = config.backendWSUrl || process.env.REACT_APP_BACKEND_WS_URL || "";
    this.debug = config.debug || process.env.REACT_APP_DEBUG === "true" || false;
    this.defaultAutoRefreshInterval = config.defaultAutoRefreshInterval || refreshInterval;
    this.enableWebsocketSupport = config.enableWebsocketSupport || process.env.REACT_APP_ENABLE_WEBSOCKETS_SUPPORT === "true" || false;
    this.realtimeServiceMaxRetries = config.realtimeServiceMaxRetries || rtsRetries;
    this.timestampFormat = config.timestampFormat || "{date} {time}{timezone_offset}";
    this.timestampTimeNoSeconds = config.timestampTimeNoSeconds || "HH:mm";
    this.timestampDateFormat = config.timestampDateFormat || "yyyy-MM-dd";
    this.timestampTimeFormat = config.timestampTimeFormat || "HH:mm:ss";
    this.timestampTimezoneOffsetFormat = config.timestampTimezoneOffsetFormat || "xxx";
    this.use24hTime = config.use24hTime || true;
  }
}

let refreshInterval = 30;
if (process.env.REACT_APP_DEFAULT_AUTO_REFRESH_INTERVAL) {
  const parsedInterval = Number.parseInt(process.env.REACT_APP_DEFAULT_AUTO_REFRESH_INTERVAL);
  if (parsedInterval > 0) refreshInterval = parsedInterval;
}

let rtsRetries = 7;
if (process.env.REACT_APP_REALTIME_SERVICE_MAX_RETRIES) {
  const parsedRetries = Number.parseInt(process.env.REACT_APP_REALTIME_SERVICE_MAX_RETRIES);
  if (parsedRetries > 0) rtsRetries = parsedRetries;
}

export const defaultRequiredConfigValues: RequiredConfigValues = {
  backendUrl: process.env.REACT_APP_BACKEND_URL || "",
  cookieDomain: process.env.REACT_APP_COOKIE_DOMAIN || document.createElement('a').hostname
}

class GlobalConfig {
  config: Config = new Config(defaultRequiredConfigValues);

  public get(): Config {
    return this.config;
  }

  public set(value: EditableConfig) {
    this.config = new Config(value);
  }
}

export let globalConfig = new GlobalConfig();
export const globalConfigUrl = "runtime-config.json";
