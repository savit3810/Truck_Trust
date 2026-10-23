import { BookingModel } from "@/features/booking/models/booking.model";
import { DriverModel } from "@/features/drivers/models/driver.model";
import { TruckModel } from "@/features/trucks/models/truck.model";
import { LedgerEntryModel } from "@/features/ledger/models/ledger-entry.model";

export interface CorridorStat {
  corridor: string;
  pickupDistrict: string;
  dropDistrict: string;
  tripCount: number;
  completedTrips: number;
  totalGmvPaise: number;
  totalTonnageKg: number;
  avgDistanceKm: number;
  avgDurationMinutes: number;
}

export interface FinancialMetrics {
  totalGmvPaise: number;
  platformFeeEarnedPaise: number;
  gstLiabilityPaise: number;
  advanceEscrowHeldPaise: number;
  activeEscrowPaise: number;
  disputedEscrowPaise: number;
  driverDisbursedPaise: number;
}

export interface FulfillmentMetrics {
  totalBookings: number;
  completedBookings: number;
  inTransitBookings: number;
  activeRequests: number;
  cancelledBookings: number;
  disputedBookings: number;
  fulfillmentRatePercentage: number;
  sosAlertsCount: number;
}

export interface FleetHealthMetrics {
  totalDrivers: number;
  verifiedDrivers: number;
  pendingDrivers: number;
  actionNeededDrivers: number;
  averageTrustScore: number;
  averageRating: number;
  trustTiers: {
    diamond: number;
    gold: number;
    silver: number;
    bronze: number;
  };
  truckTypeDistribution: Record<string, number>;
  totalFleetCapacityKg: number;
}

export interface PlatformAnalyticsSummary {
  corridors: CorridorStat[];
  finances: FinancialMetrics;
  fulfillment: FulfillmentMetrics;
  fleet: FleetHealthMetrics;
  generatedAt: string;
}

/**
 * Executes high-performance MongoDB aggregation pipelines for Maharashtra corridor analytics
 */
export async function getFreightCorridorAnalytics(): Promise<CorridorStat[]> {
  const results = await BookingModel.aggregate([
    {
      $match: {
        status: { $ne: "draft" },
      },
    },
    {
      $group: {
        _id: {
          pickup: "$pickup.district",
          drop: "$drop.district",
        },
        tripCount: { $sum: 1 },
        completedTrips: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        totalGmvPaise: { $sum: "$fare.totalFarePaise" },
        totalTonnageKg: { $sum: "$goods.weightKg" },
        avgDistanceKm: { $avg: "$route.distanceKm" },
        avgDurationMinutes: { $avg: "$route.durationMinutes" },
      },
    },
    {
      $sort: { tripCount: -1, totalGmvPaise: -1 },
    },
    {
      $limit: 10,
    },
  ]);

  return results.map((r) => {
    const p = r._id.pickup || "Other";
    const d = r._id.drop || "Other";
    return {
      corridor: `${p} ➔ ${d}`,
      pickupDistrict: p,
      dropDistrict: d,
      tripCount: r.tripCount,
      completedTrips: r.completedTrips,
      totalGmvPaise: r.totalGmvPaise || 0,
      totalTonnageKg: r.totalTonnageKg || 0,
      avgDistanceKm: Math.round((r.avgDistanceKm || 0) * 10) / 10,
      avgDurationMinutes: Math.round(r.avgDurationMinutes || 0),
    };
  });
}

/**
 * Aggregates financial GMV, double-entry escrow balances, and platform commission metrics
 */
export async function getFinancialAnalytics(): Promise<FinancialMetrics> {
  const [bookingFinances] = await BookingModel.aggregate([
    {
      $match: {
        status: { $nin: ["draft", "cancelled"] },
      },
    },
    {
      $group: {
        _id: null,
        totalGmvPaise: { $sum: "$fare.totalFarePaise" },
        advanceCollectedPaise: {
          $sum: {
            $cond: [{ $eq: ["$payment.advancePaid", true] }, "$fare.advance50Paise", 0],
          },
        },
      },
    },
  ]);

  const [completedFinances] = await BookingModel.aggregate([
    {
      $match: {
        status: "completed",
      },
    },
    {
      $group: {
        _id: null,
        platformFeeEarnedPaise: { $sum: "$fare.platformFeePaise" },
        gstLiabilityPaise: { $sum: "$fare.gstTaxPaise" },
      },
    },
  ]);

  // Double-entry ledger audit aggregations
  const ledgerTotals = await LedgerEntryModel.aggregate([
    {
      $group: {
        _id: "$type",
        totalDebit: { $sum: "$amountPaise" },
      },
    },
  ]);

  const ledgerTypeMap = new Map(ledgerTotals.map((l) => [l._id, l.totalDebit]));

  // Calculate active escrow held from ledger
  const escrowHeldCredits = await LedgerEntryModel.aggregate([
    { $match: { creditAccount: "escrow:held" } },
    { $group: { _id: null, sum: { $sum: "$amountPaise" } } },
  ]);
  const escrowHeldDebits = await LedgerEntryModel.aggregate([
    { $match: { debitAccount: "escrow:held" } },
    { $group: { _id: null, sum: { $sum: "$amountPaise" } } },
  ]);

  const activeEscrowPaise = Math.max(
    0,
    (escrowHeldCredits[0]?.sum || 0) - (escrowHeldDebits[0]?.sum || 0)
  );

  const disputedEscrowCredits = await LedgerEntryModel.aggregate([
    { $match: { creditAccount: "escrow:disputed" } },
    { $group: { _id: null, sum: { $sum: "$amountPaise" } } },
  ]);
  const disputedEscrowDebits = await LedgerEntryModel.aggregate([
    { $match: { debitAccount: "escrow:disputed" } },
    { $group: { _id: null, sum: { $sum: "$amountPaise" } } },
  ]);

  const disputedEscrowPaise = Math.max(
    0,
    (disputedEscrowCredits[0]?.sum || 0) - (disputedEscrowDebits[0]?.sum || 0)
  );

  return {
    totalGmvPaise: bookingFinances?.totalGmvPaise || 0,
    platformFeeEarnedPaise: completedFinances?.platformFeeEarnedPaise || 0,
    gstLiabilityPaise: completedFinances?.gstLiabilityPaise || 0,
    advanceEscrowHeldPaise: bookingFinances?.advanceCollectedPaise || 0,
    activeEscrowPaise,
    disputedEscrowPaise,
    driverDisbursedPaise: ledgerTypeMap.get("payout_disbursed") || 0,
  };
}

/**
 * Aggregates fulfillment KPIs, dispute rates, and SOS emergency safety statistics
 */
export async function getFulfillmentKpis(): Promise<FulfillmentMetrics> {
  const statusCounts = await BookingModel.aggregate([
    {
      $match: {
        status: { $ne: "draft" },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map(statusCounts.map((s) => [s._id, s.count]));

  const completed = countMap.get("completed") || 0;
  const inTransit = countMap.get("in_transit") || 0;
  const requested = (countMap.get("requested") || 0) + (countMap.get("accepted") || 0);
  const cancelled = countMap.get("cancelled") || 0;
  const disputed = countMap.get("disputed") || 0;

  const total = completed + inTransit + requested + cancelled + disputed;
  const fulfillmentRate = total > 0 ? Math.round((completed / total) * 1000) / 10 : 100;

  // Aggregate active SOS alerts count
  const [sosAgg] = await BookingModel.aggregate([
    { $unwind: "$sosAlerts" },
    { $match: { "sosAlerts.status": "active" } },
    { $count: "activeSosCount" },
  ]);

  return {
    totalBookings: total,
    completedBookings: completed,
    inTransitBookings: inTransit,
    activeRequests: requested,
    cancelledBookings: cancelled,
    disputedBookings: disputed,
    fulfillmentRatePercentage: fulfillmentRate,
    sosAlertsCount: sosAgg?.activeSosCount || 0,
  };
}

/**
 * Aggregates Fleet Health, Trust Tiers, and Truck Capacity distributions
 */
export async function getFleetHealthAnalytics(): Promise<FleetHealthMetrics> {
  const drivers = await DriverModel.find().lean();
  const trucks = await TruckModel.find().lean();

  const totalDrivers = drivers.length;
  let verifiedDrivers = 0;
  let pendingDrivers = 0;
  let actionNeededDrivers = 0;
  let trustSum = 0;
  let ratingSum = 0;
  let ratingsCount = 0;

  const trustTiers = {
    diamond: 0,
    gold: 0,
    silver: 0,
    bronze: 0,
  };

  for (const d of drivers) {
    if (d.kycStatus === "verified") verifiedDrivers++;
    else if (d.kycStatus === "pending") pendingDrivers++;
    else actionNeededDrivers++;

    trustSum += d.trustScore ?? 80;

    const tier = d.trustTier || "gold";
    if (tier in trustTiers) {
      trustTiers[tier as keyof typeof trustTiers]++;
    }

    if (d.rating) {
      ratingSum += d.rating;
      ratingsCount++;
    }
  }

  const truckTypeDist: Record<string, number> = {};
  let totalCapacity = 0;

  for (const t of trucks) {
    truckTypeDist[t.truckType] = (truckTypeDist[t.truckType] || 0) + 1;
    totalCapacity += t.capacityKg || 0;
  }

  return {
    totalDrivers,
    verifiedDrivers,
    pendingDrivers,
    actionNeededDrivers,
    averageTrustScore: totalDrivers > 0 ? Math.round(trustSum / totalDrivers) : 80,
    averageRating: ratingsCount > 0 ? Math.round((ratingSum / ratingsCount) * 10) / 10 : 4.8,
    trustTiers,
    truckTypeDistribution: truckTypeDist,
    totalFleetCapacityKg: totalCapacity,
  };
}

/**
 * Combined executive platform analytics summary
 */
export async function getPlatformAnalytics(): Promise<PlatformAnalyticsSummary> {
  const [corridors, finances, fulfillment, fleet] = await Promise.all([
    getFreightCorridorAnalytics(),
    getFinancialAnalytics(),
    getFulfillmentKpis(),
    getFleetHealthAnalytics(),
  ]);

  return {
    corridors,
    finances,
    fulfillment,
    fleet,
    generatedAt: new Date().toISOString(),
  };
}
