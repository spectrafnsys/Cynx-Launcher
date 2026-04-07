interface WebSocketMessage {
  type: string;
  payload?: unknown;
  id?: string;
  timestamp?: number;
}

interface WebSocketConfig {
  url: string;
  reconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  timeout?: number;
  protocols?: string | string[];
}

interface ConnectionState {
  status:
    | "connecting"
    | "connected"
    | "disconnecting"
    | "disconnected"
    | "error";
  reconnectAttempts: number;
  lastError?: Error;
  connectedAt?: Date;
}

interface WebSocketWrapperEvents {
  connection: ConnectionState;
  error: Error;
  message: WebSocketMessage;
  user: { type: "user"; payload: User; timestamp: number };
  [key: string]: unknown;
}
