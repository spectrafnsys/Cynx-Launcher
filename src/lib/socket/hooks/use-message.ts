import { useEffect, useCallback } from "react";
import { useWebSocket } from "../store";
import { IncomingEvent, OutgoingEvent, EventHandler } from "../types";

export function useMessage<T extends IncomingEvent>(
  type: T["type"],
  handler: EventHandler<T>,
  deps?: React.DependencyList
) {
  const { onMessage } = useWebSocket();

  useEffect(
    () => {
      const unsubscribe = onMessage(type, handler);
      return unsubscribe;
    },
    deps ? [type, ...deps] : [type, handler]
  );
}

export function useSend() {
  const { send, isConnected } = useWebSocket();

  const sendMessage = useCallback(
    async (event: OutgoingEvent) => {
      if (!isConnected()) {
        throw new Error("WebSocket is not connected");
      }

      await send(event);
    },
    [send, isConnected]
  );

  const sendMessageSafe = useCallback(
    async (event: OutgoingEvent): Promise<boolean> => {
      try {
        await sendMessage(event);
        return true;
      } catch (error) {
        console.error("Failed to send message:", error);
        return false;
      }
    },
    [sendMessage]
  );

  return {
    send: sendMessage,
    sendSafe: sendMessageSafe,
    canSend: isConnected(),
  };
}
