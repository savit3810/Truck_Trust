import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOtp extends Document {
  phone: string;
  purpose: "login" | "delivery_proof";
  codeHash: string;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true, // Reason: Fast lookup when user submits OTP code
    },
    purpose: {
      type: String,
      enum: ["login", "delivery_proof"],
      default: "login",
    },
    codeHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Reason: MongoDB TTL auto-purges expired OTPs after 5 minutes
    },
  },
  {
    timestamps: true,
    collection: "otps",
  }
);

OtpSchema.index({ phone: 1, purpose: 1 });

export const OtpModel: Model<IOtp> =
  mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);
