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
  lookup(place: string): [number, number] { // returns [lat, lon] tuple
    return [10.776, 106.700];
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
    const loc = this.api.findLocation(address);
    return { lat: loc.latitude, lng: loc.longitude };
  }

  getRoute(from: Coordinates, to: Coordinates): Route {
    const r = this.api.calculateRoute(
      `${from.lat},${from.lng}`,
      `${to.lat},${to.lng}`
    );
    return { distanceKm: r.km, durationMin: r.minutes };
  }
}

// Adapter B – wraps OpenStreetMapAPI
export class OpenStreetMapAdapter implements MapService {
  constructor(private api: OpenStreetMapAPI) {}

  geocode(address: string): Coordinates {
    const [lat, lon] = this.api.lookup(address);
    return { lat, lng: lon };
  }

  getRoute(from: Coordinates, to: Coordinates): Route {
    const r = this.api.directions(from.lat, from.lng, to.lat, to.lng);
    return { distanceKm: r.distance, durationMin: r.time };
  }
}
