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

// FilterContent is the "new" way of storing filters
// using predefied fields, instead of storing a json
// blob of whatever contents (FilterString).
export type FilterContent = {
  sourceSystemIds?: number[];
  tags?: string[];

  open?: boolean;
  acked?: boolean;
  stateful?: boolean;
  maxlevel?: SeverityLevelNumber;
};

export type FilterPK = number; // WIP: fix this
export interface Filter {
  pk: FilterPK;
  name: string;

  filter: FilterContent;
}

export interface FilterString {
  sourceSystemIds: number[];
  tags: string[];

  // not supported by backend yet, not sure if it
  // should either. Does it even make sense?
  // show_acked?: boolean;
  // show?: "open" | "closed" | "both";
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
  pk?: NotificationProfilePK;
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

export type SeverityLevelNumber = 1 | 2 | 3 | 4 | 5;

export type SeverityLevelName = "Critical" | "High" | "Moderate" | "Low" | "Information";

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

export type IncidentPK = number;

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
  level: SeverityLevelNumber;

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

export interface BulkEventResponse {
  changes: {
    actor: EventActor;
    timestamp: Timestamp;
    type: EventTypeTuple;
    description: string;
  }
}

export type EventBody = {
  type: EventType;
  description: string;
};

export type BulkEventBody = {
  ids: IncidentPK[];
  event: {
    type: EventType;
    description: string;
  }
  timestamp: Timestamp;
};

export type EventWithoutDescriptionBody = Omit<EventBody, "description">;

export type BulkEventWithoutDescriptionBody = {
  ids: IncidentPK[];
  event: {
    type: EventType;
  },
  timestamp: Timestamp;
}

export type IncidentTicketUrlBody = {
  ticket_url: string;
};

// TODO: Replace use of IncidentMetadata with /sources/
export interface IncidentMetadata {
  sourceSystems: SourceSystem[];
}

// Internally used in components, but placed
// here because it is so widespreadly used
export type IncidentsFilterOptions = {
  // acked?: boolean;
  // open?: boolean;
  // stateful?: boolean;

  sourceSystemIds?: number[] | string[];
  // sourceSystemNames?: string[];
  tags?: string[];

  filterPk?: Filter["pk"];
  filter: FilterContent;
  // NOT COMPLETE
};

export type NotificationProfileRequest = NotificationProfileKeyed;
export type NotificationProfileSuccessResponse = NotificationProfile;
export type GetNotificationProfileRequest = Pick<NotificationProfileRequest, "timeslot">;
export type DeleteNotificationProfileRequest = Pick<NotificationProfileRequest, "timeslot">;

export type FilterRequest = {
  name: string;
  filter_string: string;
  filter: FilterContent;
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
  timestamp: Timestamp;
  description: string;
};

export type BulkAcknowledgementBody = {
  ids: IncidentPK[],
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

/*
 * Internal types
 */

export type AutoUpdateMethod = "never" | "realtime" | "interval";

export interface MetadataConfig {
  'server-version': string;
  'api-version': {
    stable: string;
    unstable: string;
  };
  'jsonapi-schema': {
    stable: string;
    v1: string;
    v2: string;
  }
}
