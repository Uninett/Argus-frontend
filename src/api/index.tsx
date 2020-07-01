import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance, AxiosError } from "axios";

import auth from "../auth";

import { BACKEND_URL } from "../config";
import { ErrorType, debuglog } from "../utils";

export interface AuthUserResponse {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface User {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export type Token = string;

const apiConfig = {
  returnRejectedPromiseOnError: false,
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

export const EmptyFilterDefinition = {
  sourceIds: [],
  objectTypeIds: [],
  parentObjectIds: [],
  problemTypeIds: [],
};

export type MediaAlternative = "EM" | "SM" | "SL";

export type NotificationProfilePK = number;
export interface NotificationProfileKeyed {
  timeslot: TimeslotPK;
  filters: FilterPK[];
  media: MediaAlternative[];
  active: boolean;
}

export interface NotificationProfile {
  pk: number;
  timeslot: Timeslot;
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
export type GetNotificationProfileRequest = Pick<NotificationProfileRequest, "timeslot">;
export type DeleteNotificationProfileRequest = Pick<NotificationProfileRequest, "timeslot">;

export type FilterRequest = Omit<Filter, "pk">;
export type FilterSuccessResponse = Filter;

export type Resolver<T, P> = (data: T) => P;

export function defaultResolver<T, P = T>(data: T): T {
  return data;
}

export type ApiErrorType = ErrorType | AxiosError;
export type ErrorCreator = (error: ApiErrorType) => Error;

export function defaultError(error: ErrorType): Error {
  return new Error(`${error}`);
}

export function defaultErrorHandler(callback?: (message: string) => void): (error: Error) => void {
  return (error: Error) => {
    console.log("[API] Got Error", error);
    callback && callback(error.message);
  };
}

function resolveOrReject<T, P = T>(
  promise: Promise<AxiosResponse<T>>,
  resolver: Resolver<T, P>,
  errorCreator: ErrorCreator,
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
  token?: string;
  config: AxiosRequestConfig;

  public constructor(config?: AxiosRequestConfig) {
    this.config = config || apiConfig;
    this.api = axios.create(this.config);
    this.token = auth.token();

    this.registerUnauthorizedCallback(() => {
      debuglog("Unauthorized response recieved, logging out!");
      auth.logout();
    });
  }

  // eslint-disable-next-line
  public registerUnauthorizedCallback(callback: (response: AxiosResponse, error: ErrorType) => void) {
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error && error.response) {
          debuglog(error);
          const { status } = error.response;
          if (status === 401) {
            callback(error.response, error);
          }
        }
        return Promise.reject(error);
      },
    );
  }

  // @deprecated
  public useAuthToken(token: string): void {
    this.token = token;
  }

  // userpassAuth: returns token on success, null on failure
  public userpassAuth(username: string, password: string): Promise<Token> {
    return resolveOrReject(
      this.post<AuthTokenSuccessResponse, AuthTokenRequest>("/api/v1/token-auth/", { username, password }),
      (data: AuthTokenSuccessResponse) => data.token,
      defaultError,
    );
  }

  public postLogout(): Promise<void> {
    return resolveOrReject(this.authGet<void, {}>("/api/v1/auth/logout/"), defaultResolver, defaultError);
  }

  // authUser: returns the information about an authenticated user
  public authGetUser(): Promise<User> {
    return resolveOrReject(
      this.authGet<User, {}>("/api/v1/auth/user/"),
      defaultResolver,
      (error) => new Error(`Failed to get user: ${error}`),
    );
  }

  // NotificationProfile
  public getNotificationProfile(timeslot: TimeslotPK): Promise<NotificationProfile> {
    return resolveOrReject(
      this.authGet<NotificationProfile, GetNotificationProfileRequest>(`/api/v1/notificationprofile/${timeslot}`),
      defaultResolver,
      (error) => new Error(`Failed to get notification profile: ${error}`),
    );
  }

  public getAllNotificationProfiles(): Promise<NotificationProfile[]> {
    return resolveOrReject(
      this.authGet<NotificationProfile[], GetNotificationProfileRequest>(`/api/v1/notificationprofiles/`),
      defaultResolver,
      (error) => new Error(`Failed to get notification profiles: ${error}`),
    );
  }

  public putNotificationProfile(
    timeslot: TimeslotPK,
    filters: FilterPK[],
    media: MediaAlternative[],
    active: boolean,
  ): Promise<NotificationProfile> {
    return resolveOrReject(
      this.authPut<NotificationProfileSuccessResponse, NotificationProfileRequest>(
        `/api/v1/notificationprofiles/${timeslot}`,
        {
          timeslot: timeslot,
          filters,
          media,
          active,
        },
      ),
      defaultResolver,
      (error) => new Error(`Failed to update notification profile ${timeslot}: ${error}`),
    );
  }

  public postNotificationProfile(
    timeslot: TimeslotPK,
    filters: FilterPK[],
    media: MediaAlternative[],
    active: boolean,
  ): Promise<NotificationProfile> {
    return resolveOrReject(
      this.authPost<NotificationProfileSuccessResponse, NotificationProfileRequest>(`/api/v1/notificationprofiles/`, {
        // eslint-disable-next-line
        timeslot: timeslot,
        filters,
        media,
        active,
      }),
      defaultResolver,
      (error) => new Error(`Failed to create notification profile ${timeslot}: ${error}`),
    );
  }

  public deleteNotificationProfile(profile: NotificationProfilePK): Promise<boolean> {
    return this.authDelete<NotificationProfileSuccessResponse, DeleteNotificationProfileRequest>(
      `/api/v1/notificationprofiles/${profile}`,
    )
      .then(() => {
        return Promise.resolve(true);
      })
      .catch((error) => {
        return Promise.reject(new Error(`Failed to delete notification profile ${profile}: ${error}`));
      });
  }

  // Alert
  public getAllAlerts(): Promise<Alert[]> {
    return resolveOrReject(
      this.authGet<Alert[], never>(`/api/v1/alerts/`),
      defaultResolver,
      (error) => new Error(`Failed to get alerts: ${error}`),
    );
  }

  public getActiveAlerts(): Promise<Alert[]> {
    return resolveOrReject(
      this.authGet<Alert[], never>(`/api/v1/alerts/active/`),
      defaultResolver,
      (error) => new Error(`Failed to get alerts: ${error}`),
    );
  }

  public getAllAlertsMetadata(): Promise<AlertMetadata> {
    return resolveOrReject(
      this.authGet<AlertMetadata, never>(`/api/v1/alerts/metadata/`),
      defaultResolver,
      (error) => new Error(`Failed to get alerts metadata: ${error}`),
    );
  }

  public postFilterPreview(filterDefinition: FilterDefinition): Promise<Alert[]> {
    return resolveOrReject(
      this.authPost<Alert[], FilterDefinition>(`/api/v1/notificationprofiles/filterpreview/`, filterDefinition),
      defaultResolver,
      (error) => new Error(`Failed to get filtered alerts: ${error}`),
    );
  }

  // Filter
  public getAllFilters(): Promise<Filter[]> {
    return resolveOrReject(
      this.authGet<Filter[], never>(`/api/v1/notificationprofiles/filters/`),
      defaultResolver,
      (error) => new Error(`Failed to get notificationprofile filters: ${error}`),
    );
  }

  public postFilter(name: string, filterString: string): Promise<Filter> {
    return resolveOrReject(
      this.authPost<FilterSuccessResponse, FilterRequest>(`/api/v1/notificationprofiles/filters/`, {
        name,
        // eslint-disable-next-line
        filter_string: filterString,
      }),
      defaultResolver,
      (error) => new Error(`Failed to create notification filter ${name}: ${error}`),
    );
  }

  public deleteFilter(pk: FilterPK): Promise<void> {
    return resolveOrReject(
      this.authDelete<never, never>(`/api/v1/notificationprofiles/filters/${pk}`),
      defaultResolver,
      (error) => new Error(`Failed to delete notification filter ${pk}: ${error}`),
    );
  }

  // Timeslots
  public getAllTimeslots(): Promise<Timeslot[]> {
    return resolveOrReject(
      this.authGet<Timeslot[], never>(`/api/v1/notificationprofiles/timeslots/`),
      defaultResolver,
      (error) => new Error(`Failed to get notificationprofile timeslots: ${error}`),
    );
  }

  public deleteTimeslot(timeslotPK: TimeslotPK): Promise<boolean> {
    return resolveOrReject(
      this.authDelete<boolean, never>(`/api/v1/notificationprofiles/timeslots/${timeslotPK}`),
      () => true,
      (error) => new Error(`Failed to delete notificationprofile timeslots: ${error}`),
    );
  }

  public putTimeslot(timeslotPK: TimeslotPK, name: string, timeIntervals: TimeInterval[]): Promise<Timeslot> {
    return resolveOrReject(
      this.authPut<Timeslot, Omit<Timeslot, "pk">>(`/api/v1/notificationprofiles/timeslots/${timeslotPK}`, {
        name,
        // eslint-disable-next-line
        time_intervals: timeIntervals,
      }),
      defaultResolver,
      (error) => new Error(`Failed to put notificationprofile timeslot: ${error}`),
    );
  }

  public postTimeslot(name: string, timeIntervals: TimeInterval[]): Promise<Timeslot> {
    return resolveOrReject(
      this.authPost<Timeslot, Omit<Timeslot, "pk">>(`/api/v1/notificationprofiles/timeslots/`, {
        name,
        // eslint-disable-next-line
        time_intervals: timeIntervals,
      }),
      defaultResolver,
      (error) => new Error(`Failed to post notificationprofile timeslot: ${error}`),
    );
  }

  private post<T, B, R = AxiosResponse<T>>(url: string, data?: B, config?: AxiosRequestConfig): Promise<R> {
    return this.api.post(url, data, config);
  }

  private put<T, B, R = AxiosResponse<T>>(url: string, data?: B, config?: AxiosRequestConfig): Promise<R> {
    return this.api.put(url, data, config);
  }

  private get<T, B, R = AxiosResponse<T>>(url: string, data?: B, config?: AxiosRequestConfig): Promise<R> {
    return this.api.get(url, config);
  }

  private delete<T, B, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.api.delete(url, config);
  }

  private mustBeAuthenticated<T>(ifAuthenticated: (token: Token) => Promise<T>): Promise<T> {
    const token = auth.token();
    if (auth.isAuthenticated() && token) {
      return ifAuthenticated(token);
    }
    return Promise.reject("Not authenticated");
  }

  private authPost<T, B, R = AxiosResponse<T>>(url: string, data?: B, config?: AxiosRequestConfig): Promise<R> {
    return this.mustBeAuthenticated((token: Token) =>
      this.api.post(url, data, configWithAuth(config || this.config, token)),
    );
  }

  private authPut<T, B, R = AxiosResponse<T>>(url: string, data?: B, config?: AxiosRequestConfig): Promise<R> {
    return this.mustBeAuthenticated((token: Token) =>
      this.api.put(url, data, configWithAuth(config || this.config, token)),
    );
  }

  private authGet<T, B, R = AxiosResponse<T>>(url: string, data?: B, config?: AxiosRequestConfig): Promise<R> {
    return this.mustBeAuthenticated((token: Token) => this.api.get(url, configWithAuth(config || this.config, token)));
  }

  private authDelete<T, B, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.mustBeAuthenticated((token: Token) =>
      this.api.delete(url, configWithAuth(config || this.config, token)),
    );
  }
}

export default new ApiClient(apiConfig);
