import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance } from "axios";

import {
  Token,
  User,
  AuthTokenRequest,
  AuthTokenSuccessResponse,
  TimeslotPK,
  Timeslot,
  TimeRecurrence,
  Filter,
  FilterPK,
  FilterString,
  MediaAlternative,
  PhoneNumberPK,
  PhoneNumber,
  PhoneNumberRequest,
  PhoneNumberSuccessResponse,
  NotificationProfilePK,
  NotificationProfile,
  Incident,
  Event,
  EventType,
  EventBody,
  EventWithoutDescriptionBody,
  IncidentTicketUrlBody,
  IncidentMetadata,
  NotificationProfileRequest,
  NotificationProfileSuccessResponse,
  GetNotificationProfileRequest,
  DeleteNotificationProfileRequest,
  FilterRequest,
  FilterSuccessResponse,
  Acknowledgement,
  AcknowledgementBody,
  CursorPaginationResponse,
  ApiListener,
  Resolver,
  ErrorCreator,
  MetadataConfig,
  IncidentPK,
  BulkEventWithoutDescriptionBody,
  BulkEventBody,
  Timestamp,
} from "./types.d";

import auth from "../auth";

import { ErrorType, debuglog, formatTimestamp } from "../utils";

import { BACKEND_URL, SHOW_SEVERITY_LEVELS } from "../config";
import { getErrorCause } from "./utils";

function defaultResolver<T, P = T>(data: T): T {
  return data;
}

function paginationResponseResolver<T, P = CursorPaginationResponse<T>>(data: CursorPaginationResponse<T>): T[] {
  return data.results;
}

function defaultError(error: ErrorType): Error {
  return new Error(`${error}`);
}

function configWithAuth(config: AxiosRequestConfig, token: string) {
  const headers = { ...config.headers, Authorization: `Token ${token}` };
  config.headers = headers;
  return config;
}

type CB = (response: AxiosResponse, error: ErrorType) => void;

const apiConfig = {
  returnRejectedPromiseOnError: false,
  baseURL: BACKEND_URL,
};

class ApiClient {
  api: AxiosInstance;
  token?: string;
  config: AxiosRequestConfig;

  _listenersId: number;
  _listeners: [number, ApiListener][];

  public constructor(config?: AxiosRequestConfig) {
    this.config = config || apiConfig;
    this.api = axios.create(this.config);
    this.token = auth.token();

    this._listenersId = 1;
    this._listeners = [];

    this.registerInterceptors = this.registerInterceptors.bind(this);
  }

  private resolveOrReject<T, P = T>(
    promise: Promise<AxiosResponse<T>>,
    resolver: Resolver<T, P>,
    errorCreator: ErrorCreator,
  ): Promise<P> {
    return promise
      .then((response) => {
        const value = resolver(response.data);
        this._listeners.forEach(([, cb]: [number, ApiListener]) => cb({ type: "success", response }));
        return Promise.resolve(value);
      })
      .catch((error) => {
        const createdError = errorCreator(error);

        this._listeners.forEach(([, cb]: [number, ApiListener]) =>
          cb({ type: "error", response: error, error: createdError }),
        );

        return Promise.reject(createdError);
      });
  }

  public registerInterceptors(unauthorizedCallback: CB, serverErrorCallback: CB, pluginErrorCallback: CB) {
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error && error.response) {
          debuglog(error);

          const { status } = error.response;
          const { url } = error.response.config; // endpoint relative url that was requested
          const { data } = error.response; // error cause message
          
          if (status === 401) {
            unauthorizedCallback(error.response, error);
          } else if (status >= 500 && status <= 599) {
            serverErrorCallback(error.response, error);
          } else if (url.includes('/automatic-ticket/') && (status >= 500 && status <= 599)) {
            pluginErrorCallback(error.response, error);
          } else if (url.includes('/automatic-ticket/') && typeof data === 'string' && data.includes('No path to')) {
            pluginErrorCallback(error.response, error);
          } else if (url.includes('/automatic-ticket/')) {
            pluginErrorCallback(error.response, 'Please, create ticket manually')
          }
        }
        return Promise.reject(error);
      },
    );
  }

  public unregisterInterceptors() {
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(error);
      },
    );
  }

  public subscribe(listener: ApiListener): number {
    const id = this._listenersId;
    this._listenersId++;
    this._listeners.push([id, listener]);
    return id;
  }

  public unsubscribe(id: number): boolean {
    const index = this._listeners.findIndex((elem: [number, ApiListener]) => id === elem[0]);
    if (index === -1) {
      return false;
    }
    this._listeners.splice(index, 1);
    return true;
  }

  // @deprecated
  public useAuthToken(token: string): void {
    this.token = token;
  }

  // userpassAuth: returns token on success, null on failure
  public userpassAuth(username: string, password: string): Promise<Token> {
    return this.resolveOrReject(
      this.post<AuthTokenSuccessResponse, AuthTokenRequest>("/api/v1/token-auth/", { username, password }),
      (data: AuthTokenSuccessResponse) => data.token,
      defaultError,
    );
  }

  public postLogout(): Promise<void> {
    return this.resolveOrReject(this.authPost<void, {}>("/api/v1/auth/logout/"), defaultResolver, defaultError);
  }

  // authUser: returns the information about an authenticated user
  public authGetCurrentUser(): Promise<User> {
    return this.resolveOrReject(
      this.authGet<User, {}>("/api/v1/auth/user/"),
      defaultResolver,
      (error) => new Error(`Failed to get current user: ${getErrorCause(error)}`),
    );
  }

  public getUser(userPK: number): Promise<User> {
    return this.resolveOrReject(
      this.authGet<User, {}>(`/api/v1/auth/users/${userPK}/`),
      defaultResolver,
      (error) => new Error(`Failed to get user: ${getErrorCause(error)}`),
    );
  }

  // Phone number
  public getAllPhoneNumbers(): Promise<PhoneNumber[]> {
    return this.resolveOrReject(
      this.authGet<PhoneNumber[], never>(`/api/v1/auth/phone-number/`),
      defaultResolver,
      (error) => new Error(`Failed to get phone numbers: ${getErrorCause(error)}`),
    );
  }

  public putPhoneNumber(phoneNumberPK: PhoneNumberPK, phoneNumber: string): Promise<PhoneNumber> {
    return this.resolveOrReject(
      this.authPut<PhoneNumberSuccessResponse, PhoneNumberRequest>(`/api/v1/auth/phone-number/${phoneNumberPK}/`, {
        // eslint-disable-next-line @typescript-eslint/camelcase
        phone_number: phoneNumber,
      }),
      defaultResolver,
      (error) => new Error(`Failed to put phone number: ${getErrorCause(error)}`),
    );
  }

  public postPhoneNumber(phoneNumber: string): Promise<PhoneNumber> {
    return this.resolveOrReject(
      this.authPost<PhoneNumberSuccessResponse, PhoneNumberRequest>(`/api/v1/auth/phone-number/`, {
        // eslint-disable-next-line @typescript-eslint/camelcase
        phone_number: phoneNumber,
      }),
      defaultResolver,
      (error) => new Error(`Failed to create phone number ${phoneNumber}: ${getErrorCause(error)}`),
    );
  }

  public deletePhoneNumber(pk: PhoneNumberPK): Promise<void> {
    return this.resolveOrReject(
      this.authDelete<never, never>(`/api/v1/auth/phone-number/${pk}/`),
      defaultResolver,
      (error) => new Error(`Failed to delete phone number ${pk}: ${getErrorCause(error)}`),
    );
  }

  // NotificationProfile
  public getNotificationProfile(timeslot: TimeslotPK): Promise<NotificationProfile> {
    return this.resolveOrReject(
      this.authGet<NotificationProfile, GetNotificationProfileRequest>(`/api/v1/notificationprofile/${timeslot}/`),
      defaultResolver,
      (error) => new Error(`Failed to get notification profile: ${getErrorCause(error)}`),
    );
  }

  public getAllNotificationProfiles(): Promise<NotificationProfile[]> {
    return this.resolveOrReject(
      this.authGet<NotificationProfile[], GetNotificationProfileRequest>(`/api/v1/notificationprofiles/`),
      defaultResolver,
      (error) => new Error(`Failed to get notification profiles: ${getErrorCause(error)}`),
    );
  }

  public putNotificationProfile(
    profilePK: NotificationProfilePK,
    timeslot: TimeslotPK,
    filters: FilterPK[],
    media: MediaAlternative[],
    active: boolean,
    // eslint-disable-next-line @typescript-eslint/camelcase
    phone_number?: PhoneNumberPK | null,
  ): Promise<NotificationProfile> {
    return this.resolveOrReject(
      this.authPut<NotificationProfileSuccessResponse, NotificationProfileRequest>(
        `/api/v1/notificationprofiles/${profilePK}/`,
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
      (error) => new Error(`Failed to update notification profile ${profilePK}: ${getErrorCause(error)}`),
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
    return this.resolveOrReject(
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
      (error) => new Error(`Failed to create notification profile ${timeslot}: ${getErrorCause(error)}`),
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
        return Promise.reject(new Error(`Failed to delete notification profile ${profile}: ${getErrorCause(error)}`));
      });
  }

  public postIncidentReopenEvent(pk: number): Promise<Event> {
    return this.resolveOrReject(
      this.authPost<Event, EventWithoutDescriptionBody>(`/api/v1/incidents/${pk}/events/`, { type: EventType.REOPEN }),
      defaultResolver,
      (error) => {
        throw new Error(`Failed to post incident reopen event: ${getErrorCause(error)}`)
      },
    );
  }

  public getIncidentAcks(pk: number): Promise<Acknowledgement[]> {
    return this.resolveOrReject(
      this.authGet<Acknowledgement[], never>(`/api/v1/incidents/${pk}/acks/`),
      defaultResolver,
      (error) => new Error(`Failed to get incident acks: ${getErrorCause(error)}`),
    );
  }

  public getIncidentEvents(pk: number): Promise<Event[]> {
    return this.resolveOrReject(
      this.authGet<Event[], never>(`/api/v1/incidents/${pk}/events/`),
      defaultResolver,
      (error) => new Error(`Failed to get incident events: ${getErrorCause(error)}`),
    );
  }

  public postIncidentCloseEvent(pk: number, description?: string): Promise<Event> {
    return this.resolveOrReject(
      this.authPost<Event, EventBody | EventWithoutDescriptionBody>(
        `/api/v1/incidents/${pk}/events/`,
        description
          ? {
              type: EventType.CLOSE,
              description
            }
          : { type: EventType.CLOSE },
      ),
      defaultResolver,
      (error) => new Error(`Failed to post incident close event: ${getErrorCause(error)}`),
    );
  }

  public patchIncidentTicketUrl(pk: number, ticketUrl: string): Promise<IncidentTicketUrlBody> {
    return this.resolveOrReject(
      this.authPut<IncidentTicketUrlBody, IncidentTicketUrlBody>(`/api/v1/incidents/${pk}/ticket_url/`, {
        // eslint-disable-next-line @typescript-eslint/camelcase
        ticket_url: ticketUrl,
      }),
      defaultResolver,
      (error) => new Error(`Failed to put incident ticket url: ${getErrorCause(error)}`),
    );
  }

  public putCreateTicketEvent(incidentPK: number): Promise<IncidentTicketUrlBody> {
    return this.resolveOrReject(
        this.authPut<IncidentTicketUrlBody, never>(`/api/v2/incidents/${incidentPK}/automatic-ticket/`),
        defaultResolver,
        (error) => error,
    );
  }

  // Bulk actions on incidents
  public bulkPostIncidentReopenEvent(pks: IncidentPK[], timestamp: Timestamp): Promise<{ changes: Event }> {
    return this.resolveOrReject(
        this.authPost<{ changes: Event }, BulkEventWithoutDescriptionBody>(`/api/v2/incidents/events/bulk/`, {
          ids: pks,
          event: {
            type: EventType.REOPEN
          },
          timestamp,
        }
        ),
        defaultResolver,
        (error) => {
          throw new Error(`Failed to bulk post incident reopen event: ${getErrorCause(error)}`)
        },
    );
  }

  public bulkPostIncidentCloseEvent(pks: IncidentPK[], timestamp: Timestamp,  description?: string): Promise<{ changes: Event }> {
    return this.resolveOrReject(
        this.authPost<{ changes: Event }, BulkEventBody | BulkEventWithoutDescriptionBody>(
            `/api/v2/incidents/events/bulk/`,
            description
                ?
                {
                  ids: pks,
                  event: {
                    type: EventType.CLOSE,
                    description,
                  },
                  timestamp,
                }
                :
                {
                  ids: pks,
                  event: {
                    type: EventType.CLOSE
                  },
                  timestamp,
                },
        ),
        defaultResolver,
        (error) => new Error(`Failed to bulk post incident close event: ${getErrorCause(error)}`),
    );
  }

  public bulkPatchIncidentTicketUrl(pks: IncidentPK[], ticketUrl: string): Promise<{ changes: IncidentTicketUrlBody }> {
    return this.resolveOrReject(
        this.authPost<{ changes: IncidentTicketUrlBody }, IncidentTicketUrlBody & { ids: IncidentPK[]}>(`/api/v2/incidents/ticket_url/bulk/`, {
          // eslint-disable-next-line @typescript-eslint/camelcase
          ids: pks,
          ticket_url: ticketUrl,
        }),
        defaultResolver,
        (error) => new Error(`Failed to bulk put incident ticket url: ${getErrorCause(error)}`),
    );
  }

  public bulkPostAck(pks: IncidentPK[], ack: AcknowledgementBody): Promise<{ changes: Acknowledgement }> {
    return this.resolveOrReject(
        this.authPost<{ changes: Acknowledgement }, { ids: IncidentPK[], ack: AcknowledgementBody }>(`/api/v2/incidents/acks/bulk/`, {
          ids: pks,
          ack
        }),
        defaultResolver,
        (error) => new Error(`Failed to bulk post incident ack: ${getErrorCause(error)}`),
    );
  }

  public getPaginatedIncidentsFiltered(
    filter: Omit<Filter, "pk" | "name">,
    cursor: string | null,
    pageSize?: number,
    timeframeStart?: Date,
  ): Promise<CursorPaginationResponse<Incident>> {
    const buildIncidentsQuery = (filter: Omit<Filter, "pk" | "name">, pageSize?: number) => {
      const params = [];
      if (filter.filter.acked !== undefined) {
        params.push(`acked=${filter.filter.acked}`);
      }
      if (filter.filter.open !== undefined) {
        params.push(`open=${filter.filter.open}`);
      }
      if (filter.filter.stateful !== undefined) {
        params.push(`stateful=${filter.filter.stateful}`);
      }
      if (SHOW_SEVERITY_LEVELS && filter.filter.maxlevel !== undefined) {
        params.push(`level__lte=${filter.filter.maxlevel}`);
      }
      if (filter.filter.sourceSystemIds !== undefined) {
        params.push(`source__id__in=${filter.filter.sourceSystemIds.join(",")}`);
      }
      if (timeframeStart) {
        params.push(`start_time__gte=${formatTimestamp(timeframeStart)}`);
      }
      console.log("filter tags:", filter.filter.tags);
      if (filter.filter.tags !== undefined) {
        params.push(`tags=${filter.filter.tags.join(",")}`);
      }
      if (pageSize !== undefined) {
        params.push(`page_size=${pageSize}`);
      }

      if (params.length === 0) return "";
      return "?" + params.join("&");
    };

    if (!cursor) {
      const queryString = buildIncidentsQuery(filter, pageSize);

      return this.resolveOrReject(
        this.authGet<CursorPaginationResponse<Incident>, never>(`/api/v1/incidents/${queryString}`),
        defaultResolver,
        (error) => new Error(`Failed to get incidents: ${getErrorCause(error)}`),
      );
    } else {
      return this.resolveOrReject(
        this.authGet<CursorPaginationResponse<Incident>, never>(cursor),
        defaultResolver,
        (error) => new Error(`Failed to get incidents: ${getErrorCause(error)}`),
      );
    }
  }

  public getIncident(pk: Incident["pk"]): Promise<Incident> {
    return this.resolveOrReject(
      this.authGet<Incident, never>(`/api/v1/incidents/${pk}/`),
      defaultResolver,
      (error) => new Error(`Failed to get incident with pk=${pk}: ${getErrorCause(error)}`),
    );
  }

  public getAllIncidentsFiltered(filter: Omit<Filter, "pk" | "name">): Promise<Incident[]> {
    return this.getPaginatedIncidentsFiltered(filter, null).then(paginationResponseResolver);
  }

  public getAllIncidents(): Promise<Incident[]> {
    return this.resolveOrReject(
      this.authGet<CursorPaginationResponse<Incident>, never>(`/api/v1/incidents/`),
      paginationResponseResolver,
      (error) => new Error(`Failed to get incidents: ${getErrorCause(error)}`),
    );
  }

  public getOpenIncidents(): Promise<Incident[]> {
    return this.resolveOrReject(
      this.authGet<CursorPaginationResponse<Incident>, never>(`/api/v1/incidents/open/`),
      paginationResponseResolver,
      (error) => new Error(`Failed to get incidents: ${getErrorCause(error)}`),
    );
  }

  public getOpenUnAckedIncidents(): Promise<Incident[]> {
    return this.resolveOrReject(
      this.authGet<CursorPaginationResponse<Incident>, never>(`/api/v1/incidents/open+unacked/`),
      paginationResponseResolver,
      (error) => new Error(`Failed to get incidents: ${getErrorCause(error)}`),
    );
  }

  public getAllIncidentsMetadata(): Promise<IncidentMetadata> {
    return this.resolveOrReject(
      this.authGet<IncidentMetadata, never>(`/api/v1/incidents/metadata/`),
      defaultResolver,
      (error) => new Error(`Failed to get incidents metadata: ${getErrorCause(error)}`),
    );
  }

  public postFilterPreview(filterDefinition: FilterString): Promise<Incident[]> {
    return this.resolveOrReject(
      this.authPost<Incident[], FilterString>(`/api/v1/notificationprofiles/filterpreview/`, filterDefinition),
      defaultResolver,
      (error) => new Error(`Failed to get filtered incidents: ${getErrorCause(error)}`),
    );
  }

  // Filter
  public getAllFilters(): Promise<Filter[]> {
    return this.resolveOrReject(
      this.authGet<FilterSuccessResponse[], never>(`/api/v1/notificationprofiles/filters/`),
      (resps: FilterSuccessResponse[]): Filter[] =>
        resps.map(
          (resp: FilterSuccessResponse): Filter => {
            // NOTE: When the new "filter" field is used we don't need this
            // anymore:
            const definition: FilterString = JSON.parse(resp.filter_string);

            console.log("got all filters", resp);

            // Convert null-values to undefined to make page rerender correctly on state update
            const filter = resp.filter;
            if (filter.acked === null) {
              filter.acked = undefined;
            }
            if (filter.open === null) {
              filter.open = undefined;
            }
            if (filter.stateful === null) {
              filter.stateful = undefined;
            }
            if (filter.maxlevel === null) {
              filter.maxlevel = undefined;
            }

            filter.sourceSystemIds = definition.sourceSystemIds
            filter.tags = definition.tags

            return {
              pk: resp.pk,
              name: resp.name,
              filter: filter,
            };
          },
        ),
      (error) => new Error(`Failed to get notificationprofile filters: ${getErrorCause(error)}`),
    );
  }

  public postFilter(filter: Omit<Filter, "pk">): Promise<FilterSuccessResponse> {
    const definition: FilterString = {
      sourceSystemIds: filter.filter.sourceSystemIds ? filter.filter.sourceSystemIds : [],
      tags: filter.filter.tags ? filter.filter.tags : [],
    };

    const filterString = JSON.stringify(definition) as string;
    console.log(filterString)

    return this.resolveOrReject(
      this.authPost<FilterSuccessResponse, FilterRequest>(`/api/v1/notificationprofiles/filters/`, {
        name: filter.name,
        filter: filter.filter,
        // eslint-disable-next-line @typescript-eslint/camelcase
        filter_string: filterString,
      }),
      defaultResolver,
      (error) => new Error(`Failed to create notification filter ${filter.name}: ${getErrorCause(error)}`),
    );
  }

  public putFilter(filter: Filter): Promise<FilterSuccessResponse> {
    const definition: FilterString = {
      sourceSystemIds: filter.filter.sourceSystemIds ? filter.filter.sourceSystemIds : [],
      tags: filter.filter.tags ? filter.filter.tags : [],
    };

    const filterString = JSON.stringify(definition) as string;
    console.log(filterString)

    return this.resolveOrReject(
      this.authPut<FilterSuccessResponse, FilterRequest>(`/api/v1/notificationprofiles/filters/${filter.pk}/`, {
        name: filter.name,
        filter: filter.filter,

        // eslint-disable-next-line @typescript-eslint/camelcase
        filter_string: filterString,
      }),
      defaultResolver,
      (error) => new Error(`Failed to update notification filter ${filter.pk}: ${getErrorCause(error)}`),
    );
  }

  public deleteFilter(pk: FilterPK): Promise<void> {
    return this.resolveOrReject(
      this.authDelete<never, never>(`/api/v1/notificationprofiles/filters/${pk}/`),
      defaultResolver,
      (error) => new Error(`Failed to delete notification filter ${pk}: ${getErrorCause(error)}`),
    );
  }

  // Timeslots
  public getAllTimeslots(): Promise<Timeslot[]> {
    return this.resolveOrReject(
      this.authGet<Timeslot[], never>(`/api/v1/notificationprofiles/timeslots/`),
      defaultResolver,
      (error) => new Error(`Failed to get notificationprofile timeslots: ${getErrorCause(error)}`),
    );
  }

  public deleteTimeslot(timeslotPK: TimeslotPK): Promise<boolean> {
    return this.resolveOrReject(
      this.authDelete<boolean, never>(`/api/v1/notificationprofiles/timeslots/${timeslotPK}/`),
      () => true,
      (error) => new Error(`Failed to delete notificationprofile timeslots: ${getErrorCause(error)}`),
    );
  }

  public putTimeslot(timeslotPK: TimeslotPK, name: string, timeRecurrences: TimeRecurrence[]): Promise<Timeslot> {
    return this.resolveOrReject(
      this.authPut<Timeslot, Omit<Timeslot, "pk">>(`/api/v1/notificationprofiles/timeslots/${timeslotPK}/`, {
        name,
        // eslint-disable-next-line @typescript-eslint/camelcase
        time_recurrences: timeRecurrences,
      }),
      defaultResolver,
      (error) => new Error(`Failed to put notificationprofile timeslot: ${getErrorCause(error)}`),
    );
  }

  public postTimeslot(name: string, timeRecurrences: TimeRecurrence[]): Promise<Timeslot> {
    return this.resolveOrReject(
      this.authPost<Timeslot, Omit<Timeslot, "pk">>(`/api/v1/notificationprofiles/timeslots/`, {
        name,
        // eslint-disable-next-line @typescript-eslint/camelcase
        time_recurrences: timeRecurrences,
      }),
      defaultResolver,
      (error) => new Error(`Failed to post notificationprofile timeslot: ${getErrorCause(error)}`),
    );
  }

  // Acknowledgements
  public postAck(incidentPK: number, ack: AcknowledgementBody): Promise<Acknowledgement> {
    return this.resolveOrReject(
      this.authPost<Acknowledgement, AcknowledgementBody>(`/api/v2/incidents/${incidentPK}/acks/`, ack),
      defaultResolver,
      (error) => new Error(`Failed to post incident ack: ${getErrorCause(error)}`),
    );
  }

  public getMetadataConfig() : Promise<MetadataConfig> {
    return this.resolveOrReject(
        this.authGet<MetadataConfig, never>(`/api/`),
        defaultResolver,
        (error) =>  new Error(`Failed to get metadata config: ${getErrorCause(error)}`),
    )
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
