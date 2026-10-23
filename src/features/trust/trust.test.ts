import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose, { Types } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  computeTrustScore,
  recalculateAndSaveDriverTrust,
} from "./trust-engine";
import { ReviewModel } from "./models/review.model";
import { DriverModel, IDriver } from "@/features/drivers/models/driver.model";
import { UserModel, IUser } from "@/features/auth/models/user.model";
import { BookingModel, IBooking } from "@/features/booking/models/booking.model";
import { TruckModel } from "@/features/trucks/models/truck.model";
import {
  getFreightCorridorAnalytics,
  getFinancialAnalytics,
  getFulfillmentKpis,
  getFleetHealthAnalytics,
} from "@/features/analytics/analytics-engine";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  await ReviewModel.syncIndexes();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await ReviewModel.deleteMany({});
  await DriverModel.deleteMany({});
  await UserModel.deleteMany({});
  await BookingModel.deleteMany({});
  await TruckModel.deleteMany({});
});

describe("Phase 6: Trust Score Engine & Analytics Console", () => {
  it("calculates deterministic trust scores across tiers and applies document/cancellation penalties", () => {
    // 1. Veteran Perfect Driver (50+ trips, 5.0 rating, 100% on time, verified)
    const veteranResult = computeTrustScore({
      onTimeRate: 100,
      averageRating: 5.0,
      totalRatingsCount: 42,
      kycStatus: "verified",
      hasExpiredDocuments: false,
      totalTripsCompleted: 60,
      cancellationRate: 0,
    });

    expect(veteranResult.score).toBe(100);
    expect(veteranResult.tier).toBe("diamond");
    expect(veteranResult.components.onTimeScore).toBe(30);
    expect(veteranResult.components.ratingScore).toBe(25);
    expect(veteranResult.components.kycScore).toBe(20);
    expect(veteranResult.components.experienceScore).toBe(15);
    expect(veteranResult.components.cancellationScore).toBe(10);

    // 2. New Driver Grace Baseline (0 trips, 0 ratings, verified KYC)
    const newDriverResult = computeTrustScore({
      onTimeRate: 100,
      averageRating: 5.0,
      totalRatingsCount: 0, // No reviews yet
      kycStatus: "verified",
      hasExpiredDocuments: false,
      totalTripsCompleted: 0,
      cancellationRate: 0,
    });

    // 30 ontime + 22.5 rating baseline + 20 kyc + 7 exp base + 10 cancel = ~90 pts (Diamond/Gold entry)
    expect(newDriverResult.score).toBeGreaterThanOrEqual(80);
    expect(["diamond", "gold"].includes(newDriverResult.tier)).toBe(true);

    // 3. Penalty for Expired Documents
    const expiredDocResult = computeTrustScore({
      onTimeRate: 100,
      averageRating: 5.0,
      totalRatingsCount: 10,
      kycStatus: "verified",
      hasExpiredDocuments: true, // Expired doc penalty (loses 5 clean doc bonus pts)
      totalTripsCompleted: 15,
      cancellationRate: 0,
    });
    expect(expiredDocResult.components.kycScore).toBe(15); // 15 instead of 20

    // 4. Penalty for High Cancellations (40% cancellation rate drops 4 pts)
    const highCancelResult = computeTrustScore({
      onTimeRate: 90,
      averageRating: 4.0,
      totalRatingsCount: 10,
      kycStatus: "verified",
      hasExpiredDocuments: false,
      totalTripsCompleted: 15,
      cancellationRate: 40,
    });
    expect(highCancelResult.components.cancellationScore).toBe(6); // 10 - 4 = 6
  });

  it("records reviews, prevents duplicate reviews per trip, and recalculates live driver trust", async () => {
    // 1. Setup Driver and Entrepreneur
    const driverUser = (await UserModel.create({
      phone: "+919822114455",
      name: "Tukaram Shinde",
      role: "driver",
      language: "mr",
      dpdpConsent: { consentedAt: new Date() },
    })) as IUser;

    const driver = (await DriverModel.create({
      userId: driverUser._id,
      licenseNumber: "MH-15-2020-0012345",
      experienceYears: 6,
      operatingDistricts: ["Nashik", "Pune"],
      kycStatus: "verified",
      trustScore: 80,
      onTimeRate: 100,
      totalTripsCompleted: 4,
    })) as IDriver;

    const entrepreneurUser = (await UserModel.create({
      phone: "+919822994411",
      name: "Suresh Patil",
      role: "entrepreneur",
      language: "mr",
      dpdpConsent: { consentedAt: new Date() },
    })) as IUser;

    const booking = (await BookingModel.create({
      bookingNumber: "TT-REV-TEST-001",
      entrepreneurId: entrepreneurUser._id,
      driverId: driver._id,
      status: "completed",
      pickup: {
        district: "Nashik",
        address: "Pimpalgaon APMC",
        contactName: "Suresh",
        contactPhone: "+919822994411",
        coordinates: [73.98, 20.17],
      },
      drop: {
        district: "Pune",
        address: "Market Yard",
        receiverName: "Dilip",
        receiverPhone: "+919822445566",
        coordinates: [73.86, 18.49],
      },
      goods: {
        category: "agricultural_produce",
        description: "Nashik Onions",
        weightKg: 2000,
      },
      truckType: "pickup",
      route: { distanceKm: 210, durationMinutes: 300 },
      fare: {
        baseFarePaise: 55000,
        distanceFarePaise: 400000,
        handlingFarePaise: 25000,
        subtotalFarePaise: 480000,
        platformFeePaise: 36000,
        gstTaxPaise: 24000,
        totalFarePaise: 540000,
        advance50Paise: 270000,
        delivery50Paise: 270000,
      },
    })) as IBooking;

    // 2. Entrepreneur leaves a 5-star review
    const review = await ReviewModel.create({
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      authorId: entrepreneurUser._id,
      authorRole: "entrepreneur",
      targetId: driverUser._id,
      targetRole: "driver",
      rating: 5,
      categories: {
        punctuality: 5,
        cargoCare: 5,
        communication: 5,
        drivingSafety: 5,
      },
      comment: "चालक वेळेवर पोहोचले व माल अतिशय सुरक्षित आणला (Outstanding timely freight)",
      isVerifiedTrip: true,
    });

    expect(review._id).toBeDefined();
    expect(review.rating).toBe(5);

    // 3. Duplicate review prevention
    await expect(
      ReviewModel.create({
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        authorId: entrepreneurUser._id,
        authorRole: "entrepreneur",
        targetId: driverUser._id,
        targetRole: "driver",
        rating: 4,
      })
    ).rejects.toThrow();

    // 4. Live trust profile recalculation
    const updatedProfile = await recalculateAndSaveDriverTrust(driver._id);
    expect(updatedProfile.totalRatingsCount).toBe(1);
    expect(updatedProfile.rating).toBe(5.0);
    expect(updatedProfile.trustScore).toBeGreaterThanOrEqual(85);
    expect(["diamond", "gold"].includes(updatedProfile.trustTier)).toBe(true);

    const reloadedDriver = await DriverModel.findById(driver._id);
    expect(reloadedDriver!.totalRatingsCount).toBe(1);
    expect(reloadedDriver!.rating).toBe(5.0);
  });

  it("aggregates freight corridors, financial GMV, fulfillment KPIs, and fleet health", async () => {
    const entrepreneur = (await UserModel.create({
      phone: "+919822001122",
      role: "entrepreneur",
      dpdpConsent: { consentedAt: new Date() },
    })) as IUser;

    const driverUser = (await UserModel.create({
      phone: "+919822003344",
      role: "driver",
      dpdpConsent: { consentedAt: new Date() },
    })) as IUser;

    const driver = (await DriverModel.create({
      userId: driverUser._id,
      licenseNumber: "MH-14-2019-9988776",
      kycStatus: "verified",
      trustScore: 92,
      trustTier: "diamond",
      rating: 4.9,
      totalTripsCompleted: 12,
    })) as IDriver;

    await TruckModel.create({
      driverId: driver._id,
      registrationNumber: "MH-14-AB-1234",
      truckType: "truck_14ft",
      capacityKg: 4000,
      bodyType: "tarpaulin",
      isAvailable: true,
    });

    // 1. Seed 2 bookings on Corridor Nashik ➔ Thane
    await BookingModel.create({
      bookingNumber: "TT-CORR-001",
      entrepreneurId: entrepreneur._id,
      driverId: driver._id,
      status: "completed",
      pickup: { district: "Nashik", address: "APMC", contactName: "S", contactPhone: "9", coordinates: [73.9, 20.1] },
      drop: { district: "Thane", address: "Vashi", receiverName: "R", receiverPhone: "9", coordinates: [73.0, 19.0] },
      goods: { category: "agricultural_produce", description: "Onion", weightKg: 3500 },
      truckType: "truck_14ft",
      route: { distanceKm: 160, durationMinutes: 220 },
      fare: {
        baseFarePaise: 60000,
        distanceFarePaise: 700000,
        handlingFarePaise: 30000,
        subtotalFarePaise: 790000,
        platformFeePaise: 59250,
        gstTaxPaise: 39500,
        totalFarePaise: 888750,
        advance50Paise: 444375,
        delivery50Paise: 444375,
      },
      payment: { advancePaid: true, deliveryPaid: true },
    });

    await BookingModel.create({
      bookingNumber: "TT-CORR-002",
      entrepreneurId: entrepreneur._id,
      driverId: driver._id,
      status: "in_transit",
      pickup: { district: "Nashik", address: "APMC", contactName: "S", contactPhone: "9", coordinates: [73.9, 20.1] },
      drop: { district: "Thane", address: "Bhiwandi", receiverName: "R", receiverPhone: "9", coordinates: [73.0, 19.1] },
      goods: { category: "agricultural_produce", description: "Tomato", weightKg: 2500 },
      truckType: "truck_14ft",
      route: { distanceKm: 150, durationMinutes: 200 },
      fare: {
        baseFarePaise: 50000,
        distanceFarePaise: 500000,
        handlingFarePaise: 25000,
        subtotalFarePaise: 575000,
        platformFeePaise: 43125,
        gstTaxPaise: 28750,
        totalFarePaise: 646875,
        advance50Paise: 323437,
        delivery50Paise: 323437,
      },
      payment: { advancePaid: true },
      sosAlerts: [
        {
          triggeredBy: driverUser._id,
          role: "driver",
          location: [73.5, 19.6],
          reason: "Minor breakdown",
          status: "active",
          triggeredAt: new Date(),
        },
      ],
    });

    // 2. Test Corridor Analytics
    const corridors = await getFreightCorridorAnalytics();
    expect(corridors.length).toBeGreaterThanOrEqual(1);
    const topCorridor = corridors[0];
    expect(topCorridor.corridor).toBe("Nashik ➔ Thane");
    expect(topCorridor.tripCount).toBe(2);
    expect(topCorridor.completedTrips).toBe(1);
    expect(topCorridor.totalTonnageKg).toBe(6000);
    expect(topCorridor.totalGmvPaise).toBe(888750 + 646875);

    // 3. Test Financial Analytics
    const finances = await getFinancialAnalytics();
    expect(finances.totalGmvPaise).toBe(888750 + 646875);
    expect(finances.platformFeeEarnedPaise).toBe(59250); // From completed trip
    expect(finances.gstLiabilityPaise).toBe(39500);

    // 4. Test Fulfillment KPIs
    const fulfillment = await getFulfillmentKpis();
    expect(fulfillment.totalBookings).toBe(2);
    expect(fulfillment.completedBookings).toBe(1);
    expect(fulfillment.inTransitBookings).toBe(1);
    expect(fulfillment.sosAlertsCount).toBe(1);
    expect(fulfillment.fulfillmentRatePercentage).toBe(50);

    // 5. Test Fleet Health Analytics
    const fleet = await getFleetHealthAnalytics();
    expect(fleet.totalDrivers).toBe(1);
    expect(fleet.verifiedDrivers).toBe(1);
    expect(fleet.trustTiers.diamond).toBe(1);
    expect(fleet.truckTypeDistribution.truck_14ft).toBe(1);
    expect(fleet.totalFleetCapacityKg).toBe(4000);
  });
});
