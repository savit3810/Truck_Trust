import { IRoutingProvider, Coordinates, RouteResult, GeocodeResult } from "./routing.provider";
import { OsrmAdapter } from "./osrm.adapter";
import { PhotonAdapter } from "./photon.adapter";

export * from "./routing.provider";

class CompositeRoutingProvider implements IRoutingProvider {
  readonly name = "osrm-photon-composite";
  private osrm = new OsrmAdapter();
  private photon = new PhotonAdapter();

  async calculateRoute(start: Coordinates, end: Coordinates): Promise<RouteResult> {
    return this.osrm.calculateRoute(start, end);
  }

  async geocode(query: string): Promise<GeocodeResult[]> {
    return this.photon.geocode(query);
  }

  async reverseGeocode(coords: Coordinates): Promise<GeocodeResult | null> {
    return this.photon.reverseGeocode(coords);
  }
}

let routingInstance: IRoutingProvider | null = null;

export function getRoutingProvider(): IRoutingProvider {
  if (!routingInstance) {
    routingInstance = new CompositeRoutingProvider();
  }
  return routingInstance;
}
