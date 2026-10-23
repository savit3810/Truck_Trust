import mongoose, { Schema, Document, Model } from "mongoose";
import { z } from "zod";

export const UserRoleSchema = z.enum(["entrepreneur", "driver", "admin", "support", "truck_mitra"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserLanguageSchema = z.enum(["mr", "hi", "en"]);
export type UserLanguage = z.infer<typeof UserLanguageSchema>;

export interface IUser extends Document {
  phone: string;
  name?: string;
  email?: string; // Optional, used for admin accounts
  passwordHash?: string; // For admin credentials
  role: UserRole;
  language: UserLanguage;
  district?: string;
  village?: string;
  businessType?: string;
  isVerified: boolean;
  isActive: boolean;
  dpdpConsent: {
    consentedAt: Date;
    ipAddress?: string;
  };
  deletionRequestedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true, // Reason: Fast lookup by 10-digit mobile number during OTP login
    },
    name: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    village: {
      type: String,
      trim: true,
    },
    businessType: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true, // Reason: Admins have emails, drivers/farmers generally do not
    },
    passwordHash: {
      type: String,
    },
    role: {
      type: String,
      enum: ["entrepreneur", "driver", "admin", "support", "truck_mitra"],
      default: "entrepreneur",
      index: true, // Reason: Filtering users by role in admin dashboard and permissions check
    },
    language: {
      type: String,
      enum: ["mr", "hi", "en"],
      default: "mr",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    dpdpConsent: {
      consentedAt: {
        type: Date,
        default: Date.now,
      },
      ipAddress: {
        type: String,
      },
    },
    deletionRequestedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
