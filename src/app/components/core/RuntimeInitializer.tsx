import React, { useEffect, useRef, useCallback } from "react";
import { useUserStore } from "../../../store/user";
import { getWsConfig } from "../../../lib/configurations";
import { cleanWsUrl } from "../../utils";
import { ConnectionState, useWebSocket } from "../../../lib/socket";
import { useConnectionStatus } from "./ConnectionStatus";
import type { User } from "../../types/user";

const RuntimeInitializer: React.FC = () => {
  const websocket = useWebSocket();
  const user = useUserStore();
  const { updateStatus } = useConnectionStatus();

  const mountedRef = useRef(true);
  const handlersSetup = useRef(false);
  const userRequestSent = useRef(false);
  const currentTokenRef = useRef<string | null>(null);
  const cleanupFunctions = useRef<(() => void)[]>([]);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const websocketRef = useRef(websocket);
  const userRef = useRef(user);
  const updateStatusRef = useRef(updateStatus);

  useEffect(() => {
    websocketRef.current = websocket;
    userRef.current = user;
    updateStatusRef.current = updateStatus;
  });

  const cleanup = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    cleanupFunctions.current.forEach((fn) => fn());
    cleanupFunctions.current = [];
    handlersSetup.current = false;
    userRequestSent.current = false;

    updateStatusRef.current({
      handlersSetup: false,
      userRequestSent: false,
    });
  }, []);

  const setupMessageHandlers = useCallback(() => {
    if (handlersSetup.current) return;

    cleanup();

    const unsubUser = websocketRef.current.onMessage("user", (event) => {
      const payload = event.payload as Record<string, unknown> | undefined;
      let userData: User | undefined = payload?.token as User | undefined;
      if (
        !userData &&
        payload &&
        typeof payload === "object" &&
        "id" in payload &&
        typeof (payload as User).id === "string"
      ) {
        userData = payload as User;
      }
      if (userData) {
        userRef.current.setUser(userData);
        console.log("[Runtime] User authenticated:", userData.id);
      } else {
        console.warn("[Runtime] Invalid or missing user data in payload");
      }
    });

    const unsubError = websocketRef.current.onMessage("error", (event) => {
      const err = event.payload as Record<string, unknown> | undefined;
      const errorMsg =
        (err && typeof err === "object" && typeof err.message === "string"
          ? err.message
          : event.message) || "Unknown error";
      console.warn("[Runtime] WebSocket error:", errorMsg);

      const isAuthFailure =
        errorMsg.includes("User not found") ||
        errorMsg.includes("Invalid token");

      if (isAuthFailure) {
        console.log("[Runtime] Authentication failed, signing out");
        userRef.current.signOut();
      }

      userRequestSent.current = false;
      updateStatusRef.current({
        handlersSetup: handlersSetup.current,
        userRequestSent: false,
      });

      if (!isAuthFailure && mountedRef.current && websocketRef.current.isConnected()) {
        if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = setTimeout(() => {
          retryTimeoutRef.current = null;
          requestUserData();
        }, 2000);
      }
    });

    cleanupFunctions.current = [unsubUser, unsubError];
    handlersSetup.current = true;

    updateStatusRef.current({
      handlersSetup: true,
      userRequestSent: userRequestSent.current,
    });
  }, [cleanup]);

  const requestUserData = useCallback(async () => {
    if (
      userRequestSent.current ||
      !handlersSetup.current ||
      !websocketRef.current.isConnected() ||
      !mountedRef.current
    ) {
      return;
    }

    try {
      userRequestSent.current = true;
      updateStatusRef.current({
        handlersSetup: handlersSetup.current,
        userRequestSent: true,
      });

      await websocketRef.current.send({ type: "request_user" });
      console.log("[Runtime] User data requested");
    } catch (error) {
      console.error("[Runtime] Failed to request user data:", error);
      userRequestSent.current = false;
      updateStatusRef.current({
        handlersSetup: handlersSetup.current,
        userRequestSent: false,
      });
    }
  }, []);

  const connectWebSocket = useCallback(async () => {
    const accessToken = userRef.current.accessToken;
    if (!accessToken || !mountedRef.current) return;

    const tokenChanged = currentTokenRef.current !== accessToken;
    const isConnected = websocketRef.current.isConnected();

    if (!tokenChanged && isConnected) {
      return;
    }

    if (isConnected && tokenChanged) {
      websocketRef.current.disconnect();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    try {
      currentTokenRef.current = accessToken;
      const wsUrl = cleanWsUrl(`${getWsConfig().url}?token=${accessToken}`);

      await websocketRef.current.connect({
        url: wsUrl,
        heartbeat: {
          enabled: true,
          interval: 30000,
          timeout: 10000,
        },
        reconnect: {
          enabled: true,
          maxAttempts: 5,
          delay: 1000,
          backoffMultiplier: 1.5,
        },
      });

      console.log("[Runtime] WebSocket connected");
    } catch (error) {
      console.error("[Runtime] WebSocket connection failed:", error);
      currentTokenRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    setupMessageHandlers();
  }, [setupMessageHandlers]);

  useEffect(() => {
    if (!mountedRef.current) return;

    const unsubscribe = useWebSocket.subscribe(
      (state) => state.state,
      (state) => {
        if (!mountedRef.current) return;

        switch (state) {
          case ConnectionState.CONNECTED:
            if (
              !userRequestSent.current &&
              handlersSetup.current &&
              mountedRef.current
            ) {
              requestUserData();
            }
            break;

          case ConnectionState.DISCONNECTED:
          case ConnectionState.ERROR:
            userRequestSent.current = false;
            updateStatus({
              handlersSetup: handlersSetup.current,
              userRequestSent: false,
            });
            break;

          case ConnectionState.RECONNECTING:
            userRequestSent.current = false;
            updateStatus({
              handlersSetup: handlersSetup.current,
              userRequestSent: false,
            });
            break;
        }
      }
    );

    const currentState = websocketRef.current.getState();
    if (
      currentState === ConnectionState.CONNECTED &&
      !userRequestSent.current &&
      handlersSetup.current
    ) {
      requestUserData();
    }

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;

    if (user.accessToken) {
      if (!handlersSetup.current) {
        setupMessageHandlers();
      }
      const tokenChanged = currentTokenRef.current !== user.accessToken;
      if (tokenChanged || !websocketRef.current.isConnected()) {
        connectWebSocket();
      }
    } else {
      if (websocketRef.current.isConnected()) {
        websocketRef.current.disconnect();
      }
      currentTokenRef.current = null;
      userRequestSent.current = false;
      updateStatusRef.current({
        handlersSetup: handlersSetup.current,
        userRequestSent: false,
      });
    }
  }, [user.accessToken]);

  return null;
};

export default React.memo(RuntimeInitializer);
