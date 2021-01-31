import { BACKEND_WS_URL } from "../config";

import { Incident } from "../api";

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

export type RealtimeServiceState = "connecting" | "opened" | "closed" | "disconnecting" | "connected";

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

  retryInterval = 1; // seconds
  retryIntervalBackoffFactor = 2;

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
    this.checkConnection = this.checkConnection.bind(this);
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);

    this.reconnectInterval = undefined;

    this.onStateChange = () => undefined;
  }

  public resetOnStateChange() {
    this.onStateChange = () => undefined;
  }

  private setState(state: RealtimeServiceState) {
    console.log(`[RTS ${this.id}] setState`, state);
    this.onStateChange(this.state, state);
    this.state = state;
  }

  public setConfig(updatedConfig: Partial<RealtimeServiceConfig>) {
    this.config = { ...this.config, ...updatedConfig };
  }

  public checkConnection() {
    console.log(`[RealtimeService ${this.id}] checking connection`);
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.setState("closed");
      this.connect();
    }
  }

  public disconnect() {
    // if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
    console.log(`[RealtimeService ${this.id}] closing`);
    if (this.reconnectInterval) {
      type ClearTimeoutParams = Parameters<typeof clearTimeout>;
      clearTimeout(this.reconnectInterval as ClearTimeoutParams[0]);
    }
    this.setState("disconnecting");
    if (this.ws) this.ws.close();
    // }
  }

  public connect() {
    /// let reconnectInterval: ReturnType<typeof setTimeout> | undefined = undefined;
    if (this.state !== "closed") {
      console.log(`[RealtimeService ${this.id}] calling connect() when there is existing ws connection. returning`);
      return;
    }

    this.setState("connecting");
    this.ws = undefined;

    const ws = new WebSocket(`${BACKEND_WS_URL}/open/`);
    ws.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      this.setState("connected");

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
    ws.onopen = () => {
      console.log(`[RealtimeService ${this.id}] Realtime socket opened`);

      this.setState("opened");
      this.ws = ws;

      // The "subscribe" action is required to actually
      // make the server send updates. So we subscribe
      // to all updates to all incidents here.
      this.ws.send(JSON.stringify({ action: "subscribe" }));

      this.retryInterval = 1;
      type ClearTimeoutParams = Parameters<typeof clearTimeout>;
      clearTimeout(this.reconnectInterval as ClearTimeoutParams[0]);
    };
    ws.onclose = (e: CloseEvent) => {
      // we set the state to disconnecting when we are on purpose
      // closing the connection
      if (this.state === "disconnecting") {
        console.log(`[RealtimeService ${this.id}] Realtime socket disconnected (purposefully closed)`);
      } else {
        // Was closed, but not by calling disconnect(), so we try to open it again.
        console.log(`[RealtimeService ${this.id}] Realtime socket was closed: ${e.reason}`);
        this.reconnectInterval = setTimeout(this.checkConnection, 1000 * this.retryInterval);
        this.retryInterval *= this.retryIntervalBackoffFactor;
      }
      this.setState("closed");
      this.ws = undefined;
    };

    // eslint-disable-next-line
    ws.onerror = (e: any) => {
      console.error(`[RealtimeService ${this.id}] got error on websocket client, closing: ${e.message}`);
      ws.close();
      // this.setState("closed"); // TODO: should this be set?
    };
  }
}
