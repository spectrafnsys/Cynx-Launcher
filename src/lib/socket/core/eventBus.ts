export class EventBus<TEvents extends Record<string, unknown[]>> {
  private listeners = new Map<keyof TEvents, Set<(...args: unknown[]) => void>>();
  private onceListeners = new Map<keyof TEvents, Set<(...args: unknown[]) => void>>();

  on<K extends keyof TEvents>(event: K, handler: (...args: TEvents[K]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(handler as (...args: unknown[]) => void);

    return () => this.off(event, handler);
  }

  once<K extends keyof TEvents>(event: K, handler: (...args: TEvents[K]) => void): () => void {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }

    this.onceListeners.get(event)!.add(handler as (...args: unknown[]) => void);

    return () => this.off(event, handler);
  }

  off<K extends keyof TEvents>(event: K, handler: (...args: TEvents[K]) => void): void {
    this.listeners.get(event)?.delete(handler as (...args: unknown[]) => void);
    this.onceListeners.get(event)?.delete(handler as (...args: unknown[]) => void);
  }

  emit<K extends keyof TEvents>(event: K, ...args: TEvents[K]): void {
    this.listeners.get(event)?.forEach((handler) => {
      try {
        handler(...args);
      } catch (error) {
        console.error(`EventBus: Error in handler for ${String(event)}:`, error);
      }
    });

    const onceHandlers = this.onceListeners.get(event);
    if (onceHandlers) {
      onceHandlers.forEach((handler) => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`EventBus: Error in once handler for ${String(event)}:`, error);
        }
      });
      this.onceListeners.delete(event);
    }
  }

  removeAllListeners<K extends keyof TEvents>(event?: K): void {
    if (event) {
      this.listeners.delete(event);
      this.onceListeners.delete(event);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }

  getListenerCount<K extends keyof TEvents>(event: K): number {
    const regular = this.listeners.get(event)?.size ?? 0;
    const once = this.onceListeners.get(event)?.size ?? 0;
    return regular + once;
  }
}
