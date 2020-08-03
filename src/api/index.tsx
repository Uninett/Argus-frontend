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

export type TimeRecurrenceDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export const TIME_RECURRENCE_DAY_IN_ORDER: TimeRecurrenceDay[] = [0, 1, 2, 3, 4, 5, 6];

export const TimeRecurrenceDayNameMap: Record<TimeRecurrenceDay, string> = {
  0: "Monday",
  1: "Tuesday",
  2: "Wednesday",
  3: "Thursday",
  4: "Friday",
  5: "Saturday",
  6: "Sunday",
};

export interface TimeRecurrence {
  days: TimeRecurrenceDay[];
  start: string;
  end: string;
}

export type TimeslotPK = string | number; // WIP: fix this
export interface Timeslot {
  pk: number;
  name: string;
  time_recurrences: TimeRecurrence[];
}

export type FilterPK = number; // WIP: fix this
export interface Filter {
  pk: FilterPK;
  name: string;
  filter_string: string;
}

export interface FilterDefinition {
  sourceSystemIds: string[];
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

export interface SourceSystem {
  pk: number;
  name: string;
  type: string;
}

export interface IncidentObjectType {
  pk: number;
  name: string;
}

export interface IncidentObject {
  pk: number;
  name: string;
  object_id: string;
  url: string;
  type: IncidentObjectType;
}

export interface IncidentProblemType {
  pk: number;
  name: string;
  object_id: string;
  url: string;
}

export interface Incident {
  pk: number;
  timestamp: string;
  incident_id: string;
  details_url: string;
  description: string;
  ticket_url: string;
  active_state: boolean;

  source: SourceSystem;
  object: IncidentObject;
  parent_object: IncidentObject;
  problem_type: IncidentProblemType;
}

export type IncidentActiveBody = {
  active: boolean;
};

export type IncidentTicketUrlBody = {
  ticket_url: string;
};

export interface IncidentMetadata {
  sourceSystems: SourceSystem[];
  objectTypes: IncidentObjectType[];
  parentObjects: IncidentObject[];
  problemTypes: IncidentProblemType[];
}

export type NotificationProfileRequest = NotificationProfileKeyed;
export type NotificationProfileSuccessResponse = NotificationProfile;
export type GetNotificationProfileRequest = Pick<NotificationProfileRequest, "timeslot">;
export type DeleteNotificationProfileRequest = Pick<NotificationProfileRequest, "timeslot">;

export type FilterRequest = Omit<Filter, "pk">;
export type FilterSuccessResponse = Filter;

export type Timestamp = string;

export type Ack = {
  user: string;
  timestamp: Timestamp;
  message: string;
  expiresAt: Timestamp | undefined | null;
};

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
      this.authGet<NotificationProfile, GetNotificationProfileRequest>(`/api/v1/notificationprofile/${timeslot}/`),
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
        `/api/v1/notificationprofiles/${timeslot}/`,
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
      `/api/v1/notificationprofiles/${profile}/`,
    )
      .then(() => {
        return Promise.resolve(true);
      })
      .catch((error) => {
        return Promise.reject(new Error(`Failed to delete notification profile ${profile}: ${error}`));
      });
  }

  // Incident
  // WIP TODO untested
  public putIncident(incident: Incident): Promise<Incident> {
    if (Date.now() % 2 === 0) {
      return Promise.reject(new Error(`Failed to put incident`));
    }
    return Promise.resolve(incident);
    // return resolveOrReject(
    //   this.authPut<Incident, Incident>(`/api/v1/incidents/${incident.pk}`, incident),
    //   defaultResolver,
    //   (error) => new Error(`Failed to put incident: ${error}`),
    // );
  }

  public putIncidentActive(pk: number, active: boolean): Promise<Incident> {
    return resolveOrReject(
      this.authPut<Incident, IncidentActiveBody>(`/api/v1/incidents/${pk}/active/`, { active }),
      defaultResolver,
      (error) => new Error(`Failed to put incident active: ${error}`),
    );
  }

  public putIncidentTicketUrl(pk: number, ticketUrl: string): Promise<Incident> {
    return resolveOrReject(
      // eslint-disable-next-line @typescript-eslint/camelcase
      this.authPut<Incident, IncidentTicketUrlBody>(`/api/v1/incidents/${pk}/ticket_url/`, { ticket_url: ticketUrl }),
      defaultResolver,
      (error) => new Error(`Failed to put incident ticket url: ${error}`),
    );
  }

  public getAllIncidents(): Promise<Incident[]> {
    return resolveOrReject(
      this.authGet<Incident[], never>(`/api/v1/incidents/`),
      defaultResolver,
      (error) => new Error(`Failed to get incidents: ${error}`),
    );
  }

  public getActiveIncidents(): Promise<Incident[]> {
    return resolveOrReject(
      this.authGet<Incident[], never>(`/api/v1/incidents/active/`),
      defaultResolver,
      (error) => new Error(`Failed to get incidents: ${error}`),
    );
  }

  public getAllIncidentsMetadata(): Promise<IncidentMetadata> {
    return resolveOrReject(
      this.authGet<IncidentMetadata, never>(`/api/v1/incidents/metadata/`),
      defaultResolver,
      (error) => new Error(`Failed to get incidents metadata: ${error}`),
    );
  }

  public postFilterPreview(filterDefinition: FilterDefinition): Promise<Incident[]> {
    return resolveOrReject(
      this.authPost<Incident[], FilterDefinition>(`/api/v1/notificationprofiles/filterpreview/`, filterDefinition),
      defaultResolver,
      (error) => new Error(`Failed to get filtered incidents: ${error}`),
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
      this.authDelete<never, never>(`/api/v1/notificationprofiles/filters/${pk}/`),
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
      this.authDelete<boolean, never>(`/api/v1/notificationprofiles/timeslots/${timeslotPK}/`),
      () => true,
      (error) => new Error(`Failed to delete notificationprofile timeslots: ${error}`),
    );
  }

  public putTimeslot(timeslotPK: TimeslotPK, name: string, timeRecurrences: TimeRecurrence[]): Promise<Timeslot> {
    return resolveOrReject(
      this.authPut<Timeslot, Omit<Timeslot, "pk">>(`/api/v1/notificationprofiles/timeslots/${timeslotPK}/`, {
        name,
        // eslint-disable-next-line
        time_recurrences: timeRecurrences,
      }),
      defaultResolver,
      (error) => new Error(`Failed to put notificationprofile timeslot: ${error}`),
    );
  }

  public postTimeslot(name: string, timeRecurrences: TimeRecurrence[]): Promise<Timeslot> {
    return resolveOrReject(
      this.authPost<Timeslot, Omit<Timeslot, "pk">>(`/api/v1/notificationprofiles/timeslots/`, {
        name,
        // eslint-disable-next-line
        time_recurrences: timeRecurrences,
      }),
      defaultResolver,
      (error) => new Error(`Failed to post notificationprofile timeslot: ${error}`),
    );
  }

  // Acknowledgements
  // TODO implement with real API connection when backend support
  // is implemeneted.
  public postAck(ack: Ack): Promise<Ack> {
    if (Date.now() % 2 === 0) {
      return Promise.reject(new Error(`Failed to post ack`));
    }
    return Promise.resolve(ack);
  }

  public putAck(ack: Ack): Promise<Ack> {
    if (Date.now() % 2 === 0) {
      return Promise.reject(new Error(`Failed to put ack`));
    }
    return Promise.resolve(ack);
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
