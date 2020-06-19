import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosInstance,
} from "axios";

import { BACKEND_URL } from "./config";

export interface AuthUserResponse {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export type Token = string;

const apiConfig = {
  returnRejectedPromiseOnError: true,
  // withCredentials: true,
  baseURL: BACKEND_URL,
};

export interface AuthTokenRequest {
  username: string;
  password: string;
}

export interface AuthTokenSuccessResponse {
  token: string;
}

export interface TimeInterval {
  day: string;
  start: string;
  end: string;
}

export type TimeslotPK = string | number; // WIP: fix this
export interface Timeslot {
  pk: number;
  name: string;
  time_intervals: TimeInterval[];
}

export type FilterPK = number; // WIP: fix this
export interface Filter {
  pk: FilterPK;
  name: string;
  filter_string: string;
}

export interface FilterDefinition {
  sourceIds: string[];
  objectTypeIds: string[];
  parentObjectIds: string[];
  problemTypeIds: string[];
}

export type MediaAlternative = "Email" | "SMS" | "Slack";

export type NotificationProfilePK = number;
export interface NotificationProfileKeyed {
  time_slot: TimeslotPK;
  filters: FilterPK[];
  media: MediaAlternative[];
  active: boolean;
}

export interface NotificationProfile {
  pk: number;
  time_slot: Timeslot[];
  filters: Filter[];
  media: MediaAlternative[];
  active: boolean;
}

export interface AlertSource {
  pk: number;
  name: string;
  type: string;
}

export interface AlertObjectType {
  pk: number;
  name: string;
}

export interface AlertObject {
  pk: number;
  name: string;
  object_id: string;
  url: string;
  type: AlertObjectType;
}

export interface AlertProblemType {
  pk: number;
  name: string;
  object_id: string;
  url: string;
}

export interface Alert {
  pk: number;
  timestamp: string;
  alert_id: string;
  details_url: string;
  description: string;
  ticket_url: string;
  active_state: boolean;

  source: AlertSource;
  object: AlertObject;
  parent_object: AlertObject;
  problem_type: AlertProblemType;
}

export interface AlertMetadata {
  alertSources: AlertSource[];
  objectTypes: AlertObjectType[];
  parentObjects: AlertObject[];
  problemTypes: AlertProblemType[];
}

export type NotificationProfileRequest = NotificationProfileKeyed;
export type NotificationProfileSuccessResponse = NotificationProfile;
export type GetNotificationProfileRequest = Pick<
  NotificationProfileRequest,
  "time_slot"
>;
export type DeleteNotificationProfileRequest = Pick<
  NotificationProfileRequest,
  "time_slot"
>;

export type FilterRequest = Omit<Filter, "pk">;
export type FilterSuccessResponse = Filter;

export type Resolver<T, P> = (data: T) => P;

export function defaultResolver<T, P = T>(data: T): T {
  return data;
}

export type ErrorCreator = (error: any) => Error;

export function defaultError(error: any): Error {
  return new Error(`${error}`);
}

function resolveOrReject<T, P = T>(
  promise: Promise<AxiosResponse<T>>,
  resolver: Resolver<T, P>,
  errorCreator: ErrorCreator
): Promise<P> {
  return promise
    .then((response) => {
      const value = resolver(response.data);
      return Promise.resolve(value);
    })
    .catch((error) => {
      return Promise.reject(errorCreator(error));
    });
}

function configWithAuth(config: AxiosRequestConfig, token: string) {
  const headers = { ...config.headers, Authorization: `Token ${token}` };
  config.headers = headers;
  return config;
}

export class ApiClient {
  api: AxiosInstance;
  token: string;
  config: AxiosRequestConfig;

  public constructor(config?: AxiosRequestConfig) {
    this.config = config || apiConfig;
    this.api = axios.create(this.config);
    this.token = localStorage.getItem("token") || "default"; // FIXME: localStorage should be replaced
  }

  public useAuthToken(token: string): void {
    this.token = token;
  }

  // userpassAuth: returns token on success, null on failure
  public userpassAuth(username: string, password: string): Promise<Token> {
    return resolveOrReject(
      this.post<AuthTokenSuccessResponse, AuthTokenRequest>(
        "/api/v1/token-auth/",
        { username, password }
      ),
      (data: AuthTokenSuccessResponse) => data.token,
      defaultError
    );
  }

  // NotificationProfile
  public getNotificationProfile(
    timeSlot: TimeslotPK
  ): Promise<NotificationProfile> {
    return resolveOrReject(
      this.authGet<NotificationProfile, GetNotificationProfileRequest>(
        `/api/v1/notificationprofile/${timeSlot}`
      ),
      defaultResolver,
      (error) => new Error(`Failed to get notification profile: ${error}`)
    );
  }

  public getAllNotificationProfiles(): Promise<NotificationProfile[]> {
    return resolveOrReject(
      this.authGet<NotificationProfile[], GetNotificationProfileRequest>(
        `/api/v1/notificationprofiles/`
      ),
      defaultResolver,
      (error) => new Error(`Failed to get notification profiles: ${error}`)
    );
  }

  public putNotificationProfile(
    timeSlot: TimeslotPK,
    filters: FilterPK[],
    media: MediaAlternative[],
    active: boolean
  ): Promise<NotificationProfile> {
    return resolveOrReject(
      this.authPut<
        NotificationProfileSuccessResponse,
        NotificationProfileRequest
      >(`/api/v1/notificationprofiles/${timeSlot}`, {
        time_slot: timeSlot,
        filters,
        media,
        active,
      }),
      defaultResolver,
      (error) =>
        new Error(`Failed to update notification profile ${timeSlot}: ${error}`)
    );
  }

  public postNotificationProfile(
    timeSlot: TimeslotPK,
    filters: FilterPK[],
    media: MediaAlternative[],
    active: boolean
  ): Promise<NotificationProfile> {
    return resolveOrReject(
      this.authPost<
        NotificationProfileSuccessResponse,
        NotificationProfileRequest
      >(`/api/v1/notificationprofiles/`, {
        time_slot: timeSlot,
        filters,
        media,
        active,
      }),
      defaultResolver,
      (error) =>
        new Error(`Failed to create notification profile ${timeSlot}: ${error}`)
    );
  }

  public deleteNotificationProfile(timeSlot: TimeslotPK): Promise<boolean> {
    return this.authDelete<
      NotificationProfileSuccessResponse,
      DeleteNotificationProfileRequest
    >(`/api/v1/notificationprofiles/${timeSlot}`)
      .then((response) => {
        return Promise.resolve(true);
      })
      .catch((error) => {
        return Promise.reject(
          new Error(
            `Failed to delete notification profile ${timeSlot}: ${error}`
          )
        );
      });
  }

  // Alert
  public getAllAlerts(): Promise<Alert[]> {
    return resolveOrReject(
      this.authGet<Alert[], never>(`/api/v1/alerts/`),
      defaultResolver,
      (error) => new Error(`Failed to get alerts: ${error}`)
    );
  }

  public getActiveAlerts(): Promise<Alert[]> {
    return resolveOrReject(
      this.authGet<Alert[], never>(`/api/v1/alerts/active/`),
      defaultResolver,
      (error) => new Error(`Failed to get alerts: ${error}`)
    );
  }

  public getAllAlertsMetadata(): Promise<AlertMetadata> {
    return resolveOrReject(
      this.authGet<AlertMetadata, never>(`/api/v1/alerts/metadata/`),
      defaultResolver,
      (error) => new Error(`Failed to get alerts metadata: ${error}`)
    );
  }

  public postFilterPreview(
    filterDefinition: FilterDefinition
  ): Promise<Alert[]> {
    return resolveOrReject(
      this.authPost<Alert[], FilterDefinition>(
        `/api/v1/notificationprofiles/filterpreview/`,
        filterDefinition
      ),
      defaultResolver,
      (error) => new Error(`Failed to get filtered alerts: ${error}`)
    );
  }

  // Filter
  public getAllFilters(): Promise<Filter[]> {
    return resolveOrReject(
      this.authGet<Filter[], never>(`/api/v1/notificationprofiles/filters/`),
      defaultResolver,
      (error) =>
        new Error(`Failed to get notificationprofile filters: ${error}`)
    );
  }

  public postFilter(name: string, filterString: string): Promise<Filter> {
    return resolveOrReject(
      this.authPost<FilterSuccessResponse, FilterRequest>(
        `/api/v1/notificationprofiles/filters/`,
        { name, filter_string: filterString }
      ),
      defaultResolver,
      (error) =>
        new Error(`Failed to create notification filter ${name}: ${error}`)
    );
  }

  // Timeslots
  public getAllTimeslots(): Promise<Timeslot[]> {
    return resolveOrReject(
      this.authGet<Timeslot[], never>(
        `/api/v1/notificationprofiles/timeslots/`
      ),
      defaultResolver,
      (error) =>
        new Error(`Failed to get notificationprofile timeslots: ${error}`)
    );
  }

  public deleteTimeslot(timeslotPK: TimeslotPK): Promise<boolean> {
    return resolveOrReject(
      this.authDelete<boolean, never>(
        `/api/v1/notificationprofiles/timeslots/${timeslotPK}`
      ),
      (inp: any) => true,
      (error) =>
        new Error(`Failed to delete notificationprofile timeslots: ${error}`)
    );
  }

  private post<T, B, R = AxiosResponse<T>>(
    url: string,
    data?: B,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.api.post(url, data, config);
  }

  private put<T, B, R = AxiosResponse<T>>(
    url: string,
    data?: B,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.api.put(url, data, config);
  }

  private get<T, B, R = AxiosResponse<T>>(
    url: string,
    data?: B,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.api.get(url, config);
  }

  private delete<T, B, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.api.delete(url, config);
  }

  private authPost<T, B, R = AxiosResponse<T>>(
    url: string,
    data?: B,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.api.post(
      url,
      data,
      configWithAuth(config || this.config, this.token)
    );
  }

  private authPut<T, B, R = AxiosResponse<T>>(
    url: string,
    data?: B,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.api.put(
      url,
      data,
      configWithAuth(config || this.config, this.token)
    );
  }

  private authGet<T, B, R = AxiosResponse<T>>(
    url: string,
    data?: B,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.api.get(url, configWithAuth(config || this.config, this.token));
  }

  private authDelete<T, B, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.api.delete(
      url,
      configWithAuth(config || this.config, this.token)
    );
  }
}

export default new ApiClient(apiConfig);
