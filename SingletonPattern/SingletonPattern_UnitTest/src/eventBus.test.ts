import { EventBus } from './eventBus';

describe('EventBus Singleton', () => {

  beforeEach(() => {
    EventBus.resetInstance();
  });

  it('getInstance() always returns the same EventBus instance', () => {
    const bus1 = EventBus.getInstance();
    const bus2 = EventBus.getInstance();
    expect(bus1).toBe(bus2);
  });

  it('on() + emit() – handler called with correct data', () => {
    const bus     = EventBus.getInstance();
    const handler = jest.fn();
    bus.on('user:login', handler);
    bus.emit('user:login', { userId: 42, role: 'admin' });
    expect(handler).toHaveBeenCalledWith({ userId: 42, role: 'admin' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('multiple handlers for the same event are all called when emitted', () => {
    const bus = EventBus.getInstance();
    const h1  = jest.fn();
    const h2  = jest.fn();
    const h3  = jest.fn();
    bus.on('order:created', h1);
    bus.on('order:created', h2);
    bus.on('order:created', h3);
    bus.emit('order:created', { orderId: 1 });
    expect(h1).toHaveBeenCalledTimes(1);
    expect(h2).toHaveBeenCalledTimes(1);
    expect(h3).toHaveBeenCalledTimes(1);
  });

  it('off() removes the correct handler – remaining handlers still run normally', () => {
    const bus = EventBus.getInstance();
    const h1  = jest.fn();
    const h2  = jest.fn();
    bus.on('click', h1);
    bus.on('click', h2);
    bus.off('click', h1); // remove h1
    bus.emit('click', null);
    expect(h1).not.toHaveBeenCalled(); // removed
    expect(h2).toHaveBeenCalledTimes(1); // still runs
  });

  it('emit event without handler – does not throw error', () => {
    const bus = EventBus.getInstance();
    expect(() => bus.emit('non:existent', {})).not.toThrow();
  });

  it('listenerCount() counts the correct number of handlers', () => {
    const bus = EventBus.getInstance();
    const h1 = jest.fn();
    const h2 = jest.fn();
    expect(bus.listenerCount('pay')).toBe(0);
    bus.on('pay', h1);
    expect(bus.listenerCount('pay')).toBe(1);
    bus.on('pay', h2);
    expect(bus.listenerCount('pay')).toBe(2);
    bus.off('pay', h1);
    expect(bus.listenerCount('pay')).toBe(1);
  });

  it('global bus – subscribe in module A, emit in module B', () => {
    const moduleA = EventBus.getInstance(); // module payment subscribe
    const moduleB = EventBus.getInstance(); // module order emit
    const onPayment = jest.fn();
    moduleA.on('payment:success', onPayment);
    moduleB.emit('payment:success', { amount: 100000 });
    expect(onPayment).toHaveBeenCalledWith({ amount: 100000 });
  });

  it('emit many times – handler called the correct number of times', () => {
    const bus     = EventBus.getInstance();
    const handler = jest.fn();
    bus.on('tick', handler);
    bus.emit('tick', 1);
    bus.emit('tick', 2);
    bus.emit('tick', 3);
    expect(handler).toHaveBeenCalledTimes(3);
    expect(handler).toHaveBeenNthCalledWith(1, 1);
    expect(handler).toHaveBeenNthCalledWith(2, 2);
    expect(handler).toHaveBeenNthCalledWith(3, 3);
  });

});
