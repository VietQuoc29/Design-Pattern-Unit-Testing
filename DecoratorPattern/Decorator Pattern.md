1. # **Decorator Pattern**

   1. ## **Definition**

The Decorator Pattern attaches additional responsibilities to an object dynamically. Decorators provide a flexible alternative to subclassing for extending functionality. Each Decorator wraps a Component, adds its own behavior before and/or after delegating the call to the wrapped object.

Instead of creating a new subclass every time you need a new combination of features, you stack lightweight Decorator objects around a base object at runtime. Each decorator adds one focused concern – the result is composable, testable, and open for extension.

2. ## **Structure**

The Decorator Pattern consists of four main components:

- Component Interface: Defines the contract that both the base object and all decorators implement. This ensures decorators are interchangeable with the object they wrap.

- Concrete Component: The base implementation of the Component interface. Contains the core behavior with no extra concerns.

- Base Decorator: An abstract class that implements Component and holds a reference to a wrapped Component. Delegates all calls to the wrapped object by default.

- Concrete Decorators: Extend Base Decorator and add specific behavior before or after the delegation call. Each decorator is responsible for one single concern.

  3. ## **Applicability**

- Need to be able to assign extra behaviors to objects at runtime without breaking the code that uses these objects.  
- It’s awkward or not possible to extend an object’s behavior using inheritance.

  4. ## **Pros and cons**

| Prospects | Consequences |
| :---- | :---- |
| Can extend an object’s behavior without making a new subclass | Hard to remove a specific wrapper from the wrappers stack |
| Can add or remove responsibilities from an object at runtime | Hard to implement a decorator in such a way that its behavior doesn’t depend on the order in the decorators stack |
| Can combine several behaviors by wrapping an object into multiple decorators | The initial configuration code of layers might look pretty ugly |
| Single Responsibility Principle |  |

# 

2. # **Ex1 \- HTTP Request** 

## **Describe**

An HTTP client needs cross-cutting concerns applied to every request: logging, authentication, and retry-on-failure. Instead of hardcoding all three into one class, each concern is a Decorator that wraps the previous layer, forming a clean middleware pipeline.

## **Source code: httpDecorator.ts**

// Component Interface  
export interface HttpClient {  
  request(url: string, options?: RequestOptions): HttpResponse;  
}

export interface RequestOptions { headers?: Record\<string, string\>; }  
export interface HttpResponse   { status: number; body: string; }

// Concrete Component – bare HTTP client with no cross-cutting concerns  
export class BaseHttpClient implements HttpClient {  
  request(url: string, \_options?: RequestOptions): HttpResponse {  
    return { status: 200, body: \`Response from ${url}\` };  
  }  
}

// Base Decorator – delegate by default, subclasses override selectively  
export abstract class HttpClientDecorator implements HttpClient {  
  constructor(protected wrapped: HttpClient) {}

  request(url: string, options?: RequestOptions): HttpResponse {  
    return this.wrapped.request(url, options);  
  }  
}

// Concrete Decorator 1 – Logging (record before/after each request)  
export class LoggingDecorator extends HttpClientDecorator {  
  private logs: string\[\] \= \[\];

  request(url: string, options?: RequestOptions): HttpResponse {  
    this.logs.push(\`\[LOG\] GET ${url}\`);  
    const response \= super.request(url, options);  
    this.logs.push(\`\[LOG\] ${response.status} ${url}\`);  
    return response;  
  }

  getLogs(): string\[\] { return \[...this.logs\]; }  
}

// Concrete Decorator 2 – Authentication (injects Bearer token header)  
export class AuthDecorator extends HttpClientDecorator {  
  constructor(wrapped: HttpClient, private token: string) { super(wrapped); }

  request(url: string, options: RequestOptions \= {}): HttpResponse {  
    const authedOptions: RequestOptions \= {  
      ...options,  
      headers: { ...options.headers, Authorization: \`Bearer ${this.token}\` },  
    };  
    return super.request(url, authedOptions);  
  }  
}

// Concrete Decorator 3 – Retry (retries on 5xx responses)  
export class RetryDecorator extends HttpClientDecorator {  
  constructor(wrapped: HttpClient, private maxRetries: number) { super(wrapped); }

  request(url: string, options?: RequestOptions): HttpResponse {  
    let lastResponse: HttpResponse \= { status: 500, body: 'No response' };  
    for (let attempt \= 0; attempt \<= this.maxRetries; attempt\++) {  
      lastResponse \= super.request(url, options);  
      if (lastResponse.status \< 500) return lastResponse;  
    }  
    return lastResponse;  
  }  
}

## **Source code: httpDecorator.test.ts**

import {  
  BaseHttpClient,  
  LoggingDecorator,  
  AuthDecorator,  
  RetryDecorator,  
  HttpClient,  
} from './httpDecorator';

describe('HTTP Request Pipeline (Decorator)', () \=\> {

  // ── LoggingDecorator ────────────────────────────────  
  describe('LoggingDecorator', () \=\> {  
    it('record a before-request and after-request log entry', () \=\> {  
      const logger \= new LoggingDecorator(new BaseHttpClient());  
      logger.request('https://api.example.com/users');  
      const logs \= logger.getLogs();  
      expect(logs).toHaveLength(2);  
      expect(logs\[0\]).toContain('\[LOG\] GET');  
      expect(logs\[1\]).toContain('200');  
    });

    it('delegate the request to the wrapped client', () \=\> {  
      const mockClient: HttpClient \= {  
        request: jest.fn().mockReturnValue({ status: 201, body: 'Created' }),  
      };  
      const logger \= new LoggingDecorator(mockClient);  
      const result \= logger.request('/items');  
      expect(mockClient.request).toHaveBeenCalledWith('/items', undefined);  
      expect(result).toEqual({ status: 201, body: 'Created' });  
    });

    it('return the wrapped response unchanged', () \=\> {  
      const mockClient: HttpClient \= {  
        request: jest.fn().mockReturnValue({ status: 404, body: 'Not found' }),  
      };  
      const result \= new LoggingDecorator(mockClient).request('/missing');  
      expect(result.status).toBe(404);  
    });  
  });

  // ── AuthDecorator ───────────────────────────────────  
  describe('AuthDecorator', () \=\> {  
    it('inject Authorization header with Bearer token', () \=\> {  
      const mockClient: HttpClient \= {  
        request: jest.fn().mockReturnValue({ status: 200, body: '' }),  
      };  
      const auth \= new AuthDecorator(mockClient, 'my-secret-token');  
      auth.request('/protected');  
      expect(mockClient.request).toHaveBeenCalledWith('/protected', {  
        headers: { Authorization: 'Bearer my-secret-token' },  
      });  
    });

    it('merge Authorization with pre-existing headers', () \=\> {  
      const mockClient: HttpClient \= {  
        request: jest.fn().mockReturnValue({ status: 200, body: '' }),  
      };  
      new AuthDecorator(mockClient, 'tok').request('/data', {  
        headers: { 'X-App': 'v1' },  
      });  
      const opts \= (mockClient.request as jest.Mock).mock.calls\[0\]\[1\];  
      expect(opts.headers\['X-App'\]).toBe('v1');  
      expect(opts.headers\['Authorization'\]).toBe('Bearer tok');  
    });

    it('does not modify the original options object', () \=\> {  
      const mockClient: HttpClient \= {  
        request: jest.fn().mockReturnValue({ status: 200, body: '' }),  
      };  
      const original \= { headers: { 'X-Trace': 'abc' } };  
      new AuthDecorator(mockClient, 'tok').request('/', original);  
      // Original must be immutable  
      expect(original.headers).not.toHaveProperty('Authorization');  
    });  
  });

  // ── RetryDecorator ──────────────────────────────────  
  describe('RetryDecorator', () \=\> {  
    it('return immediately on a 2xx success without retrying', () \=\> {  
      const mockClient: HttpClient \= {  
        request: jest.fn().mockReturnValue({ status: 200, body: 'ok' }),  
      };  
      new RetryDecorator(mockClient, 3).request('/health');  
      expect(mockClient.request).toHaveBeenCalledTimes(1);  
    });

    it('retries exactly maxRetries times on persistent 500 errors', () \=\> {  
      const mockClient: HttpClient \= {  
        request: jest.fn().mockReturnValue({ status: 500, body: 'err' }),  
      };  
      new RetryDecorator(mockClient, 2).request('/flaky');  
      // 1 initial attempt \+ 2 retries \= 3 total calls  
      expect(mockClient.request).toHaveBeenCalledTimes(3);  
    });

    it('stop retrying as soon as a non-5xx response is received', () \=\> {  
      const mockClient: HttpClient \= {  
        request: jest.fn()  
          .mockReturnValueOnce({ status: 500, body: 'err' })  
          .mockReturnValueOnce({ status: 200, body: 'ok' }),  
      };  
      const result \= new RetryDecorator(mockClient, 3).request('/recovering');  
      expect(mockClient.request).toHaveBeenCalledTimes(2);  
      expect(result.status).toBe(200);  
    });  
  });

  // ── Stacked Decorator Chain ─────────────────────────  
  it('stacked: Log \-\> Auth \-\> Retry \-\> Base all cooperate correctly', () \=\> {  
    const mockBase: HttpClient \= {  
      request: jest.fn().mockReturnValue({ status: 200, body: 'ok' }),  
    };  
    const pipeline \= new LoggingDecorator(  
      new AuthDecorator(  
        new RetryDecorator(mockBase, 1), 'tok'));  
    const result \= pipeline.request('/stack');  
    expect(result.status).toBe(200);  
    expect(mockBase.request).toHaveBeenCalledTimes(1);  
  });

});

3. # **Ex2 \- Data Stream**

## **Describe**

A data processing pipeline needs to write data that may optionally be compressed, encrypted, or both. Each transformation is a Decorator – they can be stacked in any order.

## **Source code: streamDecorator.ts**

// Component Interface  
export interface DataWriter {  
  write(data: string): string;  
}

// Concrete Component – writes raw data with a FILE: prefix  
export class FileWriter implements DataWriter {  
  write(data: string): string {  
    return \`FILE:${data}\`;  
  }  
}

// Base Decorator  
export abstract class DataWriterDecorator implements DataWriter {  
  constructor(protected wrapped: DataWriter) {}

  write(data: string): string {  
    return this.wrapped.write(data);  
  }  
}

// Concrete Decorator 1 – Compression  
export class CompressionDecorator extends DataWriterDecorator {  
  write(data: string): string {  
    const compressed \= \`COMPRESSED(${data})\`;  
    return super.write(compressed);  
  }  
}

// Concrete Decorator 2 – Encryption (key-based)  
export class EncryptionDecorator extends DataWriterDecorator {  
  constructor(wrapped: DataWriter, private key: string) { super(wrapped); }

  write(data: string): string {  
    const encrypted \= \`ENCRYPTED\[${this.key}\](${data})\`;  
    return super.write(encrypted);  
  }  
}

// Concrete Decorator 3 – Checksum (appends data length as checksum)  
export class ChecksumDecorator extends DataWriterDecorator {  
  write(data: string): string {  
    const checksum \= data.length;  
    return super.write(\`${data}|cs=${checksum}\`);  
  }  
}

## **Source code: streamDecorator.test.ts**

import {  
  FileWriter,  
  CompressionDecorator,  
  EncryptionDecorator,  
  ChecksumDecorator,  
  DataWriter,  
} from './streamDecorator';

describe('Data Stream Decorator', () \=\> {

  // ── Concrete Component ──────────────────────────────  
  describe('FileWriter (base component)', () \=\> {  
    it('prepend FILE: to the written data', () \=\> {  
      expect(new FileWriter().write('hello')).toBe('FILE:hello');  
    });

    it('handle empty string without error', () \=\> {  
      expect(new FileWriter().write('')).toBe('FILE:');  
    });  
  });

  // ── Individual Decorators ───────────────────────────  
  describe('CompressionDecorator', () \=\> {  
    it('wrap data in COMPRESSED() before passing to the next layer', () \=\> {  
      const result \= new CompressionDecorator(new FileWriter()).write('data');  
      expect(result).toBe('FILE:COMPRESSED(data)');  
    });

    it('delegate with the transformed payload', () \=\> {  
      const mockWriter: DataWriter \= { write: jest.fn().mockReturnValue('ok') };  
      new CompressionDecorator(mockWriter).write('payload');  
      expect(mockWriter.write).toHaveBeenCalledWith('COMPRESSED(payload)');  
    });  
  });

  describe('EncryptionDecorator', () \=\> {  
    it('wrap data with the encryption key in the output string', () \=\> {  
      const result \= new EncryptionDecorator(new FileWriter(), 'k1').write('data');  
      expect(result).toBe('FILE:ENCRYPTED\[k1\](data)');  
    });

    it('use the exact key string provided at construction', () \=\> {  
      const mockWriter: DataWriter \= { write: jest.fn().mockReturnValue('') };  
      new EncryptionDecorator(mockWriter, 'supersecret').write('msg');  
      expect(mockWriter.write).toHaveBeenCalledWith('ENCRYPTED\[supersecret\](msg)');  
    });

    it('different keys produce different encrypted output', () \=\> {  
      const w1 \= new EncryptionDecorator(new FileWriter(), 'key-A').write('x');  
      const w2 \= new EncryptionDecorator(new FileWriter(), 'key-B').write('x');  
      expect(w1).not.toBe(w2);  
    });  
  });

  describe('ChecksumDecorator', () \=\> {  
    it('append |cs=\<length\> to the data before delegating', () \=\> {  
      const mockWriter: DataWriter \= { write: jest.fn().mockReturnValue('') };  
      new ChecksumDecorator(mockWriter).write('hello');  
      expect(mockWriter.write).toHaveBeenCalledWith('hello|cs=5');  
    });

    it('calculate checksum based on original (pre-checksum) data length', () \=\> {  
      const mockWriter: DataWriter \= { write: jest.fn().mockReturnValue('') };  
      new ChecksumDecorator(mockWriter).write('ab');  
      expect(mockWriter.write).toHaveBeenCalledWith('ab|cs=2');  
    });  
  });

  // ── Stacked Decorators ──────────────────────────────  
  describe('Stacked Decorators', () \=\> {  
    it('Compress \-\> Encrypt \-\> File produces correct layered output', () \=\> {  
      const writer \= new CompressionDecorator(  
        new EncryptionDecorator(new FileWriter(), 'k1'));  
      expect(writer.write('hi')).toBe('FILE:ENCRYPTED\[k1\](COMPRESSED(hi))');  
    });

    it('Encrypt \-\> Compress \-\> File produces a different output (order matters)', () \=\> {  
      const compThenEnc \= new EncryptionDecorator(  
        new CompressionDecorator(new FileWriter()), 'k');  
      const encThenComp \= new CompressionDecorator(  
        new EncryptionDecorator(new FileWriter(), 'k'));  
      expect(compThenEnc.write('x')).not.toBe(encThenComp.write('x'));  
    });

    it('Checksum \-\> Compress \-\> File: all three layers present in output', () \=\> {  
      const writer \= new ChecksumDecorator(  
        new CompressionDecorator(new FileWriter()));  
      const result \= writer.write('abc');  
      expect(result).toContain('FILE:');  
      expect(result).toContain('COMPRESSED');  
      expect(result).toContain('cs=');  
    });

    it('triple-stacked same decorator applies the transformation three times', () \=\> {  
      const writer \= new CompressionDecorator(  
        new CompressionDecorator(  
          new CompressionDecorator(new FileWriter())));  
      expect(writer.write('x')).toBe(  
        'FILE:COMPRESSED(COMPRESSED(COMPRESSED(x)))');  
    });  
  });

});

4. # **Ex3 \- Coffee Order**

## **Describe**

A coffee shop system needs to calculate the price and description of drinks with optional add-ons: milk, vanilla syrup, and extra shot. Each add-on is a Decorator that wraps the base drink.

## **Source code: coffeeDecorator.ts**

// Component Interface  
export interface Coffee {  
  getDescription(): string;  
  getCost(): number;  
}

// Concrete Components – base drinks  
export class Espresso implements Coffee {  
  getDescription(): string { return 'Espresso'; }  
  getCost(): number        { return 1.50; }  
}

export class Drip implements Coffee {  
  getDescription(): string { return 'Drip Coffee'; }  
  getCost(): number        { return 1.00; }  
}

// Base Decorator – forwards both methods by default  
export abstract class CoffeeDecorator implements Coffee {  
  constructor(protected coffee: Coffee) {}  
  getDescription(): string { return this.coffee.getDescription(); }  
  getCost(): number        { return this.coffee.getCost(); }  
}

// Concrete Decorators – each adds exactly one add-on  
export class MilkDecorator extends CoffeeDecorator {  
  getDescription(): string { return \`${super.getDescription()}, Milk\`; }  
  getCost(): number        { return super.getCost() \+ 0.25; }  
}

export class VanillaDecorator extends CoffeeDecorator {  
  getDescription(): string { return \`${super.getDescription()}, Vanilla\`; }  
  getCost(): number        { return super.getCost() \+ 0.50; }  
}

export class ExtraShotDecorator extends CoffeeDecorator {  
  getDescription(): string { return \`${super.getDescription()}, Extra Shot\`; }  
  getCost(): number        { return super.getCost() \+ 0.75; }  
}

## **Source code: coffeeDecorator.test.ts**

import {  
  Espresso,  
  Drip,  
  MilkDecorator,  
  VanillaDecorator,  
  ExtraShotDecorator,  
  Coffee,  
} from './coffeeDecorator';

describe('Coffee Order Builder (Decorator)', () \=\> {

  // ── Concrete Components ─────────────────────────────  
  describe('Base Drinks', () \=\> {  
    it('Espresso has correct description and cost', () \=\> {  
      const drink \= new Espresso();  
      expect(drink.getDescription()).toBe('Espresso');  
      expect(drink.getCost()).toBe(1.50);  
    });

    it('Drip has correct description and cost', () \=\> {  
      const drink \= new Drip();  
      expect(drink.getDescription()).toBe('Drip Coffee');  
      expect(drink.getCost()).toBe(1.00);  
    });  
  });

  // ── Single Decorators ───────────────────────────────  
  describe('Single Add-ons', () \=\> {  
    it('MilkDecorator appends ", Milk" and adds 0.25', () \=\> {  
      const drink \= new MilkDecorator(new Espresso());  
      expect(drink.getDescription()).toBe('Espresso, Milk');  
      expect(drink.getCost()).toBeCloseTo(1.75);  
    });

    it('VanillaDecorator appends ", Vanilla" and adds 0.50', () \=\> {  
      const drink \= new VanillaDecorator(new Drip());  
      expect(drink.getDescription()).toBe('Drip Coffee, Vanilla');  
      expect(drink.getCost()).toBeCloseTo(1.50);  
    });

    it('ExtraShotDecorator appends ", Extra Shot" and adds 0.75', () \=\> {  
      const drink \= new ExtraShotDecorator(new Espresso());  
      expect(drink.getDescription()).toBe('Espresso, Extra Shot');  
      expect(drink.getCost()).toBeCloseTo(2.25);  
    });  
  });

  // ── Stacked Decorators ──────────────────────────────  
  describe('Stacked Add-ons', () \=\> {  
    it('Espresso \+ Milk \+ Vanilla: description and cost accumulate correctly', () \=\> {  
      const drink \= new VanillaDecorator(new MilkDecorator(new Espresso()));  
      expect(drink.getDescription()).toBe('Espresso, Milk, Vanilla');  
      expect(drink.getCost()).toBeCloseTo(2.25);  
    });

    it('applying Milk twice doubles the milk cost', () \=\> {  
      const drink \= new MilkDecorator(new MilkDecorator(new Espresso()));  
      expect(drink.getDescription()).toBe('Espresso, Milk, Milk');  
      expect(drink.getCost()).toBeCloseTo(2.00);  
    });

    it('full order: Drip \+ Extra Shot \+ Vanilla \+ Milk \= 2.50', () \=\> {  
      const drink \= new MilkDecorator(  
        new VanillaDecorator(  
          new ExtraShotDecorator(new Drip())));  
      expect(drink.getDescription()).toBe('Drip Coffee, Extra Shot, Vanilla, Milk');  
      expect(drink.getCost()).toBeCloseTo(2.50);  
    });

    it('different stacking order produces different description order', () \=\> {  
      const milkFirst    \= new VanillaDecorator(new MilkDecorator(new Espresso()));  
      const vanillaFirst \= new MilkDecorator(new VanillaDecorator(new Espresso()));  
      expect(milkFirst.getDescription()).toBe('Espresso, Milk, Vanilla');  
      expect(vanillaFirst.getDescription()).toBe('Espresso, Vanilla, Milk');  
      // But costs are equal regardless of order  
      expect(milkFirst.getCost()).toBeCloseTo(vanillaFirst.getCost());  
    });  
  });

  // ── Mock Base ───────────────────────────────────────  
  it('each decorator is independently testable with a mock base', () \=\> {  
    const mockCoffee: Coffee \= {  
      getDescription: jest.fn().mockReturnValue('Mock'),  
      getCost:        jest.fn().mockReturnValue(1.00),  
    };  
    const drink \= new ExtraShotDecorator(mockCoffee);  
    expect(drink.getDescription()).toBe('Mock, Extra Shot');  
    expect(drink.getCost()).toBeCloseTo(1.75);  
    expect(mockCoffee.getDescription).toHaveBeenCalledTimes(1);  
    expect(mockCoffee.getCost).toHaveBeenCalledTimes(1);  
  });

});  
