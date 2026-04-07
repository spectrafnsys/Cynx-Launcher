import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { ManagedWebSocketConnection } from "../core/connection";
import {
  ConnectionState,
  ConnectionConfig,
  OutgoingEvent,
  IncomingEvent,
  EventHandler,
  ConnectionMetrics,
} from "../types";

export interface WebSocketStore {
  connection: ManagedWebSocketConnection | null;
  state: ConnectionState;
  config: ConnectionConfig | null;
  metrics: ConnectionMetrics | null;
  lastError: Error | null;
  connect: (config: ConnectionConfig) => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
  send: (event: OutgoingEvent) => Promise<void>;
  getRegisteredHandlers: () => string[];

  onMessage: <T extends IncomingEvent>(
    type: T["type"],
    handler: EventHandler<T>
  ) => () => void;
  offMessage: <T extends IncomingEvent>(
    type: T["type"],
    handler: EventHandler<T>
  ) => void;

  isConnected: () => boolean;
  getConnectionInfo: () => {
    state: ConnectionState;
    metrics: ConnectionMetrics | null;
    error: Error | null;
  };

  getState: () => ConnectionState;
}

export const useWebSocket = create<WebSocketStore>()(
  subscribeWithSelector<WebSocketStore>((set, get) => {
    const connection = new ManagedWebSocketConnection();

    connection.onStateChange((state) => {
      set({ state });
    });

    connection.onError((error) => {
      set({ lastError: error });
    });

    connection.onMetrics((metrics) => {
      set({ metrics });
    });

    return {
      connection,
      state: ConnectionState.IDLE,
      config: null,
      metrics: null,
      lastError: null,

      connect: async (config: ConnectionConfig) => {
        const { connection } = get();
        if (!connection) {
          throw new Error("Connection not available");
        }

        set({ config, lastError: null });

        try {
          await connection.connect(config);
        } catch (error) {
          set({ lastError: error as Error });
          throw error;
        }
      },

      getState: () => get().state,

      getRegisteredHandlers: () => {
        const { connection } = get();

        if (!connection) throw new Error("No connection available");
        return connection?.getRegisteredHandlers();
      },

      disconnect: () => {
        const { connection } = get();
        connection?.disconnect();
      },

      reconnect: async () => {
        const { config, connection } = get();
        if (!config) throw new Error("No config for reconnection");
        if (!connection) throw new Error("No connection available");

        await connection.connect(config);
      },

      send: async (event: OutgoingEvent) => {
        const { connection } = get();
        if (!connection) throw new Error("No connection available");
        await connection.send(event);
      },

      onMessage: <T extends IncomingEvent>(
        type: T["type"],
        handler: EventHandler<T>
      ) => {
        const { connection } = get();
        if (!connection) {
          console.warn("[Store] No connection available for onMessage");
          return () => {};
        }

        return connection.onMessage(type, handler);
      },

      offMessage: <T extends IncomingEvent>(
        _type: T["type"],
        _handler: EventHandler<T>
      ) => {
        console.warn(
          "[Store] offMessage called - use cleanup function from onMessage instead"
        );
      },

      isConnected: () => {
        const { connection } = get();
        return connection?.isConnected() ?? false;
      },

      getConnectionInfo: () => {
        const { state, metrics, lastError } = get();
        return { state, metrics, error: lastError };
      },
    };
  })
);
