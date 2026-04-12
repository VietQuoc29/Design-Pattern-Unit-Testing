export interface StockObserver {
  update(symbol: string, price: number): void;
}

export class StockTicker {
  private observers: StockObserver[] = [];
  private prices    = new Map<string, number>();

  subscribe(observer: StockObserver): void {
    this.observers.push(observer);
  }

  unsubscribe(observer: StockObserver): void {
    this.observers = this.observers.filter(o => o !== observer);
  }

  setPrice(symbol: string, price: number): void {
    this.prices.set(symbol, price);
    this.observers.forEach(o => o.update(symbol, price));
  }

  getPrice(symbol: string): number | undefined {
    return this.prices.get(symbol);
  }

  observerCount(): number { return this.observers.length; }
}

// Concrete Observer A – updates a display string
export class PriceDisplay implements StockObserver {
  private lastUpdate = '';
  update(symbol: string, price: number): void {
    this.lastUpdate = `${symbol}: $${price}`;
  }
  getDisplay(): string { return this.lastUpdate; }
}

// Concrete Observer B – fires alerts when price exceeds threshold
export class AlertSystem implements StockObserver {
  private alerts: string[] = [];
  constructor(private threshold: number) {}
  update(symbol: string, price: number): void {
    if (price > this.threshold)
      this.alerts.push(`ALERT: ${symbol} exceeded $${this.threshold} at $${price}`);
  }
  getAlerts(): string[] { return [...this.alerts]; }
}
