import crypto from "crypto";
import mongoose from "mongoose";
import { LedgerEntryModel, LedgerEntryType } from "./models/ledger-entry.model";
import { WalletModel } from "./models/wallet.model";
import { DriverModel } from "@/features/drivers/models/driver.model";

export interface DoubleEntryLeg {
  debitAccount: string;
  creditAccount: string;
  amountPaise: number;
  type: LedgerEntryType;
  description: string;
}

/**
 * Validates and records balanced double-entry accounting transactions.
 * Strict Invariant: Every monetary movement must have positive integer paise.
 */
export async function postDoubleEntryTransaction(
  transactionGroup: string,
  legs: DoubleEntryLeg[],
  bookingId?: mongoose.Types.ObjectId
) {
  if (!legs || legs.length === 0) {
    throw new Error("Cannot post empty ledger transaction");
  }

  for (const leg of legs) {
    if (!Number.isInteger(leg.amountPaise) || leg.amountPaise <= 0) {
      throw new Error(`Invalid non-positive integer paise amount: ${leg.amountPaise}`);
    }
    if (!leg.debitAccount || !leg.creditAccount) {
      throw new Error("Both debit and credit accounts must be specified");
    }
  }

  const entriesToInsert = legs.map((leg) => ({
    transactionGroup,
    bookingId,
    debitAccount: leg.debitAccount,
    creditAccount: leg.creditAccount,
    amountPaise: leg.amountPaise,
    type: leg.type,
    description: leg.description,
  }));

  const inserted = await LedgerEntryModel.insertMany(entriesToInsert);
  return inserted;
}

/**
 * Record initial 50% advance payment from Entrepreneur into Escrow
 */
export async function recordAdvanceEscrowHold(params: {
  bookingId: mongoose.Types.ObjectId;
  entrepreneurId: mongoose.Types.ObjectId | string;
  amountPaise: number;
  paymentMethod: "razorpay" | "cash" | "mock";
  paymentReference: string;
}) {
  const transactionGroup = crypto.randomUUID();
  const sourceAccount =
    params.paymentMethod === "cash"
      ? "cash:escrow_advance"
      : `bank:razorpay:${params.paymentReference}`;

  const leg: DoubleEntryLeg = {
    debitAccount: sourceAccount,
    creditAccount: "escrow:held",
    amountPaise: params.amountPaise,
    type: "advance_held",
    description: `50% Advance Escrow Deposit for Booking ${params.bookingId.toString()} (${params.paymentMethod})`,
  };

  return postDoubleEntryTransaction(transactionGroup, [leg], params.bookingId);
}

/**
 * Record delivery completion:
 * 1. Collects remaining 50% balance (if any) into Escrow.
 * 2. Releases Escrow to Platform Commission, GST Liability, and Driver Net Earnings.
 * 3. Immediately credits Driver Wallet available balance.
 */
export async function recordDeliveryEscrowAndRelease(params: {
  bookingId: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId | string;
  driverUserId: mongoose.Types.ObjectId | string;
  totalFarePaise: number;
  delivery50Paise: number;
  platformFeePaise: number;
  gstTaxPaise: number;
  paymentMethod: "razorpay" | "cash" | "mock";
  paymentReference?: string;
}) {
  const transactionGroup = crypto.randomUUID();
  const legs: DoubleEntryLeg[] = [];

  // 1. If remaining 50% is collected at delivery
  if (params.delivery50Paise > 0) {
    const deliverySource =
      params.paymentMethod === "cash"
        ? "cash:collected_at_delivery"
        : `bank:razorpay:${params.paymentReference || "delivery"}`;

    legs.push({
      debitAccount: deliverySource,
      creditAccount: "escrow:held",
      amountPaise: params.delivery50Paise,
      type: "advance_held",
      description: `Delivery 50% payment collected for Booking ${params.bookingId.toString()}`,
    });
  }

  // 2. Driver Net Share calculation
  const driverNetSharePaise =
    params.totalFarePaise - params.platformFeePaise - params.gstTaxPaise;

  if (driverNetSharePaise <= 0) {
    throw new Error(
      `Calculated driver net share is non-positive (${driverNetSharePaise} paise)`
    );
  }

  // Invariant verification: sum of distributions MUST equal totalFarePaise
  const sumDistribution =
    driverNetSharePaise + params.platformFeePaise + params.gstTaxPaise;
  if (sumDistribution !== params.totalFarePaise) {
    throw new Error(
      `Escrow distribution mismatch: total ${params.totalFarePaise} != sum ${sumDistribution}`
    );
  }

  // 3. Release escrow legs
  // A. Platform Fee
  if (params.platformFeePaise > 0) {
    legs.push({
      debitAccount: "escrow:held",
      creditAccount: "revenue:platform_fee",
      amountPaise: params.platformFeePaise,
      type: "platform_fee",
      description: `TruckTrust platform commission (7.5%) for Booking ${params.bookingId.toString()}`,
    });
  }

  // B. GST Liability
  if (params.gstTaxPaise > 0) {
    legs.push({
      debitAccount: "escrow:held",
      creditAccount: "liability:gst_collected",
      amountPaise: params.gstTaxPaise,
      type: "escrow_release",
      description: `GST (5%) on freight for Booking ${params.bookingId.toString()}`,
    });
  }

  // C. Driver Net Earnings
  legs.push({
    debitAccount: "escrow:held",
    creditAccount: `driver:${params.driverId.toString()}:available`,
    amountPaise: driverNetSharePaise,
    type: "escrow_release",
    description: `Net freight earnings released to driver for Booking ${params.bookingId.toString()}`,
  });

  // Post all balanced legs
  const insertedEntries = await postDoubleEntryTransaction(
    transactionGroup,
    legs,
    params.bookingId
  );

  // Update Driver Wallet
  await WalletModel.findOneAndUpdate(
    { userId: params.driverUserId },
    {
      $inc: {
        balancePaise: driverNetSharePaise,
        totalEarnedPaise: driverNetSharePaise,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  return insertedEntries;
}

/**
 * Record cancellation refund and driver cancellation compensation fee
 */
export async function recordCancellationRefundAndFee(params: {
  bookingId: mongoose.Types.ObjectId;
  entrepreneurId: mongoose.Types.ObjectId | string;
  driverId?: mongoose.Types.ObjectId | string;
  driverUserId?: mongoose.Types.ObjectId | string;
  advancePaise: number;
  refundAmountPaise: number;
  cancellationFeePaise: number;
  reason: string;
}) {
  const transactionGroup = crypto.randomUUID();
  const legs: DoubleEntryLeg[] = [];

  // Invariant verification: refund + fee must equal advance
  if (params.refundAmountPaise + params.cancellationFeePaise !== params.advancePaise) {
    throw new Error(
      `Cancellation breakdown mismatch: advance ${params.advancePaise} != refund ${params.refundAmountPaise} + fee ${params.cancellationFeePaise}`
    );
  }

  // 1. Refund to Entrepreneur
  if (params.refundAmountPaise > 0) {
    legs.push({
      debitAccount: "escrow:held",
      creditAccount: `bank:refund_pending:${params.entrepreneurId.toString()}`,
      amountPaise: params.refundAmountPaise,
      type: "refund",
      description: `Advance refund for cancelled booking: ${params.reason}`,
    });
  }

  // 2. Driver Compensation Fee
  if (params.cancellationFeePaise > 0 && params.driverId) {
    legs.push({
      debitAccount: "escrow:held",
      creditAccount: `driver:${params.driverId.toString()}:available`,
      amountPaise: params.cancellationFeePaise,
      type: "driver_tip",
      description: `Driver cancellation compensation fee: ${params.reason}`,
    });

    if (params.driverUserId) {
      await WalletModel.findOneAndUpdate(
        { userId: params.driverUserId },
        {
          $inc: {
            balancePaise: params.cancellationFeePaise,
            totalEarnedPaise: params.cancellationFeePaise,
          },
        },
        { upsert: true, returnDocument: "after" }
      );
    }
  }

  return postDoubleEntryTransaction(transactionGroup, legs, params.bookingId);
}

/**
 * Freeze Escrow into Disputed Hold
 */
export async function recordDisputeEscrowFreeze(params: {
  bookingId: mongoose.Types.ObjectId;
  disputeAmountPaise: number;
  reason: string;
}) {
  const transactionGroup = crypto.randomUUID();
  const leg: DoubleEntryLeg = {
    debitAccount: "escrow:held",
    creditAccount: "escrow:disputed_hold",
    amountPaise: params.disputeAmountPaise,
    type: "dispute_adjustment",
    description: `Dispute hold: ${params.reason}`,
  };

  return postDoubleEntryTransaction(transactionGroup, [leg], params.bookingId);
}

/**
 * Resolve Dispute: Split funds from Disputed Hold between Entrepreneur and Driver
 */
export async function recordDisputeResolution(params: {
  bookingId: mongoose.Types.ObjectId;
  totalDisputedPaise: number;
  refundToEntrepreneurPaise: number;
  payToDriverPaise: number;
  platformFeePaise: number;
  entrepreneurId: mongoose.Types.ObjectId | string;
  driverId: mongoose.Types.ObjectId | string;
  driverUserId?: mongoose.Types.ObjectId | string;
  resolutionNote: string;
}) {
  const sum =
    params.refundToEntrepreneurPaise +
    params.payToDriverPaise +
    params.platformFeePaise;

  if (sum !== params.totalDisputedPaise) {
    throw new Error(
      `Dispute resolution amounts (${sum}) do not match disputed total (${params.totalDisputedPaise})`
    );
  }

  const transactionGroup = crypto.randomUUID();
  const legs: DoubleEntryLeg[] = [];

  if (params.refundToEntrepreneurPaise > 0) {
    legs.push({
      debitAccount: "escrow:disputed_hold",
      creditAccount: `bank:refund_processed:${params.entrepreneurId.toString()}`,
      amountPaise: params.refundToEntrepreneurPaise,
      type: "refund",
      description: `Dispute resolution refund to entrepreneur: ${params.resolutionNote}`,
    });
  }

  if (params.payToDriverPaise > 0) {
    legs.push({
      debitAccount: "escrow:disputed_hold",
      creditAccount: `driver:${params.driverId.toString()}:available`,
      amountPaise: params.payToDriverPaise,
      type: "dispute_adjustment",
      description: `Dispute resolution payout to driver: ${params.resolutionNote}`,
    });

    if (params.driverUserId) {
      await WalletModel.findOneAndUpdate(
        { userId: params.driverUserId },
        {
          $inc: {
            balancePaise: params.payToDriverPaise,
            totalEarnedPaise: params.payToDriverPaise,
          },
        },
        { upsert: true, returnDocument: "after" }
      );
    }
  }

  if (params.platformFeePaise > 0) {
    legs.push({
      debitAccount: "escrow:disputed_hold",
      creditAccount: "revenue:platform_fee",
      amountPaise: params.platformFeePaise,
      type: "platform_fee",
      description: `Dispute retained platform fee: ${params.resolutionNote}`,
    });
  }

  return postDoubleEntryTransaction(transactionGroup, legs, params.bookingId);
}

/**
 * Driver Instant Payout Execution:
 * Minimum ₹500 (50,000 paise).
 * Deducts balance from driver's available account and logs payout disbursement.
 */
export async function executeDriverPayout(params: {
  driverUserId: mongoose.Types.ObjectId | string;
  amountPaise: number;
  payoutReference: string;
  destination: string; // e.g. "UPI: 9822110001@upi" or "Bank: HDFC ...5012"
}) {
  const MIN_PAYOUT_PAISE = 50000; // ₹500
  if (params.amountPaise < MIN_PAYOUT_PAISE) {
    throw new Error(
      `किमान पैसे काढण्याची मर्यादा ₹५०० आहे (Minimum payout is ₹500 / ${MIN_PAYOUT_PAISE} paise)`
    );
  }

  // 1. Check Driver and Wallet
  const driver = await DriverModel.findOne({ userId: params.driverUserId });
  const driverId = driver ? driver._id.toString() : params.driverUserId.toString();

  const wallet = await WalletModel.findOne({ userId: params.driverUserId });
  if (!wallet || wallet.balancePaise < params.amountPaise) {
    throw new Error("खात्यात पुरेसे पैसे उपलब्ध नाहीत (Insufficient wallet balance)");
  }

  // 2. Deduct from wallet atomically
  const updatedWallet = await WalletModel.findOneAndUpdate(
    {
      userId: params.driverUserId,
      balancePaise: { $gte: params.amountPaise },
    },
    {
      $inc: {
        balancePaise: -params.amountPaise,
        totalWithdrawnPaise: params.amountPaise,
      },
    },
    { returnDocument: "after" }
  );

  if (!updatedWallet) {
    throw new Error("समवर्ती व्यवहारांमुळे पैसे काढणे अयशस्वी (Concurrent payout clash)");
  }

  // 3. Post Double-Entry Ledger Entry
  const transactionGroup = crypto.randomUUID();
  const leg: DoubleEntryLeg = {
    debitAccount: `driver:${driverId}:available`,
    creditAccount: `bank:payout_disbursed:${params.payoutReference}`,
    amountPaise: params.amountPaise,
    type: "payout_disbursed",
    description: `Instant payout to ${params.destination} (Ref: ${params.payoutReference})`,
  };

  await postDoubleEntryTransaction(transactionGroup, [leg]);

  return {
    success: true,
    amountPaise: params.amountPaise,
    newBalancePaise: updatedWallet.balancePaise,
    payoutReference: params.payoutReference,
  };
}

/**
 * Calculates current net balance directly from the immutable double-entry ledger.
 * For driver and revenue accounts: Sum of Credits - Sum of Debits.
 */
export async function calculateLedgerAccountBalance(accountName: string): Promise<number> {
  const [creditAgg, debitAgg] = await Promise.all([
    LedgerEntryModel.aggregate([
      { $match: { creditAccount: accountName } },
      { $group: { _id: null, total: { $sum: "$amountPaise" } } },
    ]),
    LedgerEntryModel.aggregate([
      { $match: { debitAccount: accountName } },
      { $group: { _id: null, total: { $sum: "$amountPaise" } } },
    ]),
  ]);

  const totalCredits = creditAgg[0]?.total || 0;
  const totalDebits = debitAgg[0]?.total || 0;

  // Credit-normal accounts (Liabilities, Equity, Revenue, Driver earnings, Escrow)
  return totalCredits - totalDebits;
}
