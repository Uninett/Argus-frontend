// type aliases
export type Timestamp = string;
export type Token = string;

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

export interface AuthTokenRequest {
  username: string;
  password: string;
}

export interface AuthTokenSuccessResponse {
  token: string;
}

/*
 * Notification profiles
 */
export type TimeRecurrenceDay = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type TimeRecurrenceDayName = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

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
  sourceSystemIds: number[];
  tags: string[];
}

export interface FilterString {
  sourceSystemIds: number[];
  tags: string[];

  // not supported by backend yet, not sure if it
  // should either. Does it even make sense?
  show_acked?: boolean;
  show?: "open" | "closed" | "both";
}

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

/*
 * Incidents
 */

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

/* Events */
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

// Internally used in components, but placed
// here because it is so widespreadly used
export type IncidentsFilterOptions = {
  acked?: boolean;
  open?: boolean;
  stateful?: boolean;
  sourceSystemIds?: number[] | string[];
  sourceSystemNames?: string[];
  tags?: string[];

  filter?: Filter["pk"];
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

/*
 * Api client types
 */
export type ApiEventType = "error" | "success";

type WithType<T extends ApiEventType, V> = V & { type: T };
type ApiEventVariants = {
  error: WithType<"error", { response: AxiosResponse; error: ErrorType }>;
  success: WithType<"success", { response: AxiosResponse }>;
};

export type ApiErrorType = ErrorType | AxiosError;
export type ErrorCreator = (error: ApiErrorType) => Error;

export type ApiEvent = ApiEventVariants["error"] | ApiEventVariants["success"];

export type ApiListener = (event: ApiEvent) => void;

export type CursorPaginationResponse<T> = {
  next: string | null;
  previous: string | null;
  results: T[];
};
