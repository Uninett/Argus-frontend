import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance, AxiosError } from "axios";

import auth from "../auth";

import { BACKEND_URL } from "../config";
import { ErrorType, debuglog } from "../utils";

export type Timestamp = string;

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

export type TimeRecurrenceDay = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export const TIME_RECURRENCE_DAY_IN_ORDER: TimeRecurrenceDay[] = [1, 2, 3, 4, 5, 6, 7];

export type TimeRecurrenceDayName = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

export const TimeRecurrenceDayNameMap: Record<TimeRecurrenceDay, TimeRecurrenceDayName> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

export const TimeRecurrenceNameDayMap: Record<TimeRecurrenceDayName, TimeRecurrenceDay> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

export interface TimeRecurrence {
  days: TimeRecurrenceDay[];
  start: string;
  end: string;
  // eslint-disable-next-line @typescript-eslint/camelcase
  all_day: boolean;
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
  sourceSystemIds: string[] | number[];
  tags: string[];
}

export interface FilterDefinition {
  sourceSystemIds: string[] | number[];
  tags: string[];
}

export const EmptyFilterDefinition = {
  sourceIds: [],
};

export type MediaAlternative = "EM" | "SM";

export type PhoneNumberPK = number;

export interface PhoneNumber {
  pk: PhoneNumberPK;
  user: number;
  phone_number: string;
}

export type PhoneNumberRequest = Omit<PhoneNumber, "pk" | "user">;
export type PhoneNumberSuccessResponse = PhoneNumber;

export type NotificationProfilePK = number;

export interface NotificationProfileKeyed {
  timeslot: TimeslotPK;
  filters: FilterPK[];
  media: MediaAlternative[];
  active: boolean;
  phone_number: PhoneNumber["pk"] | null;
}

export interface NotificationProfile {
  pk: number;
  timeslot: Timeslot;
  filters: Filter[];
  media: MediaAlternative[];
  active: boolean;
  phone_number: PhoneNumber | null;
}

export interface SourceSystem {
  pk: number;
  name: string;
  type: string;
}

export interface IncidentTag {
  added_by: number;
  added_time: Timestamp;
  tag: string;
}

export interface Incident {
  pk: number;
  start_time: string;
  end_time?: string;
  stateful: boolean;
  details_url: string;
  description: string;
  ticket_url: string;
  open: boolean;
  acked: boolean;

  source: SourceSystem;
  source_incident_id: string;

  tags: IncidentTag[];
}

export enum EventType {
  INCIDENT_START = "STA",
  INCIDENT_END = "END",
  CLOSE = "CLO",
  REOPEN = "REO",
  ACKNOWLEDGE = "ACK",
  OTHER = "OTH",
}

export interface EventTypeTuple {
  value: EventType;
  display: string;
}

export type EventActor = {
  pk: number;
  username: string;
};

export interface Event {
  pk: number;
  incident: number;
  actor: EventActor;
  timestamp: Timestamp;
  type: EventTypeTuple;
  description: string;
}

export type EventBody = {
  type: EventType;
  description: string;
};

export type EventWithoutDescriptionBody = {
  type: EventType;
};

export type IncidentTicketUrlBody = {
  ticket_url: string;
};

export interface IncidentMetadata {
  sourceSystems: SourceSystem[];
}

export type IncidentsFilterOptions = {
  acked?: boolean;
  open?: boolean;
  stateful?: boolean;
  sourceSystemIds?: number[] | string[];
  sourceSystemNames?: string[];
  tags?: string[];
  // NOT COMPLETE
};

export type NotificationProfileRequest = NotificationProfileKeyed;
export type NotificationProfileSuccessResponse = NotificationProfile;
export type GetNotificationProfileRequest = Pick<NotificationProfileRequest, "timeslot">;
export type DeleteNotificationProfileRequest = Pick<NotificationProfileRequest, "timeslot">;

export type FilterRequest = {
  name: string;
  filter_string: string;
};

export type FilterSuccessResponse = FilterRequest & { pk: number };

export interface Acknowledgement {
  pk: number;
  event: Event;
  expiration: Timestamp | undefined | null;
}

export type AcknowledgementEventBody = {
  description: string;
  timestamp: Timestamp;
};

export type AcknowledgementBody = {
  event: AcknowledgementEventBody;
  expiration: Timestamp | undefined | null;
};

export type Resolver<T, P> = (data: T) => P;

export function defaultResolver<T, P = T>(data: T): T {
  return data;
}

export type CursorPaginationResponse<T> = {
  next: string | null;
  previous: string | null;
  results: T[];
};

export function paginationResponseResolver<T, P = CursorPaginationResponse<T>>(data: CursorPaginationResponse<T>): T[] {
  return data.results;
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
    return resolveOrReject(this.authPost<void, {}>("/api/v1/auth/logout/"), defaultResolver, defaultError);
  }

  // authUser: returns the information about an authenticated user
  public authGetCurrentUser(): Promise<User> {
    return resolveOrReject(
      this.authGet<User, {}>("/api/v1/auth/user/"),
      defaultResolver,
      (error) => new Error(`Failed to get current user: ${error}`),
    );
  }

  public getUser(userPK: number): Promise<User> {
    return resolveOrReject(
      this.authGet<User, {}>(`/api/v1/auth/users/${userPK}/`),
      defaultResolver,
      (error) => new Error(`Failed to get user: ${error}`),
    );
  }

  // Phone number
  public getAllPhoneNumbers(): Promise<PhoneNumber[]> {
    return resolveOrReject(
      this.authGet<PhoneNumber[], never>(`/api/v1/auth/phone-number/`),
      defaultResolver,
      (error) => new Error(`Failed to get phone numbers: ${error}`),
    );
  }

  public putPhoneNumber(phoneNumberPK: PhoneNumberPK, phoneNumber: string): Promise<PhoneNumber> {
    return resolveOrReject(
      this.authPut<PhoneNumberSuccessResponse, PhoneNumberRequest>(`/api/v1/auth/phone-number/${phoneNumberPK}/`, {
        // eslint-disable-next-line @typescript-eslint/camelcase
        phone_number: phoneNumber,
      }),
      defaultResolver,
      (error) => new Error(`Failed to put phone number: ${error}`),
    );
  }

  public postPhoneNumber(phoneNumber: string): Promise<PhoneNumber> {
    return resolveOrReject(
      this.authPost<PhoneNumberSuccessResponse, PhoneNumberRequest>(`/api/v1/auth/phone-number/`, {
        // eslint-disable-next-line @typescript-eslint/camelcase
        phone_number: phoneNumber,
      }),
      defaultResolver,
      (error) => new Error(`Failed to create phone number ${phoneNumber}: ${error}`),
    );
  }

  public deletePhoneNumber(pk: PhoneNumberPK): Promise<void> {
    return resolveOrReject(
      this.authDelete<never, never>(`/api/v1/auth/phone-number/${pk}/`),
      defaultResolver,
      (error) => new Error(`Failed to delete phone number ${pk}: ${error}`),
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
    // eslint-disable-next-line @typescript-eslint/camelcase
    phone_number?: PhoneNumberPK | null,
  ): Promise<NotificationProfile> {
    return resolveOrReject(
      this.authPut<NotificationProfileSuccessResponse, NotificationProfileRequest>(
        `/api/v1/notificationprofiles/${timeslot}/`,
        {
          timeslot: timeslot,
          filters,
          media,
          active,
          // eslint-disable-next-line @typescript-eslint/camelcase
          phone_number: phone_number || null,
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
    // eslint-disable-next-line
    phone_number?: PhoneNumberPK | null,
  ): Promise<NotificationProfile> {
    return resolveOrReject(
      this.authPost<NotificationProfileSuccessResponse, NotificationProfileRequest>(`/api/v1/notificationprofiles/`, {
        // eslint-disable-next-line
        timeslot: timeslot,
        filters,
        media,
        active,
        // eslint-disable-next-line
        phone_number: phone_number || null,
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

  public postIncidentReopenEvent(pk: number): Promise<Event> {
    return resolveOrReject(
      this.authPost<Event, EventWithoutDescriptionBody>(`/api/v1/incidents/${pk}/events/`, { type: EventType.REOPEN }),
      defaultResolver,
      (error) => new Error(`Failed to post incident reopen event: ${error}`),
    );
  }

  public getIncidentAcks(pk: number): Promise<Acknowledgement[]> {
    return resolveOrReject(
      this.authGet<Acknowledgement[], never>(`/api/v1/incidents/${pk}/acks/`),
      defaultResolver,
      (error) => new Error(`Failed to get incident acks: ${error}`),
    );
  }

  public getIncidentEvents(pk: number): Promise<Event[]> {
    return resolveOrReject(
      this.authGet<Event[], never>(`/api/v1/incidents/${pk}/events/`),
      defaultResolver,
      (error) => new Error(`Failed to get incident events: ${error}`),
    );
  }

  public postIncidentCloseEvent(pk: number, description?: string): Promise<Event> {
    return resolveOrReject(
      this.authPost<Event, EventBody | EventWithoutDescriptionBody>(
        `/api/v1/incidents/${pk}/events/`,
        description
          ? {
              type: EventType.CLOSE,
              description,
            }
          : { type: EventType.CLOSE },
      ),
      defaultResolver,
      (error) => new Error(`Failed to post incident close event: ${error}`),
    );
  }

  public patchIncidentTicketUrl(pk: number, ticketUrl: string): Promise<IncidentTicketUrlBody> {
    return resolveOrReject(
      this.authPut<IncidentTicketUrlBody, IncidentTicketUrlBody>(`/api/v1/incidents/${pk}/ticket_url/`, {
        // eslint-disable-next-line @typescript-eslint/camelcase
        ticket_url: ticketUrl,
      }),
      defaultResolver,
      (error) => new Error(`Failed to put incident ticket url: ${error}`),
    );
  }

  public getPaginatedIncidentsFiltered(
    filter: IncidentsFilterOptions,
    cursor: string | null,
    pageSize?: number,
  ): Promise<CursorPaginationResponse<Incident>> {
    const buildIncidentsQuery = (filter: IncidentsFilterOptions, pageSize?: number) => {
      const params = [];
      if (filter.acked !== undefined) {
        params.push(`acked=${filter.acked}`);
      }
      if (filter.open !== undefined) {
        params.push(`open=${filter.open}`);
      }
      if (filter.stateful !== undefined) {
        params.push(`stateful=${filter.stateful}`);
      }
      if (filter.sourceSystemIds !== undefined) {
        params.push(`source__id__in=${filter.sourceSystemIds.join(",")}`);
      }
      if (filter.sourceSystemNames !== undefined) {
        params.push(`source__name__in=${filter.sourceSystemNames.join(",")}`);
      }
      if (filter.tags !== undefined) {
        params.push(`tags=${filter.tags.join(",")}`);
      }
      if (pageSize !== undefined) {
        params.push(`page_size=${pageSize}`);
      }

      if (params.length === 0) return "";
      return "?" + params.join("&");
    };

    if (!cursor) {
      const queryString = buildIncidentsQuery(filter, pageSize);

      return resolveOrReject(
        this.authGet<CursorPaginationResponse<Incident>, never>(`/api/v1/incidents/${queryString}`),
        defaultResolver,
        (error) => new Error(`Failed to get incidents: ${error}`),
      );
    } else {
      return resolveOrReject(
        this.authGet<CursorPaginationResponse<Incident>, never>(cursor),
        defaultResolver,
        (error) => new Error(`Failed to get incidents: ${error}`),
      );
    }
  }

  // NOTE: This won't actually get all incidents anymore because of the pagination
  // TODO: Remove all use of this method.
  public getAllIncidentsFiltered(filter: IncidentsFilterOptions): Promise<Incident[]> {
    return this.getPaginatedIncidentsFiltered(filter, null).then(paginationResponseResolver);
  }

  public getAllIncidents(): Promise<Incident[]> {
    return resolveOrReject(
      this.authGet<CursorPaginationResponse<Incident>, never>(`/api/v1/incidents/`),
      paginationResponseResolver,
      (error) => new Error(`Failed to get incidents: ${error}`),
    );
  }

  public getOpenIncidents(): Promise<Incident[]> {
    return resolveOrReject(
      this.authGet<CursorPaginationResponse<Incident>, never>(`/api/v1/incidents/open/`),
      paginationResponseResolver,
      (error) => new Error(`Failed to get incidents: ${error}`),
    );
  }

  public getOpenUnAckedIncidents(): Promise<Incident[]> {
    return resolveOrReject(
      this.authGet<CursorPaginationResponse<Incident>, never>(`/api/v1/incidents/open+unacked/`),
      paginationResponseResolver,
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
      this.authGet<FilterSuccessResponse[], never>(`/api/v1/notificationprofiles/filters/`),
      (resps: FilterSuccessResponse[]): Filter[] =>
        resps.map(
          (resp: FilterSuccessResponse): Filter => {
            const definition: FilterDefinition = JSON.parse(resp.filter_string);

            return {
              pk: resp.pk,
              name: resp.name,
              ...definition,
            };
          },
        ),
      (error) => new Error(`Failed to get notificationprofile filters: ${error}`),
    );
  }

  public postFilter(name: string, definition: FilterDefinition): Promise<FilterSuccessResponse> {
    return resolveOrReject(
      this.authPost<FilterSuccessResponse, FilterRequest>(`/api/v1/notificationprofiles/filters/`, {
        name,
        // This is really ugly
        // eslint-disable-next-line
        filter_string: JSON.stringify(definition) as string,
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
        // eslint-disable-next-line @typescript-eslint/camelcase
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
        // eslint-disable-next-line @typescript-eslint/camelcase
        time_recurrences: timeRecurrences,
      }),
      defaultResolver,
      (error) => new Error(`Failed to post notificationprofile timeslot: ${error}`),
    );
  }

  // Acknowledgements
  public postAck(incidentPK: number, ack: AcknowledgementBody): Promise<Acknowledgement> {
    return resolveOrReject(
      this.authPost<Acknowledgement, AcknowledgementBody>(`/api/v1/incidents/${incidentPK}/acks/`, ack),
      defaultResolver,
      (error) => new Error(`Failed to post incident ack: ${error}`),
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

  private authPatch<T, B, R = AxiosResponse<T>>(url: string, data?: B, config?: AxiosRequestConfig): Promise<R> {
    return this.mustBeAuthenticated((token: Token) =>
      this.api.patch(url, data, configWithAuth(config || this.config, token)),
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
