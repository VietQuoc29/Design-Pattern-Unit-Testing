1. # **Adapter Pattern**

   1. ## **Definition**

The Adapter Pattern (also known as Wrapper) converts the interface of a class into another interface that clients expect. It allows classes with incompatible interfaces to work together without modifying their source code.

When you have an existing class (Adaptee) whose interface does not match what the client code expects (Target), you create an Adapter class that wraps the Adaptee and translates calls from the Target interface into calls the Adaptee understands.

2. ## **Structure**

The Adapter Pattern consists of four main components:

- Target Interface: The interface that the client code expects to work with. This is the standard interface used throughout the application.

- Adaptee (Incompatible Class): The existing class with a useful implementation but an interface that does not match the Target. This is typically a legacy class or third-party library.

- Adapter: The class that implements the Target interface and wraps the Adaptee. It translates Target interface calls into Adaptee method calls.

- Client: The code that uses the Target interface to interact with objects, unaware of the underlying Adaptee implementation.

  3. ## **Applicability**

- Want to use some existing class, but its interface isn’t compatible with the rest of your code.  
- Want to reuse several existing subclasses that lack some common functionality that can’t be added to the superclass.

  4. ## **Pros and cons**

| Prospects | Consequences |
| :---- | :---- |
| Single Responsibility Principle | The overall complexity of the code increases |
| Open/Closed Principle |  |

# 

2. # **Ex1 \- Payment Gateway**

## **Describe**

An e-commerce application uses a standard PaymentProcessor interface. A new third-party payment provider (MomoService) has a completely different API. Instead of rewriting the client code, an Adapter translates the standard interface into Momo-specific calls.

## **Source code: paymentAdapter.ts**

// Target Interface – what the client code expects  
export interface PaymentProcessor {  
  processPayment(amount: number, currency: string): PaymentResult;  
  refundPayment(transactionId: string): boolean;  
}

export interface PaymentResult {  
  success:       boolean;  
  transactionId: string;  
  message:       string;  
}

// Adaptee – third-party Momo-like service with incompatible interface  
export class MomoService {  
  charge(amountInCents: number, curr: string): { id: string; status: string } {  
    return { id: \`momo\_${amountInCents}\`, status: 'succeeded' };  
  }  
  reverse(chargeId: string): { reversed: boolean } {  
    return { reversed: true };  
  }  
}

// Adapter – wraps MomoService, implements the standard PaymentProcessor  
export class MomoAdapter implements PaymentProcessor {  
  constructor(private momo: MomoService) {}

  processPayment(amount: number, currency: string): PaymentResult {  
    const result \= this.momo.charge(amount, currency);  
    return {  
      success:       result.status \=== 'succeeded',  
      transactionId: result.id,  
      message:       \`Charged ${amount} ${currency} via Momo\`,  
    };  
  }

  refundPayment(transactionId: string): boolean {  
    const result \= this.momo.reverse(transactionId);  
    return result.reversed;  
  }  
}

## **Source code: paymentAdapter.test.ts**

import { MomoAdapter, MomoService, PaymentProcessor } from './paymentAdapter';

describe('Payment Gateway Adapter', () \=\> {

  it('processPayment() returns a successful PaymentResult', () \=\> {  
    const adapter: PaymentProcessor \= new MomoAdapter(new MomoService());  
    const result \= adapter.processPayment(50, 'VND');

    expect(result.success).toBe(true);  
    expect(result.transactionId).toContain('momo\_');  
    expect(result.message).toContain('50 VND');  
  });

  it('maps momo status "succeeded" to result.success \= true', () \=\> {  
    const mockMomo \= {  
      charge:  jest.fn().mockReturnValue({ id: '001', status: 'succeeded' }),  
      reverse: jest.fn(),  
    };  
    const result \= new MomoAdapter(mockMomo as any).processPayment(10, 'VND');  
    expect(result.success).toBe(true);  
  });

  it('maps momo status other than "succeeded" to result.success \= false', () \=\> {  
    const mockMomo \= {  
      charge:  jest.fn().mockReturnValue({ id: '002', status: 'failed' }),  
      reverse: jest.fn(),  
    };  
    const result \= new MomoAdapter(mockMomo as any).processPayment(10, 'VND');  
    expect(result.success).toBe(false);  
  });

  it('refundPayment() delegates to momo.reverse() and maps the result', () \=\> {  
    const mockMomo \= {  
      charge:  jest.fn(),  
      reverse: jest.fn().mockReturnValue({ reversed: true }),  
    };  
    const adapter \= new MomoAdapter(mockMomo as any);  
    const result  \= adapter.refundPayment('refund');

    expect(mockMomo.reverse).toHaveBeenCalledWith('refund');  
    expect(result).toBe(true);  
  });

  it('client code works with PaymentProcessor – completely unaware of Momo', () \=\> {  
    function checkout(processor: PaymentProcessor, amount: number) {  
      return processor.processPayment(amount, 'VND');  
    }  
    const adapter \= new MomoAdapter(new MomoService());  
    expect(checkout(adapter, 100).success).toBe(true);  
  });

});

3. # **Ex2 \- Logger**

## **Describe**

A modern application uses a standard Logger interface with log(), warn(), and error() methods. A legacy logging library (LegacyLogger) only exposes a single write() method with a level parameter. The Adapter bridges the two without touching the legacy code.

## **Source code: loggerAdapter.ts**

// Target Interface – modern logging contract used across the application  
export interface Logger {  
  log(message: string):   void;  
  warn(message: string):  void;  
  error(message: string): void;  
}

// Adaptee – legacy library with a single write() method (incompatible interface)  
export class LegacyLogger {  
  write(level: 'INFO' | 'WARNING' | 'ERROR', message: string): void {  
    // Simulated legacy output  
    console.log(\`\[${level}\] ${message}\`);  
  }  
}

// Adapter – Object Adapter using composition  
export class LegacyLoggerAdapter implements Logger {  
  constructor(private legacy: LegacyLogger) {}

  log(message: string): void {  
    this.legacy.write('INFO', message);  
  }

  warn(message: string): void {  
    this.legacy.write('WARNING', message);  
  }

  error(message: string): void {  
    this.legacy.write('ERROR', message);  
  }  
}

## **Source code: loggerAdapter.test.ts**

import { LegacyLoggerAdapter, LegacyLogger, Logger } from './loggerAdapter';

describe('Legacy Logger Adapter', () \=\> {

  let mockLegacy: jest.Mocked\<LegacyLogger\>;  
  let adapter: Logger;

  beforeEach(() \=\> {  
    mockLegacy \= { write: jest.fn() } as any;  
    adapter    \= new LegacyLoggerAdapter(mockLegacy);  
  });

  it('log() calls legacy.write() with level "INFO"', () \=\> {  
    adapter.log('Server started');  
    expect(mockLegacy.write).toHaveBeenCalledWith('INFO', 'Server started');  
  });

  it('warn() calls legacy.write() with level "WARNING"', () \=\> {  
    adapter.warn('High memory usage');  
    expect(mockLegacy.write).toHaveBeenCalledWith('WARNING', 'High memory usage');  
  });

  it('error() calls legacy.write() with level "ERROR"', () \=\> {  
    adapter.error('Database unreachable');  
    expect(mockLegacy.write).toHaveBeenCalledWith('ERROR', 'Database unreachable');  
  });

  it('each adapter method maps to exactly one write() call', () \=\> {  
    adapter.log('log');  
    adapter.warn('warn');  
    adapter.error('error');  
    expect(mockLegacy.write).toHaveBeenCalledTimes(3);  
  });

  it('passes the message string unchanged to the legacy write() call', () \=\> {  
    const msg \= 'Error in line 20';  
    adapter.error(msg);  
    expect(mockLegacy.write).toHaveBeenCalledWith('ERROR', msg);  
  });

  it('adapter is a drop-in replacement for the Logger interface', () \=\> {  
    function logStartup(logger: Logger) {  
      logger.log('App booting');  
      logger.warn('Running in development mode');  
    }  
    expect(() \=\> logStartup(adapter)).not.toThrow();  
    expect(mockLegacy.write).toHaveBeenCalledTimes(2);  
  });

  it('does not mix up level strings across methods', () \=\> {  
    adapter.log('info msg');  
    adapter.error('error msg');  
    const calls \= mockLegacy.write.mock.calls;  
    expect(calls\[0\]\[0\]).toBe('INFO');  
    expect(calls\[1\]\[0\]).toBe('ERROR');  
  });

});

4. # **Ex3 \- Third-party Map Service**

## **Describe**

An application depends on a standard MapService interface for geocoding and routing. Two third-party providers (GoogleMapsAPI and OpenStreetMapAPI) each have different method signatures and return formats. Adapters allow the application to switch between providers without changing a single line of client code.

## **Source code: mapAdapter.ts**

// Target Interface – standard map contract used by the application  
export interface MapService {  
  geocode(address: string): Coordinates;  
  getRoute(from: Coordinates, to: Coordinates): Route;  
}

export interface Coordinates { lat: number; lng: number; }  
export interface Route       { distanceKm: number; durationMin: number; }

// Adaptee A – Google Maps API (incompatible return format)  
export class GoogleMapsAPI {  
  findLocation(query: string): { latitude: number; longitude: number } {  
    return { latitude: 10.762, longitude: 106.660 };  
  }  
  calculateRoute(origin: string, dest: string): { km: number; minutes: number } {  
    return { km: 12.5, minutes: 28 };  
  }  
}

// Adaptee B – OpenStreetMap API (different incompatible format)  
export class OpenStreetMapAPI {  
  lookup(place: string): \[number, number\] { // returns \[lat, lon\] tuple  
    return \[10.776, 106.700\];  
  }  
  directions(  
    latA: number, lngA: number,  
    latB: number, lngB: number  
  ): { distance: number; time: number } {  
    return { distance: 8.3, time: 20 };  
  }  
}

// Adapter A – wraps GoogleMapsAPI  
export class GoogleMapsAdapter implements MapService {  
  constructor(private api: GoogleMapsAPI) {}

  geocode(address: string): Coordinates {  
    const loc \= this.api.findLocation(address);  
    return { lat: loc.latitude, lng: loc.longitude };  
  }

  getRoute(from: Coordinates, to: Coordinates): Route {  
    const r \= this.api.calculateRoute(  
      \`${from.lat},${from.lng}\`,  
      \`${to.lat},${to.lng}\`  
    );  
    return { distanceKm: r.km, durationMin: r.minutes };  
  }  
}

// Adapter B – wraps OpenStreetMapAPI  
export class OpenStreetMapAdapter implements MapService {  
  constructor(private api: OpenStreetMapAPI) {}

  geocode(address: string): Coordinates {  
    const \[lat, lon\] \= this.api.lookup(address);  
    return { lat, lng: lon };  
  }

  getRoute(from: Coordinates, to: Coordinates): Route {  
    const r \= this.api.directions(from.lat, from.lng, to.lat, to.lng);  
    return { distanceKm: r.distance, durationMin: r.time };  
  }  
}

## **Source code: mapAdapter.test.ts**

import {  
  GoogleMapsAdapter, GoogleMapsAPI,  
  OpenStreetMapAdapter, OpenStreetMapAPI,  
  MapService, Coordinates,  
} from './mapAdapter';

describe('Map Service Adapter', () \=\> {

  // ── Google Maps Adapter ─────────────────────────────  
  describe('GoogleMapsAdapter', () \=\> {  
    let mockGoogle: jest.Mocked\<GoogleMapsAPI\>;  
    let adapter: MapService;

    beforeEach(() \=\> {  
      mockGoogle \= {  
        findLocation:   jest.fn().mockReturnValue({ latitude: 10.767, longitude: 106.676 }),  
        calculateRoute: jest.fn().mockReturnValue({ km: 12.5, minutes: 28 }),  
      } as any;  
      adapter \= new GoogleMapsAdapter(mockGoogle);  
    });

    it('geocode() maps { latitude, longitude } \-\> { lat, lng }', () \=\> {  
      const coords \= adapter.geocode('Ho Chi Minh City');  
      expect(coords).toEqual({ lat: 10.767, lng: 106.676 });  
    });

    it('geocode() forwards the address string to findLocation()', () \=\> {  
      adapter.geocode('Hanoi, Vietnam');  
      expect(mockGoogle.findLocation).toHaveBeenCalledWith('Hanoi, Vietnam');  
    });

    it('getRoute() maps { km, minutes } \-\> { distanceKm, durationMin }', () \=\> {  
      const from: Coordinates \= { lat: 10.76, lng: 106.66 };  
      const to:   Coordinates \= { lat: 21.03, lng: 105.85 };  
      const route \= adapter.getRoute(from, to);  
      expect(route).toEqual({ distanceKm: 12.5, durationMin: 28 });  
    });

    it('getRoute() passes formatted coordinate strings to calculateRoute()', () \=\> {  
      const from: Coordinates \= { lat: 10.0, lng: 106.0 };  
      const to:   Coordinates \= { lat: 21.0, lng: 105.0 };  
      adapter.getRoute(from, to);  
      expect(mockGoogle.calculateRoute).toHaveBeenCalledWith('10,106', '21,105');  
    });  
  });

  // ── OpenStreetMap Adapter ───────────────────────────  
  describe('OpenStreetMapAdapter', () \=\> {  
    let mockOSM: jest.Mocked\<OpenStreetMapAPI\>;  
    let adapter: MapService;

    beforeEach(() \=\> {  
      mockOSM \= {  
        lookup:     jest.fn().mockReturnValue(\[10.776, 106.700\]),  
        directions: jest.fn().mockReturnValue({ distance: 8.3, time: 20 }),  
      } as any;  
      adapter \= new OpenStreetMapAdapter(mockOSM);  
    });

    it('geocode() maps \[lat, lon\] tuple \-\> { lat, lng } object', () \=\> {  
      const coords \= adapter.geocode('Da Nang');  
      expect(coords).toEqual({ lat: 10.776, lng: 106.700 });  
    });

    it('geocode() forwards the address string to lookup()', () \=\> {  
      adapter.geocode('Can Tho');  
      expect(mockOSM.lookup).toHaveBeenCalledWith('Can Tho');  
    });

    it('getRoute() passes individual lat/lng args to directions()', () \=\> {  
      const from: Coordinates \= { lat: 10.0, lng: 106.0 };  
      const to:   Coordinates \= { lat: 21.0, lng: 105.0 };  
      adapter.getRoute(from, to);  
      expect(mockOSM.directions).toHaveBeenCalledWith(10.0, 106.0, 21.0, 105.0);  
    });

    it('getRoute() maps { distance, time } \-\> { distanceKm, durationMin }', () \=\> {  
      const route \= adapter.getRoute({ lat: 0, lng: 0 }, { lat: 1, lng: 1 });  
      expect(route).toEqual({ distanceKm: 8.3, durationMin: 20 });  
    });  
  });

  // ── Provider-agnostic client ────────────────────────  
  it('client can swap providers transparently via MapService interface', () \=\> {  
    function getDistance(service: MapService): number {  
      return service.getRoute({ lat: 10.0, lng: 106.0 }, { lat: 11.0, lng: 107.0 }).distanceKm;  
    }  
    const google \= new GoogleMapsAdapter(new GoogleMapsAPI());  
    const osm    \= new OpenStreetMapAdapter(new OpenStreetMapAPI());

    // Client code is provider-agnostic – both must return a number  
    expect(typeof getDistance(google)).toBe('number');  
    expect(typeof getDistance(osm)).toBe('number');  
  });

  it('both adapters return Route objects with the same shape', () \=\> {  
    const from: Coordinates \= { lat: 10.0, lng: 106.0 };  
    const to:   Coordinates \= { lat: 11.0, lng: 107.0 };

    const googleRoute \= new GoogleMapsAdapter(new GoogleMapsAPI()).getRoute(from, to);  
    const osmRoute    \= new OpenStreetMapAdapter(new OpenStreetMapAPI()).getRoute(from, to);

    expect(googleRoute).toHaveProperty('distanceKm');  
    expect(googleRoute).toHaveProperty('durationMin');  
    expect(osmRoute).toHaveProperty('distanceKm');  
    expect(osmRoute).toHaveProperty('durationMin');  
  });

});

