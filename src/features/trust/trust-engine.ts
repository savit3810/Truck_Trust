import mongoose, { Types } from "mongoose";
import { DriverModel, IDriver } from "@/features/drivers/models/driver.model";
import { ReviewModel } from "./models/review.model";
import { BookingModel } from "@/features/booking/models/booking.model";
import { DocumentModel } from "@/features/documents/models/document.model";

export type TrustTier = "diamond" | "gold" | "silver" | "bronze";

export interface TrustFactors {
  onTimeRate: number;            // 0 - 100%
  averageRating: number;         // 1.0 - 5.0
  totalRatingsCount: number;     // Integer count
  kycStatus: "pending" | "verified" | "rejected" | "action_needed";
  hasExpiredDocuments: boolean;  // True if any mandatory doc is expired
  totalTripsCompleted: number;   // Integer count
  cancellationRate: number;      // 0 - 100%
}

export interface TrustScoreBreakdown {
  score: number;
  tier: TrustTier;
  components: {
    onTimeScore: number;       // Max 30
    ratingScore: number;       // Max 25
    kycScore: number;          // Max 20
    experienceScore: number;   // Max 15
    cancellationScore: number; // Max 10
  };
  tierLabel: {
    en: string;
    mr: string;
    hi: string;
  };
}

export interface DriverTrustProfile {
  driverId: string;
  userId: string;
  trustScore: number;
  trustTier: TrustTier;
  rating: number;
  totalRatingsCount: number;
  onTimeRate: number;
  cancellationRate: number;
  totalTripsCompleted: number;
  breakdown: TrustScoreBreakdown;
}

/**
 * Calculates deterministic trust score (0 - 100) based on weighted Maharashtra freight parameters:
 * 1. On-time delivery adherence (30% weight)
 * 2. Customer review ratings (25% weight)
 * 3. KYC verification & active document validity (20% weight)
 * 4. Experience & trip fulfillment count (15% weight)
 * 5. Low driver cancellation rate (10% weight)
 */
export function computeTrustScore(factors: TrustFactors): TrustScoreBreakdown {
  // 1. On-time delivery component (Max 30)
  const clampedOnTime = Math.max(0, Math.min(100, factors.onTimeRate));
  const onTimeScore = Math.round((clampedOnTime / 100) * 30 * 10) / 10;

  // 2. Customer ratings component (Max 25)
  // If no reviews yet, use neutral baseline 4.5 / 5.0 (22.5 pts)
  const effectiveRating =
    factors.totalRatingsCount > 0
      ? Math.max(1, Math.min(5, factors.averageRating))
      : 4.5;
  const ratingScore = Math.round((effectiveRating / 5.0) * 25 * 10) / 10;

  // 3. KYC & Document Health component (Max 20)
  let kycScore = 0;
  if (factors.kycStatus === "verified") {
    kycScore += 15;
    if (!factors.hasExpiredDocuments) {
      kycScore += 5; // Clean document health bonus
    }
  } else if (factors.kycStatus === "pending") {
    kycScore = 10;
  } else {
    kycScore = 0;
  }

  // 4. Experience & Volume tier (Max 15)
  let experienceScore = 7; // New driver base
  const trips = factors.totalTripsCompleted;
  if (trips >= 50) {
    experienceScore = 15;
  } else if (trips >= 20) {
    experienceScore = 14;
  } else if (trips >= 10) {
    experienceScore = 12;
  } else if (trips >= 5) {
    experienceScore = 10;
  } else if (trips >= 1) {
    experienceScore = 8;
  }

  // 5. Cancellation Penalty component (Max 10)
  const clampedCancelRate = Math.max(0, Math.min(100, factors.cancellationRate));
  const cancellationPenalty = (clampedCancelRate / 100) * 10;
  const cancellationScore = Math.max(0, Math.round((10 - cancellationPenalty) * 10) / 10);

  // Sum total & clamp 0 - 100
  const rawSum = onTimeScore + ratingScore + kycScore + experienceScore + cancellationScore;
  const score = Math.max(0, Math.min(100, Math.round(rawSum)));

  // Tier assignment
  let tier: TrustTier = "bronze";
  if (score >= 90) {
    tier = "diamond";
  } else if (score >= 80) {
    tier = "gold";
  } else if (score >= 70) {
    tier = "silver";
  } else {
    tier = "bronze";
  }

  const tierLabels = {
    diamond: {
      en: "Diamond Verified Partner",
      mr: "डायमंड विश्वासू भागीदार (उच्च दर्जा)",
      hi: "डायमंड सत्यापित भागीदार (शीर्ष स्तर)",
    },
    gold: {
      en: "Gold Verified Driver",
      mr: "सुवर्ण विश्वासू चालक (उत्कृष्ट दर्जा)",
      hi: "गोल्ड सत्यापित चालक (उत्कृष्ट स्तर)",
    },
    silver: {
      en: "Silver Verified Driver",
      mr: "रजत विश्वासू चालक (चांगला दर्जा)",
      hi: "सिल्वर सत्यापित चालक (अच्छा स्तर)",
    },
    bronze: {
      en: "Standard Verified Driver",
      mr: "प्रमाणित चालक (सुरुवातीचा दर्जा)",
      hi: "मानक सत्यापित चालक (प्रारंभिक स्तर)",
    },
  };

  return {
    score,
    tier,
    components: {
      onTimeScore,
      ratingScore,
      kycScore,
      experienceScore,
      cancellationScore,
    },
    tierLabel: tierLabels[tier],
  };
}

/**
 * Re-evaluates live database metrics and persists updated trust score, tier, and ratings on Driver document
 */
export async function recalculateAndSaveDriverTrust(
  driverId: string | Types.ObjectId
): Promise<DriverTrustProfile> {
  const driver = await DriverModel.findById(driverId);
  if (!driver) {
    throw new Error(`Driver not found for id: ${driverId.toString()}`);
  }

  // 1. Fetch reviews aggregated
  const reviews = await ReviewModel.find({
    targetId: driver.userId,
    targetRole: "driver",
  }).lean();

  const totalRatingsCount = reviews.length;
  const averageRating =
    totalRatingsCount > 0
      ? Math.round(
          (reviews.reduce((acc, r) => acc + r.rating, 0) / totalRatingsCount) * 10
        ) / 10
      : 5.0;

  // 2. Fetch booking history metrics
  const bookings = await BookingModel.find({
    driverId: driver._id,
  }).lean();

  const totalAssignedTrips = bookings.length;
  const completedTrips = bookings.filter((b) => b.status === "completed").length;
  const cancelledTrips = bookings.filter((b) => b.status === "cancelled").length;

  const cancellationRate =
    totalAssignedTrips > 0
      ? Math.round((cancelledTrips / totalAssignedTrips) * 100)
      : 0;

  // 3. Document health check (any expired mandatory docs)
  const now = new Date();
  const expiredDoc = await DocumentModel.findOne({
    driverId: driver._id,
    expiryDate: { $lt: now },
  });
  const hasExpiredDocuments = !!expiredDoc;

  // 4. Calculate Trust Score
  const breakdown = computeTrustScore({
    onTimeRate: driver.onTimeRate ?? 100,
    averageRating,
    totalRatingsCount,
    kycStatus: driver.kycStatus,
    hasExpiredDocuments,
    totalTripsCompleted: completedTrips > 0 ? completedTrips : driver.totalTripsCompleted,
    cancellationRate,
  });

  // 5. Persist to Driver document
  driver.trustScore = breakdown.score;
  driver.trustTier = breakdown.tier;
  driver.rating = averageRating;
  driver.totalRatingsCount = totalRatingsCount;
  driver.cancellationRate = cancellationRate;
  if (completedTrips > driver.totalTripsCompleted) {
    driver.totalTripsCompleted = completedTrips;
  }

  await driver.save();

  return {
    driverId: driver._id.toString(),
    userId: driver.userId.toString(),
    trustScore: breakdown.score,
    trustTier: breakdown.tier,
    rating: averageRating,
    totalRatingsCount,
    onTimeRate: driver.onTimeRate,
    cancellationRate,
    totalTripsCompleted: driver.totalTripsCompleted,
    breakdown,
  };
}
