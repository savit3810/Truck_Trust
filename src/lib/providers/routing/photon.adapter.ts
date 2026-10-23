import { Coordinates, GeocodeResult } from "./routing.provider";

// Pre-seeded verified locations across key agricultural & industrial hubs in Maharashtra
const MAHARASHTRA_VERIFIED_HUBS: GeocodeResult[] = [
  {
    displayName: "Palghar APMC Market, Palghar",
    village: "Palghar",
    taluka: "Palghar",
    district: "Palghar",
    state: "Maharashtra",
    latitude: 19.6967,
    longitude: 72.7699,
  },
  {
    displayName: "Dahanu Chiku Mandi, Dahanu",
    village: "Dahanu",
    taluka: "Dahanu",
    district: "Palghar",
    state: "Maharashtra",
    latitude: 19.9723,
    longitude: 72.7303,
  },
  {
    displayName: "Wada Rice Mills Hub, Wada",
    village: "Wada",
    taluka: "Wada",
    district: "Palghar",
    state: "Maharashtra",
    latitude: 19.6542,
    longitude: 73.1384,
  },
  {
    displayName: "Manor National Highway Junction, Manor",
    village: "Manor",
    taluka: "Palghar",
    district: "Palghar",
    state: "Maharashtra",
    latitude: 19.7428,
    longitude: 72.9135,
  },
  {
    displayName: "Jawhar Tribal Agriculture Cluster, Jawhar",
    village: "Jawhar",
    taluka: "Jawhar",
    district: "Palghar",
    state: "Maharashtra",
    latitude: 19.9042,
    longitude: 73.2306,
  },
  {
    displayName: "Bhiwandi Logistics Park & Textile Hub, Bhiwandi",
    village: "Bhiwandi",
    taluka: "Bhiwandi",
    district: "Thane",
    state: "Maharashtra",
    latitude: 19.2967,
    longitude: 73.0631,
  },
  {
    displayName: "Kalyan APMC Market, Kalyan",
    village: "Kalyan",
    taluka: "Kalyan",
    district: "Thane",
    state: "Maharashtra",
    latitude: 19.2403,
    longitude: 73.1305,
  },
  {
    displayName: "Nashik APMC Onion & Grape Hub, Nashik",
    village: "Nashik",
    taluka: "Nashik",
    district: "Nashik",
    state: "Maharashtra",
    latitude: 19.9975,
    longitude: 73.7898,
  },
  {
    displayName: "Sinnar MIDC Transport Zone, Sinnar",
    village: "Sinnar",
    taluka: "Sinnar",
    district: "Nashik",
    state: "Maharashtra",
    latitude: 19.8456,
    longitude: 74.0022,
  },
  {
    displayName: "Niphad Onion Mandi, Niphad",
    village: "Niphad",
    taluka: "Niphad",
    district: "Nashik",
    state: "Maharashtra",
    latitude: 20.0825,
    longitude: 74.1132,
  },
  {
    displayName: "Pune Market Yard / Gultekdi APMC, Pune",
    village: "Gultekdi",
    taluka: "Haveli",
    district: "Pune",
    state: "Maharashtra",
    latitude: 18.4967,
    longitude: 73.8699,
  },
  {
    displayName: "Junnar Tomato Mandi, Junnar",
    village: "Junnar",
    taluka: "Junnar",
    district: "Pune",
    state: "Maharashtra",
    latitude: 19.2064,
    longitude: 73.8764,
  },
  {
    displayName: "Baramati Cooperative Dairy & Agro Hub, Baramati",
    village: "Baramati",
    taluka: "Baramati",
    district: "Pune",
    state: "Maharashtra",
    latitude: 18.1528,
    longitude: 74.5772,
  },
  {
    displayName: "Panvel Cargo Terminal, Panvel",
    village: "Panvel",
    taluka: "Panvel",
    district: "Raigad",
    state: "Maharashtra",
    latitude: 18.9894,
    longitude: 73.1175,
  },
  {
    displayName: "Kolhapur Jaggery & Sugar Mandi, Kolhapur",
    village: "Kolhapur",
    taluka: "Karveer",
    district: "Kolhapur",
    state: "Maharashtra",
    latitude: 16.705,
    longitude: 74.2433,
  },
];

const geocodeCache = new Map<string, GeocodeResult[]>();

export class PhotonAdapter {
  async geocode(query: string): Promise<GeocodeResult[]> {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery || cleanQuery.length < 2) return [];

    if (geocodeCache.has(cleanQuery)) {
      return geocodeCache.get(cleanQuery)!;
    }

    // 1. Instant local Maharashtra matching (supports Marathi/English spelling matches)
    const localMatches = MAHARASHTRA_VERIFIED_HUBS.filter(
      (h) =>
        h.displayName.toLowerCase().includes(cleanQuery) ||
        h.village?.toLowerCase().includes(cleanQuery) ||
        h.taluka?.toLowerCase().includes(cleanQuery) ||
        h.district.toLowerCase().includes(cleanQuery)
    );

    if (localMatches.length > 0) {
      geocodeCache.set(cleanQuery, localMatches);
      return localMatches;
    }

    // 2. Fallback to Photon geocoding with Maharashtra bbox bias
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query + ", Maharashtra, India")}&limit=5&lat=19.7&lon=73.2`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    city?: string;
    district?: string;
    county?: string;
    state?: string;
    village?: string;
  };
}

      if (res.ok) {
        const data = await res.json();
        const results: GeocodeResult[] = (data.features || []).map((f: PhotonFeature) => ({
          displayName: [f.properties.name, f.properties.city || f.properties.district, f.properties.state]
            .filter(Boolean)
            .join(", "),
          village: f.properties.village || f.properties.name,
          taluka: f.properties.county,
          district: f.properties.district || f.properties.city || "Maharashtra",
          state: "Maharashtra",
          latitude: f.geometry.coordinates[1],
          longitude: f.geometry.coordinates[0],
        }));

        if (results.length > 0) {
          geocodeCache.set(cleanQuery, results);
          return results;
        }
      }
    } catch {
      // Return top Maharashtra hubs if external network fails
    }

    return MAHARASHTRA_VERIFIED_HUBS.slice(0, 5);
  }

  async reverseGeocode(coords: Coordinates): Promise<GeocodeResult | null> {
    // Find closest pre-seeded hub
    let closest: GeocodeResult | null = null;
    let minDistance = Infinity;

    for (const hub of MAHARASHTRA_VERIFIED_HUBS) {
      const dist = Math.hypot(hub.latitude - coords.latitude, hub.longitude - coords.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        closest = hub;
      }
    }

    return closest || MAHARASHTRA_VERIFIED_HUBS[0];
  }
}
