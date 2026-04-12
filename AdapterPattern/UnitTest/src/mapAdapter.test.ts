import {
  GoogleMapsAdapter, GoogleMapsAPI,
  OpenStreetMapAdapter, OpenStreetMapAPI,
  MapService, Coordinates,
} from './mapAdapter';

describe('Map Service Adapter', () => {

  // ── Google Maps Adapter ─────────────────────────────
  describe('GoogleMapsAdapter', () => {
    let mockGoogle: jest.Mocked<GoogleMapsAPI>;
    let adapter: MapService;

    beforeEach(() => {
      mockGoogle = {
        findLocation:   jest.fn().mockReturnValue({ latitude: 10.762, longitude: 106.660 }),
        calculateRoute: jest.fn().mockReturnValue({ km: 12.5, minutes: 28 }),
      } as any;
      adapter = new GoogleMapsAdapter(mockGoogle);
    });

    it('geocode() maps { latitude, longitude } -> { lat, lng }', () => {
      const coords = adapter.geocode('Ho Chi Minh City');
      expect(coords).toEqual({ lat: 10.762, lng: 106.660 });
    });

    it('geocode() forwards the address string to findLocation()', () => {
      adapter.geocode('Hanoi, Vietnam');
      expect(mockGoogle.findLocation).toHaveBeenCalledWith('Hanoi, Vietnam');
    });

    it('getRoute() maps { km, minutes } -> { distanceKm, durationMin }', () => {
      const from: Coordinates = { lat: 10.76, lng: 106.66 };
      const to:   Coordinates = { lat: 21.03, lng: 105.85 };
      const route = adapter.getRoute(from, to);
      expect(route).toEqual({ distanceKm: 12.5, durationMin: 28 });
    });

    it('getRoute() passes formatted coordinate strings to calculateRoute()', () => {
      const from: Coordinates = { lat: 10.0, lng: 106.0 };
      const to:   Coordinates = { lat: 21.0, lng: 105.0 };
      adapter.getRoute(from, to);
      expect(mockGoogle.calculateRoute).toHaveBeenCalledWith('10,106', '21,105');
    });
  });

  // ── OpenStreetMap Adapter ───────────────────────────
  describe('OpenStreetMapAdapter', () => {
    let mockOSM: jest.Mocked<OpenStreetMapAPI>;
    let adapter: MapService;

    beforeEach(() => {
      mockOSM = {
        lookup:     jest.fn().mockReturnValue([10.776, 106.700]),
        directions: jest.fn().mockReturnValue({ distance: 8.3, time: 20 }),
      } as any;
      adapter = new OpenStreetMapAdapter(mockOSM);
    });

    it('geocode() maps [lat, lon] tuple -> { lat, lng } object', () => {
      const coords = adapter.geocode('Da Nang');
      expect(coords).toEqual({ lat: 10.776, lng: 106.700 });
    });

    it('geocode() forwards the address string to lookup()', () => {
      adapter.geocode('Can Tho');
      expect(mockOSM.lookup).toHaveBeenCalledWith('Can Tho');
    });

    it('getRoute() passes individual lat/lng args to directions()', () => {
      const from: Coordinates = { lat: 10.0, lng: 106.0 };
      const to:   Coordinates = { lat: 21.0, lng: 105.0 };
      adapter.getRoute(from, to);
      expect(mockOSM.directions).toHaveBeenCalledWith(10.0, 106.0, 21.0, 105.0);
    });

    it('getRoute() maps { distance, time } -> { distanceKm, durationMin }', () => {
      const route = adapter.getRoute({ lat: 0, lng: 0 }, { lat: 1, lng: 1 });
      expect(route).toEqual({ distanceKm: 8.3, durationMin: 20 });
    });
  });

  // ── Provider-agnostic client ────────────────────────
  it('client can swap providers transparently via MapService interface', () => {
    function getDistance(service: MapService): number {
      return service.getRoute({ lat: 10.0, lng: 106.0 }, { lat: 11.0, lng: 107.0 }).distanceKm;
    }
    const google = new GoogleMapsAdapter(new GoogleMapsAPI());
    const osm    = new OpenStreetMapAdapter(new OpenStreetMapAPI());

    // Client code is provider-agnostic – both must return a number
    expect(typeof getDistance(google)).toBe('number');
    expect(typeof getDistance(osm)).toBe('number');
  });

  it('both adapters return Route objects with the same shape', () => {
    const from: Coordinates = { lat: 10.0, lng: 106.0 };
    const to:   Coordinates = { lat: 11.0, lng: 107.0 };

    const googleRoute = new GoogleMapsAdapter(new GoogleMapsAPI()).getRoute(from, to);
    const osmRoute    = new OpenStreetMapAdapter(new OpenStreetMapAPI()).getRoute(from, to);

    expect(googleRoute).toHaveProperty('distanceKm');
    expect(googleRoute).toHaveProperty('durationMin');
    expect(osmRoute).toHaveProperty('distanceKm');
    expect(osmRoute).toHaveProperty('durationMin');
  });

});
