import mongoose, { Schema, Document, Model } from "mongoose";

export type DocType = "driving_license" | "rc_book" | "insurance" | "puc" | "fitness_permit" | "profile_photo" | "truck_photo";
export type DocVerificationStatus = "pending" | "approved" | "rejected";

export interface IDocumentItem extends Document {
  ownerId: mongoose.Types.ObjectId;
  ownerType: "driver" | "truck";
  docType: DocType;
  fileUrl: string;
  originalFilename: string;
  fileSizeBytes: number;
  mimeType: string;
  documentNumber?: string;
  expiryDate?: Date;
  status: DocVerificationStatus;
  rejectionReason?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocumentItem>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true, // Reason: Fetch all documents for a given driver or truck
    },
    ownerType: {
      type: String,
      enum: ["driver", "truck"],
      required: true,
    },
    docType: {
      type: String,
      enum: ["driving_license", "rc_book", "insurance", "puc", "fitness_permit", "profile_photo", "truck_photo"],
      required: true,
      index: true, // Reason: Look up specific document types (e.g. driving_license check)
    },
    fileUrl: {
      type: String,
      required: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    fileSizeBytes: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    documentNumber: {
      type: String,
      trim: true,
    },
    expiryDate: {
      type: Date,
      index: true, // Reason: Expiry reminder jobs (30, 15, 7 days before lapse)
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true, // Reason: Admin verification queue lookup
    },
    rejectionReason: {
      type: String,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "documents",
  }
);

DocumentSchema.index({ ownerId: 1, docType: 1 });
DocumentSchema.index({ status: 1, createdAt: 1 });

export const DocumentModel: Model<IDocumentItem> =
  mongoose.models.DocumentItem || mongoose.model<IDocumentItem>("DocumentItem", DocumentSchema);
