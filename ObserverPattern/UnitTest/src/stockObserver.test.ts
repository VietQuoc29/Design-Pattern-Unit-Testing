import { StockTicker, PriceDisplay, AlertSystem, StockObserver } from './stockObserver';

describe('Stock Price Ticker', () => {

  let ticker: StockTicker;
  beforeEach(() => { ticker = new StockTicker(); });

  it('notifies all subscribed observers when price changes', () => {
    const h1 = jest.fn();
    const h2 = jest.fn();
    ticker.subscribe({ update: h1 });
    ticker.subscribe({ update: h2 });
    ticker.setPrice('Apple', 180);
    expect(h1).toHaveBeenCalledWith('Apple', 180);
    expect(h2).toHaveBeenCalledWith('Apple', 180);
  });

  it('does not notify an observer after unsubscribe', () => {
    const handler = jest.fn();
    const obs: StockObserver = { update: handler };
    ticker.subscribe(obs);
    ticker.unsubscribe(obs);
    ticker.setPrice('Apple', 190);
    expect(handler).not.toHaveBeenCalled();
  });

  it('other observers still receive updates after one unsubscribes', () => {
    const h1 = jest.fn();
    const h2 = jest.fn();
    const obs1: StockObserver = { update: h1 };
    ticker.subscribe(obs1);
    ticker.subscribe({ update: h2 });
    ticker.unsubscribe(obs1);
    ticker.setPrice('Google', 140);
    expect(h1).not.toHaveBeenCalled();
    expect(h2).toHaveBeenCalledTimes(1);
  });

  it('observerCount() reflects the current live subscription count', () => {
    const obs: StockObserver = { update: jest.fn() };
    ticker.subscribe(obs);
    expect(ticker.observerCount()).toBe(1);
    ticker.unsubscribe(obs);
    expect(ticker.observerCount()).toBe(0);
  });

  it('PriceDisplay stores the latest symbol and price as a formatted string', () => {
    const display = new PriceDisplay();
    ticker.subscribe(display);
    ticker.setPrice('Google', 140);
    expect(display.getDisplay()).toBe('Google: $140');
  });

  it('PriceDisplay always reflects the most recent update', () => {
    const display = new PriceDisplay();
    ticker.subscribe(display);
    ticker.setPrice('Apple', 170);
    ticker.setPrice('Apple', 175);
    expect(display.getDisplay()).toBe('Apple: $175');
  });

  it('multiple observers react independently to the same price event', () => {
    const display = new PriceDisplay();
    const alert   = new AlertSystem(100);
    ticker.subscribe(display);
    ticker.subscribe(alert);
    ticker.setPrice('Amazon', 120);
    expect(display.getDisplay()).toContain('Amazon');
    expect(alert.getAlerts()).toHaveLength(1);
  });

  it('each setPrice() call dispatches exactly N notifications (one per subscriber)', () => {
    const handler = jest.fn();
    ticker.subscribe({ update: handler });
    ticker.subscribe({ update: handler }); // same fn subscribed twice
    ticker.setPrice('Microsoft', 50);
    expect(handler).toHaveBeenCalledTimes(2);
  });

});
