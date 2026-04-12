export type EventHandler<T> = (payload: T) => void;

export class EventEmitter<Events extends Record<string, unknown>> {
  private handlers = new Map<keyof Events, Array<EventHandler<unknown>>>();

  on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
    const list = (this.handlers.get(event) ?? []) as Array<EventHandler<Events[K]>>;
    this.handlers.set(event, [...list, handler] as Array<EventHandler<unknown>>);
  }

  off<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
    const list = (this.handlers.get(event) ?? []) as Array<EventHandler<Events[K]>>;
    this.handlers.set(event, list.filter(h => h !== handler) as Array<EventHandler<unknown>>);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const list = (this.handlers.get(event) ?? []) as Array<EventHandler<Events[K]>>;
    list.forEach(h => h(payload));
  }

  listenerCount(event: keyof Events): number {
    return this.handlers.get(event)?.length ?? 0;
  }
}

// Typed event map – each key maps to its payload type
export type OrderEvents = {
  'order:created':   { orderId: string; total: number };
  'order:shipped':   { orderId: string; carrier: string };
  'order:cancelled': { orderId: string; reason: string };
}
