import { IncomingEvent, OutgoingEvent } from "../types";

export type MessageMiddleware = {
  incoming?: (event: IncomingEvent) => IncomingEvent | null;
  outgoing?: (event: OutgoingEvent) => OutgoingEvent | null;
};

export class MiddlewareManager {
  private middlewares: MessageMiddleware[] = [];

  add(middleware: MessageMiddleware): () => void {
    this.middlewares.push(middleware);
    return () => this.remove(middleware);
  }

  remove(middleware: MessageMiddleware): void {
    const index = this.middlewares.indexOf(middleware);
    if (index > -1) {
      this.middlewares.splice(index, 1);
    }
  }

  processIncoming(event: IncomingEvent): IncomingEvent | null {
    return this.middlewares.reduce<IncomingEvent | null>((currentEvent, middleware) => {
      if (!currentEvent || !middleware.incoming) return currentEvent;
      return middleware.incoming(currentEvent);
    }, event);
  }

  processOutgoing(event: OutgoingEvent): OutgoingEvent | null {
    return this.middlewares.reduce<OutgoingEvent | null>((currentEvent, middleware) => {
      if (!currentEvent || !middleware.outgoing) return currentEvent;
      return middleware.outgoing(currentEvent);
    }, event);
  }
}
