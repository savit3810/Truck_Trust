import { DriverModel } from "@/features/drivers/models/driver.model";
import { TruckModel, TruckType } from "@/features/trucks/models/truck.model";
import { UserModel } from "@/features/auth/models/user.model";

export interface MatchedDriver {
  driverId: string;
  name: string;
  phoneMasked?: string;
  truckId: string;
  plateNumber: string;
  truckType: TruckType;
  capacityKg: number;
  bodyType: string;
  trustScore: number;
  onTimeRate: number;
  totalTripsCompleted: number;
  distanceToPickupKm: number;
  rankingScore: number;
  matchReasons: {
    mr: string;
    hi: string;
    en: string;
  };
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function matchDriversForBooking(
  pickupCoords: [number, number], // [lng, lat]
  truckType: TruckType,
  district: string = "Palghar",
  maxRadiusKm: number = 80
): Promise<MatchedDriver[]> {
  const [pickupLng, pickupLat] = pickupCoords;

  // 1. Find all available trucks matching requested type (or compatible capacity)
  const trucks = await TruckModel.find({
    truckType,
    isAvailable: true,
  }).lean();

  if (trucks.length === 0) {
    return [];
  }

  const driverIds = trucks.map((t) => t.driverId);

  // 2. Find verified drivers
  const drivers = await DriverModel.find({
    _id: { $in: driverIds },
    kycStatus: "verified",
  }).lean();

  const driverMap = new Map(drivers.map((d) => [d._id.toString(), d]));
  const userIds = drivers.map((d) => d.userId);
  const users = await UserModel.find({ _id: { $in: userIds } }).lean();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const matches: MatchedDriver[] = [];

  for (const truck of trucks) {
    const driver = driverMap.get(truck.driverId.toString());
    if (!driver) continue;

    const user = userMap.get(driver.userId.toString());
    const truckCoords = truck.currentLocation?.coordinates || [72.7699, 19.6967];
    const [truckLng, truckLat] = truckCoords;

    const distanceKm = calculateDistanceKm(pickupLat, pickupLng, truckLat, truckLng);
    if (distanceKm > maxRadiusKm) continue;

    // Scoring (0-100)
    const proximityScore = Math.max(0, 35 - distanceKm * 0.4);
    const trustScoreComponent = (driver.trustScore / 100) * 35;
    const onTimeComponent = (driver.onTimeRate / 100) * 20;
    const isLocal = driver.operatingDistricts.some((d) => d.toLowerCase().includes(district.toLowerCase()));
    const localBonus = isLocal ? 10 : 5;

    const rankingScore = Math.round(proximityScore + trustScoreComponent + onTimeComponent + localBonus);

    // Plain-Language Explanations
    const matchReasons = {
      mr: `${distanceKm} किमी जवळ • ${driver.trustScore}% विश्वास गुण • ${isLocal ? `${district} स्थानिक चालक` : "पडताळणीकृत चालक"}`,
      hi: `${distanceKm} किमी दूरी पर • ${driver.trustScore}% ट्रस्ट स्कोर • ${isLocal ? `${district} स्थानीय ड्राइवर` : "सत्यापित ड्राइवर"}`,
      en: `${distanceKm} km away • ${driver.trustScore}% Trust Score • ${isLocal ? `Local ${district} driver` : "Verified Driver"}`,
    };

    matches.push({
      driverId: driver._id.toString(),
      name: user?.name || "Verified Driver",
      phoneMasked: user?.phone ? `+91 ${user.phone.slice(0, 3)}****${user.phone.slice(-3)}` : undefined,
      truckId: truck._id.toString(),
      plateNumber: truck.registrationNumber,
      truckType: truck.truckType,
      capacityKg: truck.capacityKg,
      bodyType: truck.bodyType,
      trustScore: driver.trustScore,
      onTimeRate: driver.onTimeRate,
      totalTripsCompleted: driver.totalTripsCompleted,
      distanceToPickupKm: distanceKm,
      rankingScore,
      matchReasons,
    });
  }

  // Sort descending by ranking score (best match first)
  return matches.sort((a, b) => b.rankingScore - a.rankingScore);
}
