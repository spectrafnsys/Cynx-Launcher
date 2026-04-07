import { useCallback } from "react";
import { useWebSocket } from "../store";
import { ConnectionConfig } from "../types";

export function useConnection() {
  const { connect, disconnect, reconnect, isConnected, getConnectionInfo } = useWebSocket();

  const connectWithRetry = useCallback(
    async (config: ConnectionConfig, maxRetries = 3) => {
      let lastError: Error | null = null;

      for (let i = 0; i < maxRetries; i++) {
        try {
          await connect(config);
          return;
        } catch (error) {
          lastError = error as Error;
          if (i < maxRetries - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      }

      throw lastError;
    },
    [connect]
  );

  return {
    connect,
    connectWithRetry,
    disconnect,
    reconnect,
    isConnected: isConnected(),
    ...getConnectionInfo(),
  };
}
