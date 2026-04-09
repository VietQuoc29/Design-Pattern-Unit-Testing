1. # **Singleton Pattern**

   1. ## **Definition**

The Singleton Pattern ensures that only one instance of a class is created in the entire application, providing a single global access point to that instance. Every request to create a new object returns the same existing instance.

Singletons are commonly used for shared resources such as logging systems, application configuration tools, connection pools, event buses, or caches.

2. ## **Structure**

Singleton Pattern consists of three main components:

- Constructor private: Prevent external code from creating instances using *new*.  
- Static property instance: Store a single instance of the class.  
- Static method getInstance(): Check if the instance does not exist; if so, create a new one. Otherwise, revert to the old instance.

  3. ## **Applicability**

- A class in program should have just a single instance available to all clients.  
- Need stricter control over global variables.

  4. ## **Pros and cons**

| Prospects | Consequences |
| :---- | :---- |
| Ensure only one instance exists | Difficult to test – state shared between tests |
| Global access | Violate the Single Responsibility Principle |
| Save resources | Causes tight coupling if used directly |
| Easy to write unit tests – mock factory | Difficult to expand |

# 

2. # **Ex1 \- Logger**

## **Describe**

An application needs a centralized logging system that is shared everywhere. If each module creates its own logger, the logs will be scattered and inconsistent. Singleton ensures that there is only one logger, storing all logs in one place.

## **Source code: logger.ts**

export class Logger {  
  private static instance: Logger;  
  private logs: string\[\] \= \[\];

  // Private constructor – Prevent creating instances using \`new\`.  
  private constructor() {}

  static getInstance(): Logger {  
    if (\!Logger.instance) {  
      Logger.instance \= new Logger();  
    }  
    return Logger.instance;  
  }

  // Used in testing to reset to the initial state.  
  static resetInstance(): void {  
    (Logger as any).instance \= undefined;  
  }

  log(message: string): void {  
    this.logs.push(\`\[LOG\] ${message}\`);  
  }

  warn(message: string): void {  
    this.logs.push(\`\[WARN\] ${message}\`);  
  }

  error(message: string): void {  
    this.logs.push(\`\[ERROR\] ${message}\`);  
  }

  getLogs(): string\[\] {  
    return \[...this.logs\]; // return a copy to prevent external modification  
  }

  clearLogs(): void {  
    this.logs \= \[\];  
  }  
}

## **Source code: logger.test.ts**

import { Logger } from './logger';

describe('Logger Singleton', () \=\> {

  //reset before each test to avoid test pollution  
  beforeEach(() \=\> {  
    Logger.resetInstance();  
  });

  it('getInstance() always returns the same instance', () \=\> {  
    const a \= Logger.getInstance();  
    const b \= Logger.getInstance();  
    expect(a).toBe(b); // toBe check same references (===)  
  });

  it('log() adds to the logs list with the prefix \[LOG\]', () \=\> {  
    const logger \= Logger.getInstance();  
    logger.log('Server started');  
    logger.log('Request received');  
    expect(logger.getLogs()).toContain('\[LOG\] Server started');  
    expect(logger.getLogs()).toContain('\[LOG\] Request received');  
    expect(logger.getLogs()).toHaveLength(2);  
  });

  it('warn() correctly records the prefix \[WARN\]', () \=\> {  
    const logger \= Logger.getInstance();  
    logger.warn('Low memory');  
    expect(logger.getLogs()).toContain('\[WARN\] Low memory');  
  });

  it('error() correctly records the prefix \[ERROR\]', () \=\> {  
    const logger \= Logger.getInstance();  
    logger.error('Database connection failed');  
    expect(logger.getLogs()).toContain('\[ERROR\] Database connection failed');  
  });

  it('State shared between two references – log in at a, read from at b.', () \=\> {  
    const loggerA \= Logger.getInstance(); // module A  
    const loggerB \= Logger.getInstance(); // module B  
    loggerA.log('Hello from module A');  
    // loggerB see A's log because the same instance.  
    expect(loggerB.getLogs()).toContain('\[LOG\] Hello from module A');  
  });

  it('clearLogs() deletes all logs', () \=\> {  
    const logger \= Logger.getInstance();  
    logger.log('Temp log');  
    logger.error('Temp error');  
    logger.clearLogs();  
    expect(logger.getLogs()).toHaveLength(0);  
  });

  it('getLogs() return a copy – modifying the copy does not affect the original logs', () \=\> {  
    const logger \= Logger.getInstance();  
    logger.log('Original');  
    const copy \= logger.getLogs();  
    copy.push('\[LOG\] Injected'); // modify the copy  
    expect(logger.getLogs()).toHaveLength(1); // original logs are not affected  
  });

  it('resetInstance() create new instance – old log is no longer available', () \=\> {  
    Logger.getInstance().log('Before reset');  
    Logger.resetInstance();  
    const fresh \= Logger.getInstance();  
    expect(fresh.getLogs()).toHaveLength(0);  
  });

});

3. # **Ex2 \- Config Manager**

## **Describe**

An application reads configuration (API URL, timeout, feature flags, etc.) from multiple sources. If each module reads the configuration separately, conflicts can occur. ConfigManager Singleton ensures that the entire application uses the same set of configurations.

## **Source code: configManager.ts**

export interface AppConfig {  
  apiUrl:    string;  
  timeout:   number;  
  debugMode: boolean;  
}

export class ConfigManager {  
  private static instance: ConfigManager;  
  private config: AppConfig;

  private constructor() {  
    // default configuration  
    this.config \= {  
      apiUrl:    'https://api.example.com',  
      timeout:   3000,  
      debugMode: false,  
    };  
  }

  static getInstance(): ConfigManager {  
    if (\!ConfigManager.instance) {  
      ConfigManager.instance \= new ConfigManager();  
    }  
    return ConfigManager.instance;  
  }

  static resetInstance(): void {  
    (ConfigManager as any).instance \= undefined;  
  }

  // Generic getter – type-safe nhờ keyof  
  get\<K extends keyof AppConfig\>(key: K): AppConfig\[K\] {  
    return this.config\[key\];  
  }

  // Generic setter – type-safe  
  set\<K extends keyof AppConfig\>(key: K, value: AppConfig\[K\]): void {  
    this.config\[key\] \= value;  
  }

  // Return a snapshot to prevent direct modification of the config  
  getAll(): AppConfig {  
    return { ...this.config };  
  }  
}

## **Source code: configManager.test.ts**

import { ConfigManager } from './configManager';

describe('ConfigManager Singleton', () \=\> {

  beforeEach(() \=\> {  
    ConfigManager.resetInstance();  
  });

  it('getInstance() returns the same instance', () \=\> {  
    const c1 \= ConfigManager.getInstance();  
    const c2 \= ConfigManager.getInstance();  
    expect(c1).toBe(c2);  
  });

  it('get() returns the correct default values after initialization', () \=\> {  
    const cfg \= ConfigManager.getInstance();  
    expect(cfg.get('apiUrl')).toBe('https://api.example.com');  
    expect(cfg.get('timeout')).toBe(3000);  
    expect(cfg.get('debugMode')).toBe(false);  
  });

  it('set() updates the config, get() reads the updated value', () \=\> {  
    const cfg \= ConfigManager.getInstance();  
    cfg.set('timeout', 5000);  
    cfg.set('debugMode', true);  
    cfg.set('apiUrl', 'https://new-api.com');  
    expect(cfg.get('timeout')).toBe(5000);  
    expect(cfg.get('debugMode')).toBe(true);  
    expect(cfg.get('apiUrl')).toBe('https://new-api.com');  
  });

  it('changes to config via reference A are immediately visible to reference B', () \=\> {  
    const cfg1 \= ConfigManager.getInstance();  
    const cfg2 \= ConfigManager.getInstance();  
    cfg1.set('apiUrl', 'https://staging.api.com');  
    expect(cfg2.get('apiUrl')).toBe('https://staging.api.com');  
  });

  it('getAll() return a snapshot – modifying the snapshot does not affect the original config', () \=\> {  
    const cfg \= ConfigManager.getInstance();  
    const snapshot \= cfg.getAll();  
    snapshot.timeout \= 99999;        // modify the snapshot  
    expect(cfg.get('timeout')).toBe(3000); // default config not affected  
  });

  it('resetInstance() creates a new instance with default config', () \=\> {  
    const cfg \= ConfigManager.getInstance();  
    cfg.set('timeout', 9999);  
    ConfigManager.resetInstance();  
    const fresh \= ConfigManager.getInstance();  
    expect(fresh.get('timeout')).toBe(3000); // reset to default value  
  });

  it('type-safety: set() accepts the correct data types', () \=\> {  
    const cfg \= ConfigManager.getInstance();  
    // No TypeScript error when setting the correct types  
    expect(() \=\> cfg.set('timeout', 1000)).not.toThrow();  
    expect(() \=\> cfg.set('debugMode', true)).not.toThrow();  
  });

});

4. # **Ví dụ 3 \- Event Bus**

## **Describe**

The modules in an application need to communicate with each other without being directly dependent. The EventBus Singleton acts as an intermediary: module A publishes the event, module B subscribes and processes it – all via a single bus.

## **Source code: eventBus.ts**

type EventHandler \= (data: unknown) \=\> void;

export class EventBus {  
  private static instance: EventBus;  
  private handlers: Map\<string, EventHandler\[\]\> \= new Map();

  private constructor() {}

  static getInstance(): EventBus {  
    if (\!EventBus.instance) {  
      EventBus.instance \= new EventBus();  
    }  
    return EventBus.instance;  
  }

  static resetInstance(): void {  
    (EventBus as any).instance \= undefined;  
  }

  // Register a handler for an event  
  on(event: string, handler: EventHandler): void {  
    const list \= this.handlers.get(event) ?? \[\];  
    this.handlers.set(event, \[...list, handler\]);  
  }

  // Remove a handler for an event  
  off(event: string, handler: EventHandler): void {  
    const list \= this.handlers.get(event) ?? \[\];  
    this.handlers.set(event, list.filter(h \=\> h \!== handler));  
  }

  // broadcast event to all registered handlers  
  emit(event: string, data: unknown): void {  
    (this.handlers.get(event) ?? \[\]).forEach(h \=\> h(data));  
  }

  // Number of handlers registered for an event  
  listenerCount(event: string): number {  
    return (this.handlers.get(event) ?? \[\]).length;  
  }  
}

## **Source code: eventBus.test.ts**

import { EventBus } from './eventBus';

describe('EventBus Singleton', () \=\> {

  beforeEach(() \=\> {  
    EventBus.resetInstance();  
  });

  it('getInstance() always returns the same EventBus instance', () \=\> {  
    const bus1 \= EventBus.getInstance();  
    const bus2 \= EventBus.getInstance();  
    expect(bus1).toBe(bus2);  
  });

  it('on() \+ emit() – handler called with correct data', () \=\> {  
    const bus     \= EventBus.getInstance();  
    const handler \= jest.fn();  
    bus.on('user:login', handler);  
    bus.emit('user:login', { userId: 42, role: 'admin' });  
    expect(handler).toHaveBeenCalledWith({ userId: 42, role: 'admin' });  
    expect(handler).toHaveBeenCalledTimes(1);  
  });

  it('multiple handlers for the same event are all called when emitted', () \=\> {  
    const bus \= EventBus.getInstance();  
    const h1  \= jest.fn();  
    const h2  \= jest.fn();  
    const h3  \= jest.fn();  
    bus.on('order:created', h1);  
    bus.on('order:created', h2);  
    bus.on('order:created', h3);  
    bus.emit('order:created', { orderId: 1 });  
    expect(h1).toHaveBeenCalledTimes(1);  
    expect(h2).toHaveBeenCalledTimes(1);  
    expect(h3).toHaveBeenCalledTimes(1);  
  });

  it('off() removes the correct handler – remaining handlers still run normally', () \=\> {  
    const bus \= EventBus.getInstance();  
    const h1  \= jest.fn();  
    const h2  \= jest.fn();  
    bus.on('click', h1);  
    bus.on('click', h2);  
    bus.off('click', h1); // remove h1  
    bus.emit('click', null);  
    expect(h1).not.toHaveBeenCalled(); // removed  
    expect(h2).toHaveBeenCalledTimes(1); // still runs  
  });

  it('emit event without handler – does not throw error', () \=\> {  
    const bus \= EventBus.getInstance();  
    expect(() \=\> bus.emit('non:existent', {})).not.toThrow();  
  });

  it('listenerCount() counts the correct number of handlers', () \=\> {  
    const bus \= EventBus.getInstance();  
    const h1 \= jest.fn();  
    const h2 \= jest.fn();  
    expect(bus.listenerCount('pay')).toBe(0);  
    bus.on('pay', h1);  
    expect(bus.listenerCount('pay')).toBe(1);  
    bus.on('pay', h2);  
    expect(bus.listenerCount('pay')).toBe(2);  
    bus.off('pay', h1);  
    expect(bus.listenerCount('pay')).toBe(1);  
  });

  it('global bus – subscribe in module A, emit in module B', () \=\> {  
    const moduleA \= EventBus.getInstance(); // module payment subscribe  
    const moduleB \= EventBus.getInstance(); // module order emit  
    const onPayment \= jest.fn();  
    moduleA.on('payment:success', onPayment);  
    moduleB.emit('payment:success', { amount: 100000 });  
    expect(onPayment).toHaveBeenCalledWith({ amount: 100000 });  
  });

  it('emit many times – handler called the correct number of times', () \=\> {  
    const bus     \= EventBus.getInstance();  
    const handler \= jest.fn();  
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