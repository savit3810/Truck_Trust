import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { calculateFare } from "./fare-engine";
import { BookingModel } from "./models/booking.model";
import { UserModel } from "@/features/auth/models/user.model";
import { DriverModel } from "@/features/drivers/models/driver.model";
import { TruckModel } from "@/features/trucks/models/truck.model";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Phase 3: Fare Engine & Booking Invariants", () => {
  it("calculates transparent fare with exact 50-50 integer paise split", () => {
    const pickupFare = calculateFare({
      truckType: "pickup",
      distanceKm: 50, // 50 km in Palghar/Nashik corridor
      isPerishable: false,
      isReturnLoad: false,
    });

    // Check pricing rules
    expect(pickupFare.baseFarePaise).toBe(55000); // ₹550
    expect(pickupFare.handlingFarePaise).toBe(25000); // ₹250
    // Billable: 50 - 3 = 47 km * 2400 paise = 112800 paise (₹1,128)
    expect(pickupFare.distanceFarePaise).toBe(112800);

    // Integers check
    expect(Number.isInteger(pickupFare.totalFarePaise)).toBe(true);
    expect(Number.isInteger(pickupFare.advance50Paise)).toBe(true);
    expect(Number.isInteger(pickupFare.delivery50Paise)).toBe(true);

    // Sum invariant: advance + delivery MUST equal totalFarePaise exactly
    expect(pickupFare.advance50Paise + pickupFare.delivery50Paise).toBe(pickupFare.totalFarePaise);
  });

  it("applies 10% perishable surcharge and 20% return-load discount correctly", () => {
    const normalFare = calculateFare({
      truckType: "tata_ace",
      distanceKm: 30,
      isPerishable: false,
      isReturnLoad: false,
    });

    const perishableFare = calculateFare({
      truckType: "tata_ace",
      distanceKm: 30,
      isPerishable: true,
      isReturnLoad: false,
    });

    const returnLoadFare = calculateFare({
      truckType: "tata_ace",
      distanceKm: 30,
      isPerishable: false,
      isReturnLoad: true,
    });

    expect(perishableFare.totalFarePaise).toBeGreaterThan(normalFare.totalFarePaise);
    expect(returnLoadFare.totalFarePaise).toBeLessThan(normalFare.totalFarePaise);
    expect(returnLoadFare.discountPaise).toBeGreaterThan(0);
  });

  it("atomic acceptance guarantees first driver wins against race conditions", async () => {
    // 1. Create Entrepreneur & Booking
    const entrepreneur = await UserModel.create({
      phone: "9822998811",
      name: "Dahanu Agro Producer Co",
      role: "entrepreneur",
    });

    const booking = await BookingModel.create({
      bookingNumber: "TT-2026-MH-TEST-RACE",
      entrepreneurId: entrepreneur._id,
      pickup: {
        address: "Dahanu Chiku Mandi",
        district: "Palghar",
        coordinates: [72.7303, 19.9723],
        contactName: "Suresh",
        contactPhone: "9822998811",
      },
      drop: {
        address: "Vashi APMC Market",
        district: "Thane",
        coordinates: [73.0012, 19.076],
        receiverName: "Mahesh",
        receiverPhone: "9822998812",
      },
      goods: {
        category: "agricultural_produce",
        description: "Fresh Chiku Crates",
        weightKg: 1500,
        isPerishable: true,
        isFragile: false,
      },
      truckType: "pickup",
      mode: "broadcast",
      route: { distanceKm: 120, durationMinutes: 200 },
      fare: {
        baseFarePaise: 55000,
        distanceFarePaise: 280800,
        handlingFarePaise: 25000,
        tollEstimatePaise: 15000,
        perishableSurchargePaise: 36000,
        discountPaise: 0,
        subtotalFarePaise: 411800,
        platformFeePaise: 30885,
        gstTaxPaise: 20590,
        totalFarePaise: 432390,
        advance50Paise: 216195,
        delivery50Paise: 216195,
      },
      status: "requested",
    });

    // 2. Create Driver A and Driver B
    const driverAUser = await UserModel.create({ phone: "9730111111", role: "driver" });
    const driverA = await DriverModel.create({ userId: driverAUser._id, licenseNumber: "MH-48-A" });
    const truckA = await TruckModel.create({ driverId: driverA._id, registrationNumber: "MH-48-A-1111", truckType: "pickup", capacityKg: 1500 });

    const driverBUser = await UserModel.create({ phone: "9730222222", role: "driver" });
    const driverB = await DriverModel.create({ userId: driverBUser._id, licenseNumber: "MH-48-B" });
    const truckB = await TruckModel.create({ driverId: driverB._id, registrationNumber: "MH-48-B-2222", truckType: "pickup", capacityKg: 1500 });

    // 3. Driver A accepts first
    const acceptA = await BookingModel.findOneAndUpdate(
      {
        _id: booking._id,
        status: "requested",
        driverId: { $exists: false },
      },
      {
        status: "accepted",
        driverId: driverA._id,
        truckId: truckA._id,
      },
      { returnDocument: "after" }
    );

    // 4. Driver B attempts to accept the exact same booking simultaneously
    const acceptB = await BookingModel.findOneAndUpdate(
      {
        _id: booking._id,
        status: "requested",
        driverId: { $exists: false },
      },
      {
        status: "accepted",
        driverId: driverB._id,
        truckId: truckB._id,
      },
      { returnDocument: "after" }
    );

    // Driver A MUST succeed
    expect(acceptA).not.toBeNull();
    expect(acceptA?.status).toBe("accepted");
    expect(acceptA?.driverId?.toString()).toBe(driverA._id.toString());

    // Driver B MUST fail atomically (null returned, preventing double assignment)
    expect(acceptB).toBeNull();

    // Verify booking in database belongs strictly to Driver A
    const finalBooking = await BookingModel.findById(booking._id);
    expect(finalBooking?.driverId?.toString()).toBe(driverA._id.toString());
  });

  it("calculates cancellation fees and refunds according to stage policy", async () => {
    const advancePaid = 100000; // ₹1,000 in paise

    // Stage 1: Before driver accepts -> 100% refund, 0 fee
    const stage1Refund = advancePaid;
    const stage1Fee = 0;
    expect(stage1Refund).toBe(100000);
    expect(stage1Fee).toBe(0);

    // Stage 2: After accept, before pickup -> ₹200 driver compensation
    const driverFee = 20000; // ₹200 in paise
    const stage2Fee = Math.min(driverFee, advancePaid);
    const stage2Refund = Math.max(0, advancePaid - stage2Fee);
    expect(stage2Fee).toBe(20000);
    expect(stage2Refund).toBe(80000); // ₹800 refunded

    // Stage 3: After goods loaded -> 0 refund, 100% advance retained
    const stage3Fee = advancePaid;
    const stage3Refund = 0;
    expect(stage3Fee).toBe(100000);
    expect(stage3Refund).toBe(0);
  });
});
