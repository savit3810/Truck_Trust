import { Coordinates, RouteResult } from "./routing.provider";

export class OsrmAdapter {
  private calculateHaversineFallback(start: Coordinates, end: Coordinates): RouteResult {
    const R = 6371; // Earth radius in km
    const dLat = ((end.latitude - start.latitude) * Math.PI) / 180;
    const dLon = ((end.longitude - start.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((start.latitude * Math.PI) / 180) *
        Math.cos((end.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightKm = R * c;

    // Rural India road distance factor (approx 1.25x straight line due to terrain/ghats)
    const distanceKm = Math.round(straightKm * 1.25 * 10) / 10;
    // Average truck speed in rural Maharashtra corridors (35-40 km/h)
    const durationMinutes = Math.max(15, Math.round((distanceKm / 35) * 60));

    return {
      distanceKm: Math.max(1, distanceKm),
      durationMinutes,
      source: "calculated_fallback",
    };
  }

  async calculateRoute(start: Coordinates, end: Coordinates): Promise<RouteResult> {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=simplified&geometries=geojson`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return this.calculateHaversineFallback(start, end);
      }

      const data = await response.json();
      if (data.code === "Ok" && data.routes?.length > 0) {
        const route = data.routes[0];
        const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
        const durationMinutes = Math.round(route.duration / 60);

        return {
          distanceKm: Math.max(1, distanceKm),
          durationMinutes: Math.max(10, durationMinutes),
          polyline: JSON.stringify(route.geometry?.coordinates),
          source: "osrm",
        };
      }

      return this.calculateHaversineFallback(start, end);
    } catch {
      return this.calculateHaversineFallback(start, end);
    }
  }
}
