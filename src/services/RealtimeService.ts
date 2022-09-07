import { BACKEND_WS_URL, REALTIME_SERVICE_MAX_RETRIES } from "../config";

import type { Incident } from "../api/types.d";

export type RealtimeServiceConfig = {
  // NOT IMPLEMENTED
  restartOnFailure?: boolean;

  // NOT IMPLEMENTED
  fallbackToInterval?: boolean;

  // onIncidentsInitial: called on subscribe, where
  // a list of all incidents are provided
  onIncidentsInitial: (incidents: Incident[]) => void;

  onIncidentModified: (incident: Incident) => void;
  onIncidentRemoved: (incident: Incident) => void;
  onIncidentAdded: (incident: Incident) => void;
};

export type RealtimeServiceState = "connecting" | "opened" | "closed" | "disconnecting" | "connected" | "failed";

let numberOfRTs = 0;

// RealtimeService represents all the
// code required to add WebSockets Realtime
// incident updates.
//
// Authentication works by using the "token" cookie,
// and that should be set before using this.
export class RealtimeService {
  id: number;
  ws: WebSocket | undefined;
  config: RealtimeServiceConfig;
  state: RealtimeServiceState;

  retries: number; // times
  retryInterval: number; // seconds
  retryIntervalBackoffFactor: number;

  // eslint-disable-next-line
  reconnectInterval: ReturnType<typeof setTimeout> | undefined;

  onStateChange: (prev: RealtimeServiceState, state: RealtimeServiceState) => void;

  public constructor({ restartOnFailure = true, fallbackToInterval = true, ...params }: RealtimeServiceConfig) {
    this.id = numberOfRTs;
    numberOfRTs += 1;

    this.config = { restartOnFailure, fallbackToInterval, ...params };
    this.state = "closed";

    // JavaScript doesn't automatically bind "this" properly when using ES6 classes
    // so you have to bind it yourself.
    this.resetOnStateChange = this.resetOnStateChange.bind(this);
    this.setState = this.setState.bind(this);
    this.resetRetry = this.resetRetry.bind(this);

    this.checkConnection = this.checkConnection.bind(this);
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.reconnect = this.reconnect.bind(this);

    this.retries = 0;
    this.retryInterval = 1;
    this.retryIntervalBackoffFactor = 2;
    this.reconnectInterval = undefined;

    this.onStateChange = () => undefined;
  }

  public resetOnStateChange() {
    this.onStateChange = () => undefined;
  }

  private setState(state: RealtimeServiceState) {
    this.onStateChange(this.state, state);
    this.state = state;
  }

  public setConfig(updatedConfig: Partial<RealtimeServiceConfig>) {
    this.config = { ...this.config, ...updatedConfig };
  }

  public checkConnection() {
    console.debug(`[RealtimeService ${this.id}] checking connection`);
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.setState("closed");
      this.connect();
    }
  }

  private resetRetry() {
    this.retryInterval = 1;
    type ClearTimeoutParams = Parameters<typeof clearTimeout>;
    clearTimeout(this.reconnectInterval as ClearTimeoutParams[0]);
    this.reconnectInterval = undefined;
  }

  private reconnect() {
    this.retries++;
    this.retryInterval *= this.retryIntervalBackoffFactor;
    type ClearTimeoutParams = Parameters<typeof clearTimeout>;
    clearTimeout(this.reconnectInterval as ClearTimeoutParams[0]);
    this.connect();
  }

  public disconnect() {
    console.log(`[RealtimeService ${this.id}] closing`);
    this.resetRetry();
    this.retries = 0;
    this.setState("disconnecting");

    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }

  public connect() {
    if (this.state !== "closed" || this.ws !== undefined) {
      console.error(`[RealtimeService ${this.id}] calling connect() when there is existing ws connection. returning`);
      return;
    }

    if (this.retries > REALTIME_SERVICE_MAX_RETRIES) {
      console.error(
        `[RealtimeService ${this.id}] refusing to connected, exceeded ${REALTIME_SERVICE_MAX_RETRIES} retires`,
      );
      this.setState("failed");
      return;
    }

    this.setState("connecting");
    this.ws = undefined;

    this.retries++;

    this.ws = new WebSocket(`${BACKEND_WS_URL}/open/`);
    this.ws.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      this.setState("connected");
      this.resetRetry();

      switch (data.type) {
        case "modified":
          const modified: Incident = data.payload;
          console.debug(`[RealtimeService ${this.id}] onmessage: modified`, modified);
          this.config.onIncidentModified(modified);
          break;

        case "created":
          const added: Incident = data.payload;
          console.debug(`[RealtimeService ${this.id}] onmessage: created`, added);
          this.config.onIncidentAdded(added);
          break;

        case "deleted":
          const removed: Incident = data.payload;
          console.debug(`[RealtimeService ${this.id}] onmessage: deleted`, removed);
          this.config.onIncidentRemoved(removed);
          break;

        case "subscribed":
          const incidents: Incident[] = data.start_incidents;
          console.debug(`[RealtimeService ${this.id}] onmessage: subscribed`, incidents);
          this.config.onIncidentsInitial(incidents);
          break;

        default:
          console.error(`[RealtimeService ${this.id}] Unhandled WebSockets message type: ${data.type}`);
          break;
      }
    };
    this.ws.onopen = () => {
      console.log(`[RealtimeService ${this.id}] Realtime socket opened, state: ${this.state}`);
      if (this.state === "disconnecting") {
        return;
      }

      this.setState("opened");

      // The "subscribe" action is required to actually
      // make the server send updates. So we subscribe
      // to all updates to all incidents here.
      if (this.ws) this.ws.send(JSON.stringify({ action: "subscribe" }));
    };

    this.ws.onclose = (e: CloseEvent) => {
      // we set the state to disconnecting when we are on purpose
      // closing the connection
      if (this.state === "disconnecting") {
        console.log(`[RealtimeService ${this.id}] Realtime socket disconnected (purposefully closed)`);
      } else {
        // Was closed, but not by calling disconnect(), so we try to open it again.
        console.warn(
          `[RealtimeService ${this.id}] Realtime socket was closed: ${e.reason}, retrying in ${this.retryInterval}`,
        );
        this.reconnectInterval = setTimeout(this.reconnect, 1000 * this.retryInterval);
        this.retryInterval = this.retryInterval * this.retryIntervalBackoffFactor;
      }
      this.setState("closed");
      this.ws = undefined;
    };

    // eslint-disable-next-line
    this.ws.onerror = (e: any) => {
      console.error(`[RealtimeService ${this.id}] got error on websocket client, closing: ${e.message}`);
      if (this.ws) this.ws.close();
      this.setState("closed");
    };
  }
}
