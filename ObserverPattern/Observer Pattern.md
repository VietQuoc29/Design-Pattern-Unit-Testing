1. # **Observer Pattern**

   1. ## **Definition**

The Observer Pattern defines a subscription mechanism to notify multiple objects about any events that happen to the object they are observing. The Subject maintains a list of Observers and broadcasts state changes to all of them without knowing who they are or what they do with the notification.

For example: a newspaper publisher (Subject) and its subscribers (Observers). The publisher does not know what each subscriber does with the paper – it simply delivers it. Subscribers can join or leave at any time without the publisher changing its code.

2. ## **Structure**

The Decorator Pattern consists of four main components:

- Subject: Maintains a list of observers. Provides subscribe(), unsubscribe(), and notify() methods. Calls notify() whenever its state changes.

- Concrete Subject: Extends Subject. Holds the actual state and calls notify() after every state change..

- Subscriber: Defines the update() method that all concrete observers must implement. This is the single point of coupling between Subject and Observer.

- Concrete Subcriber: Implements the Observer interface. Reacts to notifications from the Subject – each observer handles the event in its own way.

  3. ## **Applicability**

- When changes to the state of one object may require changing other objects, and the actual set of objects is unknown beforehand or changes dynamically.  
- When some objects in your app must observe others, but only for a limited time or in specific cases.

  4. ## **Pros and cons**

| Prospects | Consequences |
| :---- | :---- |
| Open/Closed Principle | Subscribers are notified in random order |
| Can establish relations between objects at runtime |  |

# 

2. # **Ex1 \- Stock Price Ticker** 

## **Describe**

A stock market feed publishes real-time price updates. Multiple displays (PriceDisplay, AlertSystem, Logger) subscribe to the feed. When the price changes, all active subscribers are notified automatically. Subscribers can attach and detach at runtime without altering the feed.

## **Source code: stockObserver.ts**

export interface StockObserver {  
  update(symbol: string, price: number): void;  
}

export class StockTicker {  
  private observers: StockObserver\[\] \= \[\];  
  private prices    \= new Map\<string, number\>();

  subscribe(observer: StockObserver): void {  
    this.observers.push(observer);  
  }

  unsubscribe(observer: StockObserver): void {  
    this.observers \= this.observers.filter(o \=\> o \!== observer);  
  }

  setPrice(symbol: string, price: number): void {  
    this.prices.set(symbol, price);  
    this.observers.forEach(o \=\> o.update(symbol, price));  
  }

  getPrice(symbol: string): number | undefined {  
    return this.prices.get(symbol);  
  }

  observerCount(): number { return this.observers.length; }  
}

// Concrete Observer A – updates a display string  
export class PriceDisplay implements StockObserver {  
  private lastUpdate \= '';  
  update(symbol: string, price: number): void {  
    this.lastUpdate \= \`${symbol}: $${price}\`;  
  }  
  getDisplay(): string { return this.lastUpdate; }  
}

// Concrete Observer B – fires alerts when price exceeds threshold  
export class AlertSystem implements StockObserver {  
  private alerts: string\[\] \= \[\];  
  constructor(private threshold: number) {}  
  update(symbol: string, price: number): void {  
    if (price \> this.threshold)  
      this.alerts.push(\`ALERT: ${symbol} exceeded $${this.threshold} at $${price}\`);  
  }  
  getAlerts(): string\[\] { return \[...this.alerts\]; }  
}

## **Source code: stockObserver.test.ts**

import { StockTicker, PriceDisplay, AlertSystem, StockObserver } from './stockObserver';

describe('Stock Price Ticker', () \=\> {

  let ticker: StockTicker;  
  beforeEach(() \=\> { ticker \= new StockTicker(); });

  it('notifies all subscribed observers when price changes', () \=\> {  
    const h1 \= jest.fn();  
    const h2 \= jest.fn();  
    ticker.subscribe({ update: h1 });  
    ticker.subscribe({ update: h2 });  
    ticker.setPrice('Apple', 180);  
    expect(h1).toHaveBeenCalledWith('Apple', 180);  
    expect(h2).toHaveBeenCalledWith('Apple', 180);  
  });

  it('does not notify an observer after unsubscribe', () \=\> {  
    const handler \= jest.fn();  
    const obs: StockObserver \= { update: handler };  
    ticker.subscribe(obs);  
    ticker.unsubscribe(obs);  
    ticker.setPrice('Apple', 190);  
    expect(handler).not.toHaveBeenCalled();  
  });

  it('other observers still receive updates after one unsubscribes', () \=\> {  
    const h1 \= jest.fn();  
    const h2 \= jest.fn();  
    const obs1: StockObserver \= { update: h1 };  
    ticker.subscribe(obs1);  
    ticker.subscribe({ update: h2 });  
    ticker.unsubscribe(obs1);  
    ticker.setPrice('Google', 140);  
    expect(h1).not.toHaveBeenCalled();  
    expect(h2).toHaveBeenCalledTimes(1);  
  });

  it('observerCount() reflects the current live subscription count', () \=\> {  
    const obs: StockObserver \= { update: jest.fn() };  
    ticker.subscribe(obs);  
    expect(ticker.observerCount()).toBe(1);  
    ticker.unsubscribe(obs);  
    expect(ticker.observerCount()).toBe(0);  
  });

  it('PriceDisplay stores the latest symbol and price as a formatted string', () \=\> {  
    const display \= new PriceDisplay();  
    ticker.subscribe(display);  
    ticker.setPrice('Google', 140);  
    expect(display.getDisplay()).toBe('Google: $140');  
  });

  it('PriceDisplay always reflects the most recent update', () \=\> {  
    const display \= new PriceDisplay();  
    ticker.subscribe(display);  
    ticker.setPrice('Apple', 170);  
    ticker.setPrice('Apple', 175);  
    expect(display.getDisplay()).toBe('Apple: $175');  
  });

  it('multiple observers react independently to the same price event', () \=\> {  
    const display \= new PriceDisplay();  
    const alert   \= new AlertSystem(100);  
    ticker.subscribe(display);  
    ticker.subscribe(alert);  
    ticker.setPrice('Amazon', 120);  
    expect(display.getDisplay()).toContain('Amazon');  
    expect(alert.getAlerts()).toHaveLength(1);  
  });

  it('each setPrice() call dispatches exactly N notifications (one per subscriber)', () \=\> {  
    const handler \= jest.fn();  
    ticker.subscribe({ update: handler });  
    ticker.subscribe({ update: handler }); // same fn subscribed twice  
    ticker.setPrice('Microsoft', 50);  
    expect(handler).toHaveBeenCalledTimes(2);  
  });

});

3. # **Ex2 \- Event Notification System**

## **Describe**

An application needs a typed event bus where different modules can publish events and other modules can subscribe to specific event types. Unlike a global bus (Singleton), each EventEmitter instance is scoped and independently testable with jest mocks.

## **Source code: eventObserver.ts**

export type EventHandler\<T\> \= (payload: T) \=\> void;

export class EventEmitter\<Events extends Record\<string, unknown\>\> {  
  private handlers \= new Map\<keyof Events, Array\<EventHandler\<unknown\>\>\>();

  on\<K extends keyof Events\>(event: K, handler: EventHandler\<Events\[K\]\>): void {  
    const list \= (this.handlers.get(event) ?? \[\]) as Array\<EventHandler\<Events\[K\]\>\>;  
    this.handlers.set(event, \[...list, handler\] as Array\<EventHandler\<unknown\>\>);  
  }

  off\<K extends keyof Events\>(event: K, handler: EventHandler\<Events\[K\]\>): void {  
    const list \= (this.handlers.get(event) ?? \[\]) as Array\<EventHandler\<Events\[K\]\>\>;  
    this.handlers.set(event, list.filter(h \=\> h \!== handler) as Array\<EventHandler\<unknown\>\>);  
  }

  emit\<K extends keyof Events\>(event: K, payload: Events\[K\]): void {  
    const list \= (this.handlers.get(event) ?? \[\]) as Array\<EventHandler\<Events\[K\]\>\>;  
    list.forEach(h \=\> h(payload));  
  }

  listenerCount(event: keyof Events): number {  
    return this.handlers.get(event)?.length ?? 0;  
  }  
}

// Typed event map – each key maps to its payload type  
export type OrderEvents \= {  
  'order:created':   { orderId: string; total: number };  
  'order:shipped':   { orderId: string; carrier: string };  
  'order:cancelled': { orderId: string; reason: string };  
}

## **Source code: eventObserver.test.ts**

import { EventEmitter, OrderEvents } from './eventObserver';

describe('Typed Event Emitter (Observer)', () \=\> {

  let emitter: EventEmitter\<OrderEvents\>;  
  beforeEach(() \=\> { emitter \= new EventEmitter(); });

  it('on() \+ emit() – handler receives the correctly typed payload', () \=\> {  
    const handler \= jest.fn();  
    emitter.on('order:created', handler);  
    emitter.emit('order:created', { orderId: 'O-1', total: 99 });  
    expect(handler).toHaveBeenCalledWith({ orderId: 'O-1', total: 99 });  
  });

  it('multiple handlers on the same event are all called once', () \=\> {  
    const h1 \= jest.fn();  
    const h2 \= jest.fn();  
    emitter.on('order:shipped', h1);  
    emitter.on('order:shipped', h2);  
    emitter.emit('order:shipped', { orderId: 'O-2', carrier: 'Shopee' });  
    expect(h1).toHaveBeenCalledTimes(1);  
    expect(h2).toHaveBeenCalledTimes(1);  
  });

  it('off() removes only the specified handler; others remain active', () \=\> {  
    const h1 \= jest.fn();  
    const h2 \= jest.fn();  
    emitter.on('order:created', h1);  
    emitter.on('order:created', h2);  
    emitter.off('order:created', h1);  
    emitter.emit('order:created', { orderId: 'O-3', total: 50 });  
    expect(h1).not.toHaveBeenCalled();  
    expect(h2).toHaveBeenCalledTimes(1);  
  });

  it('emit on an event with no handlers does not throw', () \=\> {  
    expect(() \=\>  
      emitter.emit('order:cancelled', { orderId: 'O-4', reason: 'Test' })  
    ).not.toThrow();  
  });

  it('listenerCount() tracks subscribe/unsubscribe accurately', () \=\> {  
    const h \= jest.fn();  
    expect(emitter.listenerCount('order:created')).toBe(0);  
    emitter.on('order:created', h);  
    expect(emitter.listenerCount('order:created')).toBe(1);  
    emitter.off('order:created', h);  
    expect(emitter.listenerCount('order:created')).toBe(0);  
  });

  it('handlers for different event types are fully isolated', () \=\> {  
    const createdHandler \= jest.fn();  
    emitter.on('order:created', createdHandler);  
    emitter.emit('order:shipped', { orderId: 'O-5', carrier: 'UPS' });  
    expect(createdHandler).not.toHaveBeenCalled();  
  });

  it('handler subscribed twice is called twice per emit', () \=\> {  
    const handler \= jest.fn();  
    emitter.on('order:created', handler);  
    emitter.on('order:created', handler);  
    emitter.emit('order:created', { orderId: 'O-6', total: 10 });  
    expect(handler).toHaveBeenCalledTimes(2);  
  });

  it('emitting multiple times calls each handler the correct number of times', () \=\> {  
    const handler \= jest.fn();  
    emitter.on('order:created', handler);  
    emitter.emit('order:created', { orderId: 'A', total: 1 });  
    emitter.emit('order:created', { orderId: 'B', total: 2 });  
    expect(handler).toHaveBeenCalledTimes(2);  
  });

});

4. # **Ex3 \- Form Validation**

## **Describe**

A registration form validates fields in real-time. Each input field is a Subject. Validators (MinLength, Required) are Observers that subscribe to field changes and push validation errors back. The form controller aggregates errors across all fields.

## **Source code: formObserver.ts**

export interface FieldObserver {  
  onFieldChange(fieldName: string, value: string): void;  
  getErrors(): string\[\];  
}

export class FormField {  
  private value     \= '';  
  private observers: FieldObserver\[\] \= \[\];

  constructor(public readonly name: string) {}

  subscribe(obs: FieldObserver): void {  
    this.observers.push(obs);  
  }

  unsubscribe(obs: FieldObserver): void {  
    this.observers \= this.observers.filter(o \=\> o \!== obs);  
  }

  setValue(value: string): void {  
    this.value \= value;  
    this.observers.forEach(o \=\> o.onFieldChange(this.name, value));  
  }

  getValue(): string { return this.value; }  
}

// Concrete Validator Observers  
export class RequiredValidator implements FieldObserver {  
  private errors: string\[\] \= \[\];  
  onFieldChange(field: string, value: string): void {  
    this.errors \= value.trim() \=== '' ? \[\`${field} is required\`\] : \[\];  
  }  
  getErrors(): string\[\] { return \[...this.errors\]; }  
}

export class MinLengthValidator implements FieldObserver {  
  private errors: string\[\] \= \[\];  
  constructor(private min: number) {}  
  onFieldChange(field: string, value: string): void {  
    this.errors \= value.length \< this.min  
      ? \[\`${field} must be at least ${this.min} characters\`\]  
      : \[\];  
  }  
  getErrors(): string\[\] { return \[...this.errors\]; }  
}

## **Source code: formObserver.test.ts**

import {  
  FormField,  
  RequiredValidator,  
  MinLengthValidator,  
} from './formObserver';

describe('Form Validation Observer', () \=\> {

  describe('RequiredValidator', () \=\> {  
    it('reports error when field value is empty', () \=\> {  
      const field     \= new FormField('username');  
      const validator \= new RequiredValidator();  
      field.subscribe(validator);  
      field.setValue('');  
      expect(validator.getErrors()).toContain('username is required');  
    });

    it('reports error when value is only whitespace', () \=\> {  
      const field     \= new FormField('username');  
      const validator \= new RequiredValidator();  
      field.subscribe(validator);  
      field.setValue('   ');  
      expect(validator.getErrors()).toHaveLength(1);  
    });

    it('clears error when a non-empty value is set', () \=\> {  
      const field     \= new FormField('username');  
      const validator \= new RequiredValidator();  
      field.subscribe(validator);  
      field.setValue('');  
      field.setValue('Quoc');  
      expect(validator.getErrors()).toHaveLength(0);  
    });  
  });

  describe('MinLengthValidator', () \=\> {  
    it('reports error when value is shorter than the minimum', () \=\> {  
      const field     \= new FormField('password');  
      const validator \= new MinLengthValidator(8);  
      field.subscribe(validator);  
      field.setValue('short');  
      expect(validator.getErrors()\[0\]).toContain('at least 8 characters');  
    });

    it('clears error when value meets the minimum length', () \=\> {  
      const field     \= new FormField('password');  
      const validator \= new MinLengthValidator(8);  
      field.subscribe(validator);  
      field.setValue('longpassword123');  
      expect(validator.getErrors()).toHaveLength(0);  
    });

    it('exact minimum length passes validation', () \=\> {  
      const field     \= new FormField('pin');  
      const validator \= new MinLengthValidator(4);  
      field.subscribe(validator);  
      field.setValue('1234');  
      expect(validator.getErrors()).toHaveLength(0);  
    });  
  });

  describe('Multiple validators on the same field', () \=\> {  
    it('each validator reacts independently to the same value change', () \=\> {  
      const field     \= new FormField('password');  
      const required  \= new RequiredValidator();  
      const minLength \= new MinLengthValidator(8);  
      field.subscribe(required);  
      field.subscribe(minLength);  
      field.setValue('hi'); // not empty, but too short  
      expect(required.getErrors()).toHaveLength(0);  // passes required  
      expect(minLength.getErrors()).toHaveLength(1); // fails min length  
    });

    it('all validators clear their errors when valid input is set', () \=\> {  
      const field     \= new FormField('password');  
      const required  \= new RequiredValidator();  
      const minLength \= new MinLengthValidator(8);  
      field.subscribe(required);  
      field.subscribe(minLength);  
      field.setValue('ValidPassword123');  
      expect(required.getErrors()).toHaveLength(0);  
      expect(minLength.getErrors()).toHaveLength(0);  
    });  
  });

  it('unsubscribed validator no longer receives field updates', () \=\> {  
    const field     \= new FormField('name');  
    const validator \= new RequiredValidator();  
    field.subscribe(validator);  
    field.unsubscribe(validator);  
    field.setValue('');  
    expect(validator.getErrors()).toHaveLength(0);  
  });

  it('setValue() calls onFieldChange with the correct field name and value', () \=\> {  
    const field   \= new FormField('bio');  
    const handler \= jest.fn();  
    field.subscribe({ onFieldChange: handler, getErrors: () \=\> \[\] });  
    field.setValue('Hello world');  
    expect(handler).toHaveBeenCalledWith('bio', 'Hello world');  
  });

});

