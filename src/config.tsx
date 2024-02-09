export interface DynamicConfig {
  backendUrl: string;
  enableWebsocketSupport: boolean;
  backendWSUrl: string;
  useSecureCookie: boolean;
  debug: boolean;
  cookieDomain: string;

  defaultAutoRefreshInterval: number;
  realtimeServiceMaxRetries: number;

  use24hTime: boolean;
  timestampDateFormat: string;
  timestampTimeFormat: string;
  timestampTimeNoSeconds: string;
  timestampTimezoneOffsetFormat: string;
  timestampFormat: string;

  showSeverityLevels: boolean;
}

// Config values that are set by devs as they are determined by the state of Argus development
interface FixedConfig {
  frontendVersion: string;
  apiVersion: string;
}

export type GlobalConfigType = DynamicConfig & FixedConfig;

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

const fixedConfig: FixedConfig = {
  frontendVersion: require('../package.json').version,
  apiVersion: require('../package.json').apiVersion,
}

export const defaultConfig: GlobalConfigType = {
  ...fixedConfig,
  backendUrl: process.env.REACT_APP_BACKEND_URL || "",
  enableWebsocketSupport: process.env.REACT_APP_ENABLE_WEBSOCKETS_SUPPORT === "true" || false,
  backendWSUrl: process.env.REACT_APP_BACKEND_WS_URL || "",
  useSecureCookie: process.env.REACT_APP_USE_SECURE_COOKIE !== "false",
  debug: process.env.REACT_APP_DEBUG === "true" || false,
  cookieDomain: process.env.REACT_APP_COOKIE_DOMAIN || document.createElement('a').hostname,

  defaultAutoRefreshInterval: refreshInterval,
  realtimeServiceMaxRetries: rtsRetries,

  use24hTime: true,
  timestampDateFormat: "yyyy-MM-dd",
  timestampTimeFormat: "HH:mm:ss",
  timestampTimeNoSeconds: "HH:mm",
  timestampTimezoneOffsetFormat: "xxx",
  timestampFormat: "{date} {time}{timezone_offset}",

  showSeverityLevels: true,
};

class GlobalConfig {
  config: GlobalConfigType = defaultConfig;

  public get(): GlobalConfigType {
    return this.config;
  }

  public set(value: DynamicConfig): void {
    this.config = {...defaultConfig, ...value};
  }
}

export let globalConfig = new GlobalConfig();
export const globalConfigUrl = "./runtime-config.json";
