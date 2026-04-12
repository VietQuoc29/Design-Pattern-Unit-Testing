import { EventEmitter, OrderEvents } from './eventObserver';

describe('Typed Event Emitter (Observer)', () => {

  let emitter: EventEmitter<OrderEvents>;
  beforeEach(() => { emitter = new EventEmitter(); });

  it('on() + emit() – handler receives the correctly typed payload', () => {
    const handler = jest.fn();
    emitter.on('order:created', handler);
    emitter.emit('order:created', { orderId: 'O-1', total: 99 });
    expect(handler).toHaveBeenCalledWith({ orderId: 'O-1', total: 99 });
  });

  it('multiple handlers on the same event are all called once', () => {
    const h1 = jest.fn();
    const h2 = jest.fn();
    emitter.on('order:shipped', h1);
    emitter.on('order:shipped', h2);
    emitter.emit('order:shipped', { orderId: 'O-2', carrier: 'Shopee' });
    expect(h1).toHaveBeenCalledTimes(1);
    expect(h2).toHaveBeenCalledTimes(1);
  });

  it('off() removes only the specified handler; others remain active', () => {
    const h1 = jest.fn();
    const h2 = jest.fn();
    emitter.on('order:created', h1);
    emitter.on('order:created', h2);
    emitter.off('order:created', h1);
    emitter.emit('order:created', { orderId: 'O-3', total: 50 });
    expect(h1).not.toHaveBeenCalled();
    expect(h2).toHaveBeenCalledTimes(1);
  });

  it('emit on an event with no handlers does not throw', () => {
    expect(() =>
      emitter.emit('order:cancelled', { orderId: 'O-4', reason: 'Test' })
    ).not.toThrow();
  });

  it('listenerCount() tracks subscribe/unsubscribe accurately', () => {
    const h = jest.fn();
    expect(emitter.listenerCount('order:created')).toBe(0);
    emitter.on('order:created', h);
    expect(emitter.listenerCount('order:created')).toBe(1);
    emitter.off('order:created', h);
    expect(emitter.listenerCount('order:created')).toBe(0);
  });

  it('handlers for different event types are fully isolated', () => {
    const createdHandler = jest.fn();
    emitter.on('order:created', createdHandler);
    emitter.emit('order:shipped', { orderId: 'O-5', carrier: 'UPS' });
    expect(createdHandler).not.toHaveBeenCalled();
  });

  it('handler subscribed twice is called twice per emit', () => {
    const handler = jest.fn();
    emitter.on('order:created', handler);
    emitter.on('order:created', handler);
    emitter.emit('order:created', { orderId: 'O-6', total: 10 });
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('emitting multiple times calls each handler the correct number of times', () => {
    const handler = jest.fn();
    emitter.on('order:created', handler);
    emitter.emit('order:created', { orderId: 'A', total: 1 });
    emitter.emit('order:created', { orderId: 'B', total: 2 });
    expect(handler).toHaveBeenCalledTimes(2);
  });

});
