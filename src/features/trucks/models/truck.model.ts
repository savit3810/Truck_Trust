import mongoose, { Schema, Document, Model } from "mongoose";

export type TruckType = "tata_ace" | "pickup" | "truck_14ft" | "truck_17ft" | "truck_20ft" | "truck_32ft";

export interface ITruck extends Document {
  driverId: mongoose.Types.ObjectId;
  registrationNumber: string; // e.g. MH-48-AB-1234
  truckType: TruckType;
  capacityKg: number;
  bodyType: "open" | "closed_container" | "tarpaulin" | "refrigerated";
  isAvailable: boolean;
  currentLocation?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
    updatedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TruckSchema = new Schema<ITruck>(
  {
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
      index: true, // Reason: Find trucks belonging to a specific driver
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true, // Reason: Enforce single registration per vehicle plate across system
    },
    truckType: {
      type: String,
      enum: ["tata_ace", "pickup", "truck_14ft", "truck_17ft", "truck_20ft", "truck_32ft"],
      required: true,
      index: true, // Reason: Filter trucks by capacity requirement for bookings
    },
    capacityKg: {
      type: Number,
      required: true,
      min: 100,
    },
    bodyType: {
      type: String,
      enum: ["open", "closed_container", "tarpaulin", "refrigerated"],
      default: "tarpaulin",
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true, // Reason: Match only currently available trucks
    },
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [72.7699, 19.6967], // Palghar base default
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
    collection: "trucks",
  }
);

// 2dsphere index for real-time proximity searches within N kilometers
TruckSchema.index({ currentLocation: "2dsphere" });

export const TruckModel: Model<ITruck> =
  mongoose.models.Truck || mongoose.model<ITruck>("Truck", TruckSchema);
