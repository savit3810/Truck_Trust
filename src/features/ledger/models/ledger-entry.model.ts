import mongoose, { Schema, Document, Model } from "mongoose";

export type LedgerEntryType =
  | "advance_held"
  | "escrow_release"
  | "platform_fee"
  | "refund"
  | "driver_tip"
  | "payout_disbursed"
  | "dispute_adjustment";

export interface ILedgerEntry extends Document {
  transactionGroup: string; // UUID linking the debit & credit entries of a transaction
  bookingId?: mongoose.Types.ObjectId;
  debitAccount: string; // e.g. "escrow:held", "user:USER_ID", "driver:DRIVER_ID", "platform:revenue"
  creditAccount: string;
  amountPaise: number; // Integer paise (e.g. 150000 = ₹1,500.00)
  type: LedgerEntryType;
  description: string;
  balanceSnapshotPaise?: number; // Snapshot of the account balance after this movement
  createdAt: Date;
  updatedAt: Date;
}

const LedgerEntrySchema = new Schema<ILedgerEntry>(
  {
    transactionGroup: {
      type: String,
      required: true,
      index: true, // Reason: Grouping balanced double-entry pairs together
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      index: true, // Reason: Reconcile all financial entries for a specific booking
    },
    debitAccount: {
      type: String,
      required: true,
      index: true, // Reason: Compute account balances and audit debits
    },
    creditAccount: {
      type: String,
      required: true,
      index: true, // Reason: Compute account balances and audit credits
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 1, // Must be positive integer paise
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not an integer value in paise",
      },
    },
    type: {
      type: String,
      enum: [
        "advance_held",
        "escrow_release",
        "platform_fee",
        "refund",
        "driver_tip",
        "payout_disbursed",
        "dispute_adjustment",
      ],
      required: true,
      index: true, // Reason: Financial reporting and revenue categorization
    },
    description: {
      type: String,
      required: true,
    },
    balanceSnapshotPaise: {
      type: Number,
    },
  },
  {
    timestamps: true,
    collection: "ledgerentries",
  }
);

LedgerEntrySchema.index({ createdAt: -1 });

export const LedgerEntryModel: Model<ILedgerEntry> =
  mongoose.models.LedgerEntry || mongoose.model<ILedgerEntry>("LedgerEntry", LedgerEntrySchema);
