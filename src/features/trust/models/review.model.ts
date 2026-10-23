import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReviewCategories {
  punctuality?: number;     // 1-5
  cargoCare?: number;       // 1-5
  communication?: number;   // 1-5
  drivingSafety?: number;   // 1-5
  accurateWeight?: number;  // 1-5
  fairPayment?: number;     // 1-5
}

export interface IReview extends Document {
  bookingId: mongoose.Types.ObjectId;
  bookingNumber: string;
  authorId: mongoose.Types.ObjectId;
  authorRole: "entrepreneur" | "driver";
  targetId: mongoose.Types.ObjectId; // User ID of driver or entrepreneur being reviewed
  targetRole: "driver" | "entrepreneur";
  rating: number; // 1 to 5
  categories?: IReviewCategories;
  comment?: string;
  isVerifiedTrip: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    bookingNumber: {
      type: String,
      required: true,
      trim: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    authorRole: {
      type: String,
      enum: ["entrepreneur", "driver"],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetRole: {
      type: String,
      enum: ["driver", "entrepreneur"],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer between 1 and 5",
      },
    },
    categories: {
      punctuality: { type: Number, min: 1, max: 5 },
      cargoCare: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      drivingSafety: { type: Number, min: 1, max: 5 },
      accurateWeight: { type: Number, min: 1, max: 5 },
      fairPayment: { type: Number, min: 1, max: 5 },
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    isVerifiedTrip: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "reviews",
  }
);

// Invariant: One review per author per booking
ReviewSchema.index({ bookingId: 1, authorId: 1 }, { unique: true });
ReviewSchema.index({ targetId: 1, createdAt: -1 });

export const ReviewModel: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
