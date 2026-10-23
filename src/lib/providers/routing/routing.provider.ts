export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RouteResult {
  distanceKm: number;
  durationMinutes: number;
  polyline?: string;
  source: "osrm" | "calculated_fallback";
}

export interface GeocodeResult {
  displayName: string;
  village?: string;
  taluka?: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
}

export interface IRoutingProvider {
  readonly name: string;
  calculateRoute(start: Coordinates, end: Coordinates): Promise<RouteResult>;
  geocode(query: string): Promise<GeocodeResult[]>;
  reverseGeocode(coords: Coordinates): Promise<GeocodeResult | null>;
}
