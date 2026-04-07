import { useWebSocket } from "../store";
import { ConnectionState } from "../types";

export function useConnectionState() {
  const { state, metrics, lastError } = useWebSocket();

  return {
    state,
    metrics,
    error: lastError,
    isIdle: state === ConnectionState.IDLE,
    isConnecting: state === ConnectionState.CONNECTING,
    isConnected: state === ConnectionState.CONNECTED,
    isReconnecting: state === ConnectionState.RECONNECTING,
    isDisconnected: state === ConnectionState.DISCONNECTED,
    hasError: state === ConnectionState.ERROR,
  };
}
