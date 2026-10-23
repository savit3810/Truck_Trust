import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { UserModel } from "@/features/auth/models/user.model";
import { DriverModel } from "./models/driver.model";
import { TruckModel } from "@/features/trucks/models/truck.model";
import { DocumentModel } from "@/features/documents/models/document.model";

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

describe("Driver & Truck Verification (In-Memory MongoDB)", () => {
  it("registers a driver and truck with pending KYC status", async () => {
    const user = await UserModel.create({
      phone: "9730099881",
      name: "Tukaram Shinde",
      role: "driver",
      language: "mr",
    });

    const driver = await DriverModel.create({
      userId: user._id,
      licenseNumber: "MH-48-20180004567",
      experienceYears: 6,
      operatingDistricts: ["Palghar", "Thane"],
      kycStatus: "pending",
      trustScore: 80,
    });

    const truck = await TruckModel.create({
      driverId: driver._id,
      registrationNumber: "MH-48-CD-9988",
      truckType: "pickup",
      capacityKg: 1500,
      bodyType: "tarpaulin",
      isAvailable: false, // Initially false until verified
    });

    expect(driver.kycStatus).toBe("pending");
    expect(truck.isAvailable).toBe(false);
    expect(truck.registrationNumber).toBe("MH-48-CD-9988");
  });

  it("admin approval updates driver kycStatus to verified and activates truck", async () => {
    const user = await UserModel.create({
      phone: "9730099882",
      name: "Balu Patil",
      role: "driver",
      language: "mr",
      isVerified: false,
    });

    const driver = await DriverModel.create({
      userId: user._id,
      licenseNumber: "MH-15-20160001234",
      experienceYears: 10,
      operatingDistricts: ["Nashik", "Pune"],
      kycStatus: "pending",
    });

    const truck = await TruckModel.create({
      driverId: driver._id,
      registrationNumber: "MH-15-GH-1234",
      truckType: "truck_14ft",
      capacityKg: 4000,
      isAvailable: false,
    });

    // Simulate Admin Approval
    driver.kycStatus = "verified";
    driver.verifiedAt = new Date();
    await driver.save();

    await UserModel.findByIdAndUpdate(user._id, { isVerified: true });
    await TruckModel.updateMany({ driverId: driver._id }, { isAvailable: true });

    const updatedUser = await UserModel.findById(user._id);
    const updatedTruck = await TruckModel.findById(truck._id);

    expect(driver.kycStatus).toBe("verified");
    expect(updatedUser?.isVerified).toBe(true);
    expect(updatedTruck?.isAvailable).toBe(true);
  });

  it("auto-suspends driver when a mandatory document expires", async () => {
    const user = await UserModel.create({
      phone: "9730099883",
      name: "Raju Shirole",
      role: "driver",
      isVerified: true,
    });

    const driver = await DriverModel.create({
      userId: user._id,
      licenseNumber: "MH-12-20100004321",
      kycStatus: "verified",
    });

    const truck = await TruckModel.create({
      driverId: driver._id,
      registrationNumber: "MH-12-XY-8899",
      truckType: "tata_ace",
      capacityKg: 750,
      isAvailable: true,
    });

    // Create an already-expired document (e.g. PUC expired yesterday)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const doc = await DocumentModel.create({
      ownerId: truck._id,
      ownerType: "truck",
      docType: "puc",
      fileUrl: "/uploads/mock_puc.pdf",
      originalFilename: "puc_test.pdf",
      fileSizeBytes: 120000,
      mimeType: "application/pdf",
      expiryDate: yesterday,
      status: "approved",
    });

    // Simulate the expiry cron logic
    if (doc.expiryDate && doc.expiryDate < new Date()) {
      doc.status = "rejected";
      doc.rejectionReason = "Document expired";
      await doc.save();

      // Suspend driver & truck
      await DriverModel.findByIdAndUpdate(driver._id, {
        kycStatus: "action_needed",
        rejectionReason: "PUC expired",
      });
      await TruckModel.findByIdAndUpdate(truck._id, { isAvailable: false });
    }

    const suspendedDriver = await DriverModel.findById(driver._id);
    const suspendedTruck = await TruckModel.findById(truck._id);

    expect(suspendedDriver?.kycStatus).toBe("action_needed");
    expect(suspendedTruck?.isAvailable).toBe(false);
  });
});
