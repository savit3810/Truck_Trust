import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  postDoubleEntryTransaction,
  recordAdvanceEscrowHold,
  recordDeliveryEscrowAndRelease,
  recordCancellationRefundAndFee,
  recordDisputeEscrowFreeze,
  recordDisputeResolution,
  executeDriverPayout,
  calculateLedgerAccountBalance,
} from "./ledger-engine";
import { LedgerEntryModel } from "./models/ledger-entry.model";
import { WalletModel } from "./models/wallet.model";
import { UserModel } from "@/features/auth/models/user.model";
import { DriverModel } from "@/features/drivers/models/driver.model";
import { MockPaymentAdapter } from "@/lib/providers/payment/mock.adapter";
import { RazorpayAdapter } from "@/lib/providers/payment/razorpay.adapter";
import crypto from "crypto";

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
  await LedgerEntryModel.deleteMany({});
  await WalletModel.deleteMany({});
  await UserModel.deleteMany({});
  await DriverModel.deleteMany({});
});

describe("Phase 4: Double-Entry Ledger Engine & Financial Invariants", () => {
  it("strictly enforces positive integer paise on all ledger legs", async () => {
    const txGroup = crypto.randomUUID();

    // 1. Should fail on fractional paise (floating point arithmetic leak)
    await expect(
      postDoubleEntryTransaction(txGroup, [
        {
          debitAccount: "bank:razorpay",
          creditAccount: "escrow:held",
          amountPaise: 1500.5,
          type: "advance_held",
          description: "Fractional test",
        },
      ])
    ).rejects.toThrow("Invalid non-positive integer paise amount");

    // 2. Should fail on zero or negative paise
    await expect(
      postDoubleEntryTransaction(txGroup, [
        {
          debitAccount: "bank:razorpay",
          creditAccount: "escrow:held",
          amountPaise: -500,
          type: "advance_held",
          description: "Negative test",
        },
      ])
    ).rejects.toThrow("Invalid non-positive integer paise amount");

    // 3. Positive integer should succeed
    const valid = await postDoubleEntryTransaction(txGroup, [
      {
        debitAccount: "bank:razorpay",
        creditAccount: "escrow:held",
        amountPaise: 150000,
        type: "advance_held",
        description: "Valid ₹1500 deposit",
      },
    ]);
    expect(valid).toHaveLength(1);
    expect(valid[0].amountPaise).toBe(150000);
  });

  it("handles 50% advance escrow hold and verifies ledger live balance", async () => {
    const bookingId = new mongoose.Types.ObjectId();
    const entrepreneurId = new mongoose.Types.ObjectId();
    const advanceAmountPaise = 110000; // ₹1,100

    await recordAdvanceEscrowHold({
      bookingId,
      entrepreneurId,
      amountPaise: advanceAmountPaise,
      paymentMethod: "razorpay",
      paymentReference: "pay_test_adv123",
    });

    const escrowBalance = await calculateLedgerAccountBalance("escrow:held");
    expect(escrowBalance).toBe(110000);
  });

  it("executes delivery completion, releasing escrow to platform, GST, and driver wallet", async () => {
    const bookingId = new mongoose.Types.ObjectId();
    const entrepreneurId = new mongoose.Types.ObjectId();
    const driverUser = await UserModel.create({ phone: "9822114401", role: "driver", name: "Santosh" });
    const driver = await DriverModel.create({ userId: driverUser._id, licenseNumber: "MH-48-1234" });

    const totalFarePaise = 220000; // ₹2,200
    const advance50Paise = 110000; // ₹1,100
    const delivery50Paise = 110000; // ₹1,100
    const platformFeePaise = 16500; // 7.5% = ₹165
    const gstTaxPaise = 11000; // 5% = ₹110
    // Driver Net = 220000 - 16500 - 11000 = 192500 paise (₹1,925)

    // 1. Advance held prior
    await recordAdvanceEscrowHold({
      bookingId,
      entrepreneurId,
      amountPaise: advance50Paise,
      paymentMethod: "razorpay",
      paymentReference: "pay_adv",
    });

    // 2. Delivery completed
    await recordDeliveryEscrowAndRelease({
      bookingId,
      driverId: driver._id,
      driverUserId: driverUser._id,
      totalFarePaise,
      delivery50Paise,
      platformFeePaise,
      gstTaxPaise,
      paymentMethod: "cash",
    });

    // Audit Ledger Balances
    const platformRevenue = await calculateLedgerAccountBalance("revenue:platform_fee");
    expect(platformRevenue).toBe(16500);

    const gstLiability = await calculateLedgerAccountBalance("liability:gst_collected");
    expect(gstLiability).toBe(11000);

    const driverLedgerBalance = await calculateLedgerAccountBalance(`driver:${driver._id}:available`);
    expect(driverLedgerBalance).toBe(192500);

    // Verify Driver Wallet was automatically updated
    const driverWallet = await WalletModel.findOne({ userId: driverUser._id });
    expect(driverWallet?.balancePaise).toBe(192500);
    expect(driverWallet?.totalEarnedPaise).toBe(192500);
  });

  it("settles stage 2 cancellation with driver compensation and entrepreneur refund", async () => {
    const bookingId = new mongoose.Types.ObjectId();
    const entrepreneurId = new mongoose.Types.ObjectId();
    const driverUser = await UserModel.create({ phone: "9822114402", role: "driver", name: "Ganesh" });
    const driver = await DriverModel.create({ userId: driverUser._id, licenseNumber: "MH-15-5678" });

    const advancePaise = 100000; // ₹1,000
    const cancellationFeePaise = 20000; // ₹200 driver compensation
    const refundAmountPaise = 80000; // ₹800 refunded

    // Hold advance first
    await recordAdvanceEscrowHold({
      bookingId,
      entrepreneurId,
      amountPaise: advancePaise,
      paymentMethod: "razorpay",
      paymentReference: "pay_canc",
    });

    // Cancel with split
    await recordCancellationRefundAndFee({
      bookingId,
      entrepreneurId,
      driverId: driver._id,
      driverUserId: driverUser._id,
      advancePaise,
      refundAmountPaise,
      cancellationFeePaise,
      reason: "Farmer cancelled after truck was dispatched",
    });

    const driverBalance = await calculateLedgerAccountBalance(`driver:${driver._id}:available`);
    expect(driverBalance).toBe(20000);

    const driverWallet = await WalletModel.findOne({ userId: driverUser._id });
    expect(driverWallet?.balancePaise).toBe(20000);
  });

  it("freezes escrow on dispute and settles according to admin resolution", async () => {
    const bookingId = new mongoose.Types.ObjectId();
    const entrepreneurId = new mongoose.Types.ObjectId();
    const driverUser = await UserModel.create({ phone: "9822114403", role: "driver", name: "Baban" });
    const driver = await DriverModel.create({ userId: driverUser._id, licenseNumber: "MH-12-9999" });

    const advancePaise = 100000;

    await recordAdvanceEscrowHold({
      bookingId,
      entrepreneurId,
      amountPaise: advancePaise,
      paymentMethod: "razorpay",
      paymentReference: "pay_disp",
    });

    // 1. Freeze
    await recordDisputeEscrowFreeze({
      bookingId,
      disputeAmountPaise: advancePaise,
      reason: "Damaged chiku crates during transit",
    });

    const disputedHoldBalance = await calculateLedgerAccountBalance("escrow:disputed_hold");
    expect(disputedHoldBalance).toBe(100000);

    // 2. Admin Resolution: 60% refund to farmer (₹600), 40% to driver (₹400)
    await recordDisputeResolution({
      bookingId,
      totalDisputedPaise: advancePaise,
      refundToEntrepreneurPaise: 60000,
      payToDriverPaise: 40000,
      platformFeePaise: 0,
      entrepreneurId,
      driverId: driver._id,
      driverUserId: driverUser._id,
      resolutionNote: "Admin compromise: split 60-40",
    });

    // Disputed hold must now be balanced to 0
    const finalDisputeBalance = await calculateLedgerAccountBalance("escrow:disputed_hold");
    expect(finalDisputeBalance).toBe(0);

    const driverWallet = await WalletModel.findOne({ userId: driverUser._id });
    expect(driverWallet?.balancePaise).toBe(40000);
  });

  it("enforces ₹500 minimum threshold and balance checks for driver instant payout", async () => {
    const driverUser = await UserModel.create({ phone: "9822114404", role: "driver", name: "Tukaram" });
    await DriverModel.create({ userId: driverUser._id, licenseNumber: "MH-48-7777" });

    // Seed wallet with ₹800 (80,000 paise)
    await WalletModel.create({
      userId: driverUser._id,
      balancePaise: 80000,
      totalEarnedPaise: 80000,
    });

    // 1. Reject payout below ₹500
    await expect(
      executeDriverPayout({
        driverUserId: driverUser._id,
        amountPaise: 30000, // ₹300
        payoutReference: "REF-MIN-TEST",
        destination: "UPI: 9822114404@upi",
      })
    ).rejects.toThrow("किमान पैसे काढण्याची मर्यादा ₹५०० आहे");

    // 2. Reject payout exceeding available balance
    await expect(
      executeDriverPayout({
        driverUserId: driverUser._id,
        amountPaise: 100000, // ₹1,000 (exceeds ₹800)
        payoutReference: "REF-EXCEED-TEST",
        destination: "UPI: 9822114404@upi",
      })
    ).rejects.toThrow("खात्यात पुरेसे पैसे उपलब्ध नाहीत");

    // 3. Successful payout of ₹500 (50,000 paise)
    const result = await executeDriverPayout({
      driverUserId: driverUser._id,
      amountPaise: 50000,
      payoutReference: "REF-SUCCESS-001",
      destination: "UPI: 9822114404@upi",
    });

    expect(result.success).toBe(true);
    expect(result.newBalancePaise).toBe(30000); // ₹800 - ₹500 = ₹300 remaining

    const updatedWallet = await WalletModel.findOne({ userId: driverUser._id });
    expect(updatedWallet?.balancePaise).toBe(30000);
    expect(updatedWallet?.totalWithdrawnPaise).toBe(50000);

    // Double-entry check
    const ledgerDisbursed = await calculateLedgerAccountBalance("bank:payout_disbursed:REF-SUCCESS-001");
    expect(ledgerDisbursed).toBe(50000);
  });

  it("validates Mock and Razorpay payment provider signatures correctly", async () => {
    // 1. Mock Adapter
    const mockProvider = new MockPaymentAdapter();
    const order = await mockProvider.createOrder({ amountPaise: 50000, receipt: "REC-01" });
    expect(order.orderId).toContain("order_mock_");

    const validMock = await mockProvider.verifyPaymentSignature({
      orderId: order.orderId,
      paymentId: "pay_mock_123",
      signature: "mock_valid_signature",
    });
    expect(validMock).toBe(true);

    // 2. Razorpay Adapter Cryptographic HMAC Verification
    const secret = "test_razorpay_secret_key_123456";
    const razorpayAdapter = new RazorpayAdapter("rzp_test_key", secret);

    const testOrderId = "order_rzp_9999";
    const testPaymentId = "pay_rzp_8888";
    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest("hex");

    const isValid = await razorpayAdapter.verifyPaymentSignature({
      orderId: testOrderId,
      paymentId: testPaymentId,
      signature: validSignature,
    });
    expect(isValid).toBe(true);

    const isInvalid = await razorpayAdapter.verifyPaymentSignature({
      orderId: testOrderId,
      paymentId: testPaymentId,
      signature: "tampered_signature_hex",
    });
    expect(isInvalid).toBe(false);
  });
});
