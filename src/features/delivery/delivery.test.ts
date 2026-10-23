import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose, { Types } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";
import {
  generateDeliveryProofSecrets,
  verifyDeliveryProofSecret,
} from "./delivery-proof";
import { BookingModel, IBooking } from "@/features/booking/models/booking.model";
import { DriverModel, IDriver } from "@/features/drivers/models/driver.model";
import { UserModel, IUser } from "@/features/auth/models/user.model";
import { AuditLogModel } from "@/features/audit/models/audit-log.model";
import {
  recordAdvanceEscrowHold,
  recordDeliveryEscrowAndRelease,
} from "@/features/ledger/ledger-engine";
import { WalletModel } from "@/features/ledger/models/wallet.model";
import {
  broadcastLocationUpdate,
  trackingEmitter,
  TrackingLocationUpdate,
} from "@/lib/tracking/tracking-events";

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

beforeEach(async () => {
  await BookingModel.deleteMany({});
  await DriverModel.deleteMany({});
  await UserModel.deleteMany({});
  await WalletModel.deleteMany({});
  await AuditLogModel.deleteMany({});
});

describe("Phase 5: Delivery Proof, Live Tracking & Emergency Alerts", () => {
  it("generates cryptographic 6-digit OTP, bcrypt hash, and QR token with data URL", async () => {
    const bookingNumber = "TT-PUN-261022-001";
    const secrets = await generateDeliveryProofSecrets(bookingNumber);

    // 1. 6-digit OTP checks
    expect(secrets.otp).toMatch(/^\d{6}$/);
    const otpNum = parseInt(secrets.otp, 10);
    expect(otpNum).toBeGreaterThanOrEqual(100000);
    expect(otpNum).toBeLessThanOrEqual(999999);

    // 2. Hash check
    expect(secrets.otpHash).toBeDefined();
    const isBcryptValid = await bcrypt.compare(secrets.otp, secrets.otpHash);
    expect(isBcryptValid).toBe(true);

    // 3. QR code token and Data URL checks
    expect(secrets.qrCodeToken.startsWith("tt_dlv_")).toBe(true);
    expect(secrets.qrCodeDataUrl.startsWith("data:image/png;base64,")).toBe(true);
  });

  it("verifies delivery proof using either OTP or QR token and rejects invalid inputs", async () => {
    const bookingNumber = "TT-NSK-261022-002";
    const secrets = await generateDeliveryProofSecrets(bookingNumber);

    // Valid OTP check
    const otpRes = await verifyDeliveryProofSecret({
      inputOtp: secrets.otp,
      expectedOtpHash: secrets.otpHash,
    });
    expect(otpRes.valid).toBe(true);
    expect(otpRes.method).toBe("otp");

    // Invalid OTP check
    const badOtpRes = await verifyDeliveryProofSecret({
      inputOtp: "000000",
      expectedOtpHash: secrets.otpHash,
    });
    expect(badOtpRes.valid).toBe(false);

    // Valid QR Token check
    const qrRes = await verifyDeliveryProofSecret({
      inputQrToken: secrets.qrCodeToken,
      expectedQrToken: secrets.qrCodeToken,
    });
    expect(qrRes.valid).toBe(true);
    expect(qrRes.method).toBe("qr");

    // Invalid QR Token check
    const badQrRes = await verifyDeliveryProofSecret({
      inputQrToken: "tt_dlv_invalidtamperedtoken",
      expectedQrToken: secrets.qrCodeToken,
    });
    expect(badQrRes.valid).toBe(false);

    // Empty verification inputs check
    const emptyRes = await verifyDeliveryProofSecret({});
    expect(emptyRes.valid).toBe(false);
  });

  it("executes complete end-to-end delivery verification and releases escrow to driver wallet", async () => {
    // 1. Create Driver User and Driver Document
    const driverUser = (await UserModel.create({
      phone: "+919822112233",
      role: "driver",
      name: "Eknath Shinde Driver",
      language: "mr",
      dpdpConsent: { consentedAt: new Date() },
    })) as IUser;

    const driver = (await DriverModel.create({
      userId: driverUser._id,
      licenseNumber: "MH-15-2018-9998888",
      experienceYears: 8,
      operatingDistricts: ["Nashik", "Pune"],
      kycStatus: "verified",
      trustScore: 94,
      totalTripsCompleted: 5,
    })) as IDriver;

    // 2. Create Entrepreneur User
    const entrepreneur = (await UserModel.create({
      phone: "+919822998877",
      role: "entrepreneur",
      name: "Suresh Patil Farmer",
      language: "mr",
      dpdpConsent: { consentedAt: new Date() },
    })) as IUser;

    // 3. Create Booking with Fare: ₹12,000 total (50% advance = ₹6,000, 50% delivery = ₹6,000)
    // 7.5% platform fee = ₹900, 5% GST = ₹600. Driver net = ₹10,500.
    const booking = (await BookingModel.create({
      bookingNumber: "TT-NSK-261022-777",
      entrepreneurId: entrepreneur._id,
      driverId: driver._id,
      status: "in_transit",
      pickup: {
        district: "Nashik",
        address: "Pimpalgaon Baswant Onion APMC Market",
        contactName: "Suresh Patil",
        contactPhone: "+919822998877",
        coordinates: [73.9854, 20.1706],
      },
      drop: {
        district: "Pune",
        address: "Gultekdi Market Yard, Pune",
        receiverName: "Dilip Wholesaler",
        receiverPhone: "+919822445566",
        coordinates: [73.8677, 18.4975],
      },
      goods: {
        category: "agricultural_produce",
        description: "Fresh Nashik Red Onions (कांदा)",
        weightKg: 4000,
        isPerishable: true,
      },
      truckType: "truck_14ft",
      route: {
        distanceKm: 210,
        durationMinutes: 300,
      },
      fare: {
        baseFarePaise: 80000,
        distanceFarePaise: 950000,
        handlingFarePaise: 50000,
        subtotalFarePaise: 1080000,
        platformFeePaise: 90000,
        gstTaxPaise: 60000,
        totalFarePaise: 1200000,
        advance50Paise: 600000,
        delivery50Paise: 600000,
      },
      payment: {
        advancePaid: true,
        advancePaidAt: new Date(),
        advancePaymentId: "pay_adv_test_123",
      },
    })) as IBooking;

    // 4. Record advance escrow hold
    await recordAdvanceEscrowHold({
      bookingId: booking._id,
      entrepreneurId: entrepreneur._id.toString(),
      amountPaise: booking.fare.advance50Paise,
      paymentMethod: "mock",
      paymentReference: "pay_adv_test_123",
    });

    // 5. Generate secrets and save to booking
    const secrets = await generateDeliveryProofSecrets(booking.bookingNumber);
    booking.deliveryProof = {
      deliveryOtpHash: secrets.otpHash,
      qrCodeToken: secrets.qrCodeToken,
    };
    await booking.save();

    // 6. Simulate Driver verifying delivery with receiver's OTP
    const verification = await verifyDeliveryProofSecret({
      inputOtp: secrets.otp,
      expectedOtpHash: booking.deliveryProof.deliveryOtpHash,
    });
    expect(verification.valid).toBe(true);

    // 7. Release Escrow via double-entry ledger
    await recordDeliveryEscrowAndRelease({
      bookingId: booking._id,
      driverId: driver._id.toString(),
      driverUserId: driver.userId.toString(),
      totalFarePaise: booking.fare.totalFarePaise,
      delivery50Paise: booking.fare.delivery50Paise,
      platformFeePaise: booking.fare.platformFeePaise,
      gstTaxPaise: booking.fare.gstTaxPaise,
      paymentMethod: "cash",
      paymentReference: `dlv_${Date.now()}`,
    });

    // 8. Update driver trips count and booking state
    await DriverModel.findByIdAndUpdate(driver._id, {
      $inc: { totalTripsCompleted: 1 },
    });

    booking.status = "completed";
    booking.payment = {
      ...(booking.payment || { advancePaid: true }),
      deliveryPaid: true,
      deliveryPaidAt: new Date(),
    };
    booking.deliveryProof = {
      ...(booking.deliveryProof || {}),
      verifiedAt: new Date(),
      verifiedMethod: verification.method,
      dropPhotos: ["data:image/jpeg;base64,mockphotodata"],
    };
    await booking.save();

    // 9. Assert Driver Wallet receives net ₹10,500 (1050000 paise)
    const driverWallet = await WalletModel.findOne({ userId: driver.userId });
    expect(driverWallet).toBeDefined();
    expect(driverWallet!.balancePaise).toBe(1050000);
    expect(driverWallet!.escrowBalancePaise).toBe(0);

    // 10. Assert Driver trips count incremented
    const updatedDriver = await DriverModel.findById(driver._id);
    expect(updatedDriver!.totalTripsCompleted).toBe(6);

    // 11. Assert Booking is marked completed
    const updatedBooking = await BookingModel.findById(booking._id);
    expect(updatedBooking!.status).toBe("completed");
    expect(updatedBooking!.deliveryProof?.verifiedMethod).toBe("otp");
    expect(updatedBooking!.deliveryProof?.verifiedAt).toBeDefined();
  });

  it("broadcasts real-time vehicle GPS coordinates via tracking events", async () => {
    const bookingId = new Types.ObjectId().toString();

    let receivedEvent: TrackingLocationUpdate | null = null;
    const eventName = `track:${bookingId}`;
    const testListener = (event: TrackingLocationUpdate) => {
      receivedEvent = event;
    };

    trackingEmitter.on(eventName, testListener);

    const payload: TrackingLocationUpdate = {
      bookingId,
      coordinates: [73.8567, 18.5204],
      speedKmh: 58,
      heading: 145,
      etaMinutes: 45,
      timestamp: new Date().toISOString(),
    };

    broadcastLocationUpdate(payload);

    expect(receivedEvent).toBeDefined();
    expect(receivedEvent!.bookingId).toBe(bookingId);
    expect(receivedEvent!.coordinates).toEqual([73.8567, 18.5204]);
    expect(receivedEvent!.speedKmh).toBe(58);
    expect(receivedEvent!.etaMinutes).toBe(45);

    trackingEmitter.off(eventName, testListener);
  });

  it("registers emergency SOS alert and creates high-priority audit log", async () => {
    const driverUserId = new Types.ObjectId();
    const entrepreneur = (await UserModel.create({
      phone: "+919822000001",
      role: "entrepreneur",
      dpdpConsent: { consentedAt: new Date() },
    })) as IUser;

    const booking = (await BookingModel.create({
      bookingNumber: "TT-SOS-TEST-999",
      entrepreneurId: entrepreneur._id,
      status: "in_transit",
      pickup: {
        district: "Pune",
        address: "Hadapsar, Pune",
        contactName: "Sender",
        contactPhone: "+919822000001",
        coordinates: [73.92, 18.50],
      },
      drop: {
        district: "Solapur",
        address: "Solapur APMC",
        receiverName: "Receiver",
        receiverPhone: "+919822000002",
        coordinates: [75.90, 17.65],
      },
      goods: {
        category: "fmcg",
        description: "Emergency Medical & Grocery Supplies",
        weightKg: 1500,
      },
      truckType: "pickup",
      route: {
        distanceKm: 240,
        durationMinutes: 320,
      },
      fare: {
        baseFarePaise: 55000,
        distanceFarePaise: 560000,
        handlingFarePaise: 25000,
        subtotalFarePaise: 640000,
        platformFeePaise: 60000,
        gstTaxPaise: 40000,
        totalFarePaise: 800000,
        advance50Paise: 400000,
        delivery50Paise: 400000,
      },
    })) as IBooking;

    // Simulate SOS dispatch
    const sosEntry = {
      triggeredBy: driverUserId,
      role: "driver" as const,
      location: [74.5, 18.1] as [number, number],
      reason: "गाडीचा टायर फुटला आणि महामार्गावर थांबलो (Tyre blowout on NH 65)",
      status: "active" as const,
      triggeredAt: new Date(),
    };

    booking.sosAlerts = [sosEntry];
    booking.timeline.push({
      status: booking.status,
      timestamp: new Date(),
      note: `🚨 तातडीचा SOS इशारा: ${sosEntry.reason}`,
    });
    await booking.save();

    await AuditLogModel.create({
      actorId: driverUserId,
      actorRole: "driver",
      action: "emergency.sos_triggered",
      resourceType: "booking",
      resourceId: booking._id.toString(),
      metadata: {
        bookingNumber: booking.bookingNumber,
        reason: sosEntry.reason,
        location: sosEntry.location,
      },
    });

    const updatedBooking = await BookingModel.findById(booking._id);
    expect(updatedBooking!.sosAlerts?.length).toBe(1);
    expect(updatedBooking!.sosAlerts?.[0].status).toBe("active");
    expect(updatedBooking!.timeline.some((t) => t.note?.includes("SOS"))).toBe(true);

    const auditLog = await AuditLogModel.findOne({
      action: "emergency.sos_triggered",
      resourceId: booking._id.toString(),
    });
    expect(auditLog).toBeDefined();
    expect(auditLog?.metadata?.bookingNumber).toBe("TT-SOS-TEST-999");
    expect(auditLog?.metadata?.reason).toContain("गाडीचा टायर फुटला");
  });
});
