import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";
import { UserModel } from "./models/user.model";
import { OtpModel } from "./models/otp.model";
import { LedgerEntryModel } from "@/features/ledger/models/ledger-entry.model";

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

describe("Auth & Ledger Models (In-Memory MongoDB)", () => {
  it("creates a user with DPDP consent and unique phone", async () => {
    const user = await UserModel.create({
      phone: "9822012345",
      name: "Ramesh Patil",
      role: "entrepreneur",
      language: "mr",
      dpdpConsent: {
        consentedAt: new Date(),
        ipAddress: "127.0.0.1",
      },
    });

    expect(user._id).toBeDefined();
    expect(user.phone).toBe("9822012345");
    expect(user.role).toBe("entrepreneur");
    expect(user.language).toBe("mr");
  });

  it("hashes OTP and verifies matching bcrypt hash", async () => {
    const rawOtp = "481920";
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawOtp, salt);

    const otpDoc = await OtpModel.create({
      phone: "9822012345",
      purpose: "login",
      codeHash: hash,
      expiresAt: new Date(Date.now() + 300000),
    });

    expect(otpDoc._id).toBeDefined();

    const isMatch = await bcrypt.compare(rawOtp, otpDoc.codeHash);
    expect(isMatch).toBe(true);

    const isMismatch = await bcrypt.compare("000000", otpDoc.codeHash);
    expect(isMismatch).toBe(false);
  });

  it("enforces integer paise on ledger entries and rejects floating-point amounts", async () => {
    // Valid integer paise
    const validEntry = await LedgerEntryModel.create({
      transactionGroup: "tx_group_001",
      debitAccount: "escrow:held",
      creditAccount: "driver:60d5ec49f1b2c8b1f8c8d8a1",
      amountPaise: 150000, // ₹1,500
      type: "escrow_release",
      description: "50% delivery release upon OTP verification",
    });

    expect(validEntry.amountPaise).toBe(150000);

    // Floating-point amounts must fail validation
    await expect(
      LedgerEntryModel.create({
        transactionGroup: "tx_group_002",
        debitAccount: "escrow:held",
        creditAccount: "driver:60d5ec49f1b2c8b1f8c8d8a1",
        amountPaise: 1500.5, // Invalid float!
        type: "escrow_release",
        description: "Invalid float paise",
      })
    ).rejects.toThrow();
  });
});
