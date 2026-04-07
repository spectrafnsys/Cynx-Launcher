export enum ConnectionState {
  IDLE = "idle",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  RECONNECTING = "reconnecting",
  DISCONNECTED = "disconnected",
  ERROR = "error",
}

export interface ConnectionConfig {
  url: string;
  protocols?: string[];
  reconnect?: {
    enabled: boolean;
    maxAttempts: number;
    delay: number;
    backoffMultiplier: number;
  };
  heartbeat?: {
    enabled: boolean;
    interval: number;
    timeout: number;
  };
  timeout?: {
    connection: number;
    message: number;
  };
}

export interface BaseEvent {
  type: string;
  timestamp?: number;
  message?: string;
  code?: string;
  id?: string;
}

export interface OutgoingEvent extends BaseEvent {
  type:
    | "ping"
    | "message"
    | "subscribe"
    | "unsubscribe"
    | "request_user"
    | "request_storefront"
    | "request_leaderboard"
    | "request_servers"
    | "subscribe_servers"
    | "unsubscribe_servers"
    | "pong";

  payload?: Record<string, unknown>;
}

export interface IncomingEvent extends BaseEvent {
  type:
    | "pong"
    | "message"
    | "error"
    | "user"
    | "storefront"
    | "leaderboard"
    | "heartbeat"
    | "servers"
    | "servers_update"
    | "servers_subscribed"
    | "servers_unsubscribed";

  action?: string;
  sessionId?: string;
  payload?: Record<string, unknown>;
  error?: string;
}

export type EventHandler<T extends IncomingEvent = IncomingEvent> = (
  event: T
) => void;

export interface ConnectionMetrics {
  connectedAt?: number;
  disconnectedAt?: number;
  reconnectAttempts: number;
  messagesSent: number;
  messagesReceived: number;
  bytesTransferred: number;
  lastPingTime?: number;
  lastHeartbeatTime?: number;
  averageLatency: number;
}
