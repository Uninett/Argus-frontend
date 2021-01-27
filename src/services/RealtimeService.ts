import { BACKEND_WS_URL } from "../config";

import { Incident } from "../api";

export type RealtimeServiceConfig = {
  restartOnFailure?: boolean;
  fallbackToInterval?: boolean;

  // onIncidentsInitial: called on subscribe, where
  // a list of all incidents are provided
  onIncidentsInitial: (incidents: Incident[]) => void;

  onIncidentModified: (incident: Incident) => void;
  onIncidentRemoved: (incident: Incident) => void;
  onIncidentAdded: (incident: Incident) => void;
};

export type RealtimeServiceState = "connecting" | "opened" | "closed" | "disconnecting";
// RealtimeService represents all the
// code required to add WebSockets Realtime
// incident updates.
//
// Authentication works by using the "token" cookie,
// and that should be set before using this.
export class RealtimeService {
  ws: WebSocket | undefined;
  config: RealtimeServiceConfig;
  state: RealtimeServiceState;

  retryInterval = 1; // seconds
  retryIntervalBackoffFactor = 2;

  // eslint-disable-next-line
  reconnectInterval: ReturnType<typeof setTimeout> | undefined;

  public constructor({ restartOnFailure = true, fallbackToInterval = true, ...params }: RealtimeServiceConfig) {
    this.config = { restartOnFailure, fallbackToInterval, ...params };
    this.state = "closed";

    // JavaScript doesn't automatically bind "this" properly when using ES6 classes
    // so you have to bind it yourself.
    this.checkConnection = this.checkConnection.bind(this);
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);

    this.reconnectInterval = undefined;
  }

  public checkConnection() {
    console.log("[RealtimeService] checking connection");
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.state = "closed";
      this.connect();
    }
  }

  public disconnect() {
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      console.log("[RealtimeService] closing");
      if (this.reconnectInterval) {
        type ClearTimeoutParams = Parameters<typeof clearTimeout>;
        clearTimeout(this.reconnectInterval as ClearTimeoutParams[0]);
      }
      this.state = "disconnecting";
      this.ws.close();
    }
  }

  public connect() {
    /// let reconnectInterval: ReturnType<typeof setTimeout> | undefined = undefined;
    if (this.state !== "closed") {
      console.log("[RealtimeService] calling connect() when there is existing ws connection. returning");
      return;
    }

    this.state = "connecting";
    this.ws = undefined;

    const ws = new WebSocket(`${BACKEND_WS_URL}/open/`);
    ws.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "modified":
          const modified: Incident = data.payload;
          console.debug("[RealtimeService] onmessage: modified", modified);
          this.config.onIncidentModified(modified);
          break;

        case "created":
          const added: Incident = data.payload;
          console.debug("[RealtimeService] onmessage: created", added);
          this.config.onIncidentAdded(added);
          break;

        case "deleted":
          const removed: Incident = data.payload;
          console.debug("[RealtimeService] onmessage: deleted", removed);
          this.config.onIncidentRemoved(removed);
          break;

        case "subscribed":
          const incidents: Incident[] = data.start_incidents;
          console.debug("[RealtimeService] onmessage: subscribed", incidents);
          this.config.onIncidentsInitial(incidents);
          break;

        default:
          console.error(`[RealtimeService] Unhandled WebSockets message type: ${data.type}`);
          break;
      }
    };
    ws.onopen = () => {
      console.log("[RealtimeService] Realtime socket opened");

      this.state = "opened";
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
        console.log("[RealtimeService] Realtime socket disconnected (purposefully closed)");
      } else {
        // Was closed, but not by calling disconnect(), so we try to open it again.
        console.log(`[RealtimeService] Realtime socket was closed: ${e.reason}`);
        this.reconnectInterval = setTimeout(this.checkConnection, 1000 * this.retryInterval);
        this.retryInterval *= this.retryIntervalBackoffFactor;
      }
      this.state = "closed";
      this.ws = undefined;
    };

    // eslint-disable-next-line
    ws.onerror = (e: any) => {
      console.error(`[RealtimeService] got error on websocket client, closing: ${e.message}`);
      ws.close();
    };
  }
}
