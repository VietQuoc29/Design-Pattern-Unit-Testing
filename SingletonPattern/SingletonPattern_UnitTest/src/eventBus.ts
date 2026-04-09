type EventHandler = (data: unknown) => void;

export class EventBus {
  private static instance: EventBus;
  private handlers: Map<string, EventHandler[]> = new Map();

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  static resetInstance(): void {
    (EventBus as any).instance = undefined;
  }

  // Register a handler for an event
  on(event: string, handler: EventHandler): void {
    const list = this.handlers.get(event) ?? [];
    this.handlers.set(event, [...list, handler]);
  }

  // Remove a handler for an event
  off(event: string, handler: EventHandler): void {
    const list = this.handlers.get(event) ?? [];
    this.handlers.set(event, list.filter(h => h !== handler));
  }

  // broadcast event to all registered handlers
  emit(event: string, data: unknown): void {
    (this.handlers.get(event) ?? []).forEach(h => h(data));
  }

  // Number of handlers registered for an event
  listenerCount(event: string): number {
    return (this.handlers.get(event) ?? []).length;
  }
}
