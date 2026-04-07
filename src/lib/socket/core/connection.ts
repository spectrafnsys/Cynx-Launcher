import {
  ConnectionState,
  ConnectionConfig,
  OutgoingEvent,
  IncomingEvent,
  ConnectionMetrics,
  EventHandler,
} from "../types";

export class ManagedWebSocketConnection {
  private socket: WebSocket | null = null;
  private state: ConnectionState = ConnectionState.IDLE;
  private config: ConnectionConfig | null = null;
  private messageHandlers = new Map<string, Set<EventHandler>>();
  private stateHandlers = new Set<(state: ConnectionState) => void>();
  private errorHandlers = new Set<(error: Error) => void>();
  private metricsHandlers = new Set<(metrics: ConnectionMetrics) => void>();
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageQueue: OutgoingEvent[] = [];
  private isDestroyed = false;
  private metrics: ConnectionMetrics = {
    reconnectAttempts: 0,
    messagesSent: 0,
    messagesReceived: 0,
    bytesTransferred: 0,
    averageLatency: 0,
  };

  constructor() {
    console.log("[ManagedWebSocket] Created");
  }

  onMessage<T extends IncomingEvent>(
    type: T["type"],
    handler: EventHandler<T>
  ): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler as EventHandler);

    return () => {
      this.messageHandlers.get(type)?.delete(handler as EventHandler);
    };
  }

  onStateChange(handler: (state: ConnectionState) => void): () => void {
    this.stateHandlers.add(handler);
    handler(this.state);

    return () => {
      this.stateHandlers.delete(handler);
    };
  }

  onError(handler: (error: Error) => void): () => void {
    this.errorHandlers.add(handler);
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  onMetrics(handler: (metrics: ConnectionMetrics) => void): () => void {
    this.metricsHandlers.add(handler);
    return () => {
      this.metricsHandlers.delete(handler);
    };
  }

  async connect(config: ConnectionConfig): Promise<void> {
    if (this.isDestroyed) {
      throw new Error("Connection has been destroyed");
    }

    if (this.state === ConnectionState.CONNECTING) {
      return;
    }

    if (this.state === ConnectionState.CONNECTED && this.socket?.readyState === WebSocket.OPEN) {
      const newUrl = this.normalizeConfig(config).url;
      const currentUrl = this.config?.url;
      if (newUrl === currentUrl) {
        return;
      }
      this.disconnect();
    }

    this.config = this.normalizeConfig(config);
    this.setState(ConnectionState.CONNECTING);
    this.clearTimers();

    if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
      try {
        this.socket.close();
      } catch (ex) {
        console.warn("[ManagedWebSocket] Error closing existing socket:", ex);
      }
      this.socket = null;
    }

    try {
      await this.createConnection();
      this.setState(ConnectionState.CONNECTED);
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.flushMessageQueue();
      console.log("[ManagedWebSocket] Connected successfully");
    } catch (error) {
      console.error("[ManagedWebSocket] Connection failed:", error);
      this.setState(ConnectionState.ERROR);
      this.emitError(error as Error);
      if (this.config?.reconnect!.enabled && !this.isDestroyed) {
        this.attemptReconnect();
      }
      throw error;
    }
  }

  private normalizeConfig(
    config: ConnectionConfig
  ): Required<ConnectionConfig> {
    return {
      url: config.url,
      protocols: config.protocols ?? [],
      reconnect: {
        enabled: config.reconnect?.enabled ?? true,
        maxAttempts: config.reconnect?.maxAttempts ?? 5,
        delay: config.reconnect?.delay ?? 1000,
        backoffMultiplier: config.reconnect?.backoffMultiplier ?? 1.5,
      },
      heartbeat: {
        enabled: config.heartbeat?.enabled ?? true,
        interval: config.heartbeat?.interval ?? 30000,
        timeout: config.heartbeat?.timeout ?? 5000,
      },
      timeout: {
        connection: config.timeout?.connection ?? 10000,
        message: config.timeout?.message ?? 5000,
      },
    };
  }

  private createConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.config) {
        reject(new Error("No config available"));
        return;
      }

      try {
        this.socket = new WebSocket(this.config.url, this.config.protocols);

        const connectionTimeout = setTimeout(() => {
          this.socket?.close();
          reject(new Error("Connection timeout"));
        }, this.config.timeout!.connection);

        this.socket.onopen = () => {
          clearTimeout(connectionTimeout);
          resolve();
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.socket.onclose = (event) => {
          clearTimeout(connectionTimeout);
          this.handleClose(event);
        };

        this.socket.onerror = (event) => {
          clearTimeout(connectionTimeout);
          console.error("[ManagedWebSocket] Socket error:", event);
          reject(new Error("WebSocket error"));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(data: string): void {
    try {
      const message: IncomingEvent = JSON.parse(data);

      this.metrics.messagesReceived++;
      this.metrics.bytesTransferred += new Blob([data]).size;
      this.emitMetrics();

      if (this.isSystemMessage(message.type)) {
        this.handleSystemMessage(message);
        return;
      }

      const handlers = this.messageHandlers.get(message.type);
      if (handlers && handlers.size > 0) {
        handlers.forEach((handler) => {
          try {
            handler(message);
          } catch (error) {
            const errMsg =
              error instanceof Error ? error.message : JSON.stringify(error);
            console.warn(
              `[ManagedWebSocket] Handler error for ${message.type}:`,
              errMsg
            );
          }
        });
      } else {
        console.warn(
          `[ManagedWebSocket] No handlers for message type: ${message.type}`
        );
      }
    } catch (error) {
      console.error("[ManagedWebSocket] Failed to parse message:", error);
    }
  }

  private isSystemMessage(type: string): boolean {
    return ["heartbeat", "pong", "ping"].includes(type);
  }

  private handleSystemMessage(message: IncomingEvent): void {
    switch (message.type) {
      case "heartbeat":
        this.handleHeartbeat(message);
        break;
      case "pong":
        this.handlePong();
        break;
      default:
        console.warn(
          `[ManagedWebSocket] Unknown system message: ${message.type}`
        );
        break;
    }
  }

  private handleHeartbeat(message: IncomingEvent): void {
    console.log("[ManagedWebSocket] Received heartbeat from server");

    if (message.id) {
      const responsePayload: any = {
        id: message.id,
        timestamp: Date.now(),
      };

      if (
        message.payload &&
        typeof message.payload === "object" &&
        "timestamp" in message.payload
      ) {
        responsePayload.serverTimestamp = message.payload.timestamp;
      }

      this.send({
        type: "pong",
        ...responsePayload,
      }).catch((error) => {
        console.error(
          "[ManagedWebSocket] Failed to respond to heartbeat:",
          error
        );
      });
    }

    this.metrics.lastHeartbeatTime = Date.now();
    this.emitMetrics();
  }

  private handlePong(/*message: IncomingEvent*/): void {
    if (this.metrics.lastPingTime) {
      const latency = Date.now() - this.metrics.lastPingTime;
      this.metrics.averageLatency = this.calculateAverageLatency(latency);
      console.log(
        `[ManagedWebSocket] Latency: ${latency}ms (avg: ${this.metrics.averageLatency}ms)`
      );

      delete this.metrics.lastPingTime;
      this.emitMetrics();
    } else {
      console.log("[ManagedWebSocket] Received pong (no pending ping)");
    }
  }

  private calculateAverageLatency(newLatency: number): number {
    const weight = 0.2;
    return this.metrics.averageLatency === 0
      ? newLatency
      : Math.round(
          this.metrics.averageLatency * (1 - weight) + newLatency * weight
        );
  }

  getRegisteredHandlers(): string[] {
    return Array.from(this.messageHandlers.keys());
  }

  private handleClose(event: CloseEvent): void {
    console.log(
      `[ManagedWebSocket] Connection closed: ${event.code} ${event.reason} (wasClean: ${event.wasClean})`
    );
    this.clearTimers();

    const isNormalClosure = event.code === 1000 && event.wasClean;
    const isClientDisconnect = event.reason === "Client disconnect";

    if (this.isDestroyed || isClientDisconnect) {
      this.setState(ConnectionState.DISCONNECTED);
      return;
    }

    if (
      !isNormalClosure &&
      this.config?.reconnect!.enabled &&
      !this.isDestroyed
    ) {
      console.log(
        "[ManagedWebSocket] Will attempt to reconnect due to unexpected closure"
      );
      this.setState(ConnectionState.RECONNECTING);
      this.attemptReconnect();
    } else {
      console.log(
        "[ManagedWebSocket] Not reconnecting - normal closure or reconnect disabled"
      );
      this.setState(ConnectionState.DISCONNECTED);
    }
  }

  private attemptReconnect(): void {
    if (
      !this.config ||
      this.reconnectAttempts >= this.config.reconnect!.maxAttempts ||
      this.isDestroyed
    ) {
      this.setState(ConnectionState.ERROR);
      return;
    }

    this.reconnectAttempts++;
    this.metrics.reconnectAttempts = this.reconnectAttempts;
    const delay =
      this.config.reconnect!.delay *
      Math.pow(
        this.config.reconnect!.backoffMultiplier,
        this.reconnectAttempts - 1
      );

    console.log(
      `[ManagedWebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.config.reconnect!.maxAttempts})`
    );

    this.reconnectTimer = setTimeout(() => {
      if (!this.isDestroyed && this.config && this.state === ConnectionState.RECONNECTING) {
        this.connect(this.config).catch((error) => {
          console.error("[ManagedWebSocket] Reconnection attempt failed:", error);
          if (this.reconnectAttempts < this.config!.reconnect!.maxAttempts) {
            this.attemptReconnect();
          } else {
            this.setState(ConnectionState.ERROR);
          }
        });
      }
    }, delay);
  }

  async send(event: OutgoingEvent): Promise<void> {
    const fullEvent = {
      ...event,
      id: event.id || this.generateId(),
      timestamp: Date.now(),
    };

    if (this.state !== ConnectionState.CONNECTED) {
      this.messageQueue.push(fullEvent);
      return;
    }

    return this.sendImmediate(fullEvent);
  }

  private sendImmediate(event: OutgoingEvent): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        reject(new Error("WebSocket not connected"));
        return;
      }

      try {
        const message = JSON.stringify(event);
        this.socket.send(message);

        this.metrics.messagesSent++;
        this.metrics.bytesTransferred += new Blob([message]).size;

        if (event.type === "ping") {
          this.metrics.lastPingTime = Date.now();
        }

        this.emitMetrics();
        resolve();
      } catch (error) {
        console.error("[ManagedWebSocket] Send failed:", error);
        reject(error);
      }
    });
  }

  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0) return;

    const queue = [...this.messageQueue];
    this.messageQueue = [];

    queue.forEach((event) => {
      this.sendImmediate(event).catch((error) => {
        console.error(
          "[ManagedWebSocket] Failed to send queued message:",
          error
        );
        this.messageQueue.unshift(event);
      });
    });
  }

  private startHeartbeat(): void {
    if (!this.config?.heartbeat!.enabled) return;

    this.heartbeatTimer = setInterval(() => {
      if (this.state === ConnectionState.CONNECTED) {
        if (!this.metrics.lastPingTime) {
          console.log("[ManagedWebSocket] Sending ping to server");
          this.metrics.lastPingTime = Date.now();
          this.send({
            type: "ping",
            timestamp: Date.now(),
          }).catch((error) => {
            console.error("[ManagedWebSocket] Failed to send ping:", error);
            delete this.metrics.lastPingTime;
          });
        } else {
          const timeSincePing = Date.now() - this.metrics.lastPingTime;
          if (timeSincePing > this.config!.heartbeat!.timeout) {
            console.warn(
              `[ManagedWebSocket] Ping timeout after ${timeSincePing}ms, assuming connection lost`
            );
            delete this.metrics.lastPingTime;
            this.socket?.close(1006, "Ping timeout");
          }
        }
      }
    }, this.config.heartbeat.interval);
  }

  private setState(newState: ConnectionState): void {
    if (this.state !== newState) {
      const oldState = this.state;
      this.state = newState;
      console.log(`[ManagedWebSocket] State: ${oldState} -> ${newState}`);

      this.stateHandlers.forEach((handler) => {
        try {
          handler(newState);
        } catch (error) {
          console.error("[ManagedWebSocket] State handler error:", error);
        }
      });

      this.emitMetrics();
    }
  }

  private emitError(error: Error): void {
    this.errorHandlers.forEach((handler) => {
      try {
        handler(error);
      } catch (err) {
        console.error("[ManagedWebSocket] Error handler error:", err);
      }
    });
  }

  private emitMetrics(): void {
    this.metricsHandlers.forEach((handler) => {
      try {
        handler({ ...this.metrics });
      } catch (error) {
        console.error("[ManagedWebSocket] Metrics handler error:", error);
      }
    });
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  disconnect(): void {
    console.log("[ManagedWebSocket] Disconnecting...");
    this.clearTimers();
    this.reconnectAttempts = 0;

    if (this.socket) {
      try {
        if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
          this.socket.close(1000, "Client disconnect");
        }
      } catch (ex) {
        console.warn("[ManagedWebSocket] Error closing socket:", ex);
      }
      this.socket = null;
    }

    this.setState(ConnectionState.DISCONNECTED);
  }

  destroy(): void {
    console.log("[ManagedWebSocket] Destroying...");
    this.isDestroyed = true;
    this.disconnect();
    this.messageHandlers.clear();
    this.stateHandlers.clear();
    this.errorHandlers.clear();
    this.metricsHandlers.clear();
    this.messageQueue = [];
  }

  isConnected(): boolean {
    return (
      this.state === ConnectionState.CONNECTED &&
      this.socket?.readyState === WebSocket.OPEN
    );
  }

  getState(): ConnectionState {
    return this.state;
  }

  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }
}
