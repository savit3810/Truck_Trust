import mongoose, { Schema, Document, Model } from "mongoose";

export type KycStatus = "pending" | "verified" | "rejected" | "action_needed";

export interface IDriver extends Document {
  userId: mongoose.Types.ObjectId;
  licenseNumber: string; // Masked in public UI
  experienceYears: number;
  operatingDistricts: string[];
  kycStatus: KycStatus;
  rejectionReason?: string;
  trustScore: number; // 0-100 calculated metric
  trustTier?: "diamond" | "gold" | "silver" | "bronze";
  rating?: number; // 1.0 - 5.0 average
  totalRatingsCount?: number;
  onTimeRate: number; // 0-100 percentage
  cancellationRate?: number; // 0-100 percentage
  totalTripsCompleted: number;
  bankDetails?: {
    upiId?: string;
    accountLast4?: string;
    ifscPrefix?: string;
  };
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriver>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true, // Reason: 1-to-1 relationship with the primary User account
    },
    licenseNumber: {
      type: String,
      required: true,
      trim: true,
      index: true, // Reason: Prevent duplicate driver registrations with same license
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },
    operatingDistricts: {
      type: [String],
      default: ["Palghar", "Thane", "Nashik"],
      index: true, // Reason: District-based matching for freight availability
    },
    kycStatus: {
      type: String,
      enum: ["pending", "verified", "rejected", "action_needed"],
      default: "pending",
      index: true, // Reason: Admin verification queue filtering and job dispatch eligibility check
    },
    rejectionReason: {
      type: String,
    },
    trustScore: {
      type: Number,
      default: 80, // New verified driver baseline
      min: 0,
      max: 100,
      index: true, // Reason: Driver ranking algorithm ordering
    },
    trustTier: {
      type: String,
      enum: ["diamond", "gold", "silver", "bronze"],
      default: "gold",
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1.0,
      max: 5.0,
    },
    totalRatingsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    onTimeRate: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    cancellationRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalTripsCompleted: {
      type: Number,
      default: 0,
    },
    bankDetails: {
      upiId: { type: String, trim: true },
      accountLast4: { type: String, trim: true },
      ifscPrefix: { type: String, trim: true },
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    collection: "drivers",
  }
);

DriverSchema.index({ kycStatus: 1, createdAt: -1 });

export const DriverModel: Model<IDriver> =
  mongoose.models.Driver || mongoose.model<IDriver>("Driver", DriverSchema);
