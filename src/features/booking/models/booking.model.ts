import mongoose, { Schema, Document, Model } from "mongoose";
import { TruckType } from "@/features/trucks/models/truck.model";

export type BookingStatus =
  | "draft"
  | "requested" // Broadcasted or sent to driver, waiting for accept
  | "accepted" // Driver accepted
  | "pickup_arrived"
  | "goods_loaded"
  | "in_transit"
  | "delivery_arrived"
  | "completed" // Receiver verified OTP, escrow released
  | "cancelled"
  | "disputed";

export type BookingMode = "direct" | "broadcast" | "return_load" | "pooled";

export interface IBooking extends Document {
  bookingNumber: string;
  entrepreneurId: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  truckId?: mongoose.Types.ObjectId;

  pickup: {
    address: string;
    village?: string;
    taluka?: string;
    district: string;
    coordinates: [number, number]; // [lng, lat]
    contactName: string;
    contactPhone: string;
  };

  drop: {
    address: string;
    village?: string;
    taluka?: string;
    district: string;
    coordinates: [number, number]; // [lng, lat]
    receiverName: string;
    receiverPhone: string;
  };

  goods: {
    category: "agricultural_produce" | "dairy_milk" | "textiles" | "handicrafts" | "fmcg" | "other";
    description: string;
    weightKg: number;
    isPerishable: boolean;
    isFragile: boolean;
    specialNotes?: string;
    photos?: string[];
  };

  truckType: TruckType;
  mode: BookingMode;

  route: {
    distanceKm: number;
    durationMinutes: number;
    polyline?: string;
  };

  fare: {
    baseFarePaise: number;
    distanceFarePaise: number;
    handlingFarePaise: number;
    tollEstimatePaise: number;
    perishableSurchargePaise: number;
    discountPaise: number;
    subtotalFarePaise: number;
    platformFeePaise: number;
    gstTaxPaise: number;
    totalFarePaise: number;
    advance50Paise: number;
    delivery50Paise: number;
  };

  status: BookingStatus;

  cancellation?: {
    cancelledBy: mongoose.Types.ObjectId;
    reason: string;
    stage: "before_accept" | "before_pickup" | "after_pickup";
    refundAmountPaise: number;
    cancellationFeePaise: number;
    cancelledAt: Date;
  };

  payment?: {
    advancePaid: boolean;
    advancePaymentId?: string;
    advancePaidAt?: Date;
    deliveryPaid: boolean;
    deliveryPaymentId?: string;
    deliveryPaidAt?: Date;
  };

  dispute?: {
    disputedBy: mongoose.Types.ObjectId;
    reason: string;
    details?: string;
    status: "open" | "resolved";
    disputedAt: Date;
    resolvedAt?: Date;
    resolutionNote?: string;
    refundToEntrepreneurPaise?: number;
    payToDriverPaise?: number;
  };

  deliveryProof?: {
    deliveryOtpHash?: string;
    qrCodeToken?: string;
    pickupPhotos?: string[];
    dropPhotos?: string[];
    verifiedAt?: Date;
    verifiedMethod?: "otp" | "qr";
    receiverNotes?: string;
  };

  tracking?: {
    currentLocation?: {
      type: "Point";
      coordinates: [number, number]; // [lng, lat]
    };
    heading?: number;
    speedKmh?: number;
    etaMinutes?: number;
    lastUpdatedAt?: Date;
  };

  sosAlerts?: {
    triggeredBy: mongoose.Types.ObjectId;
    role: "driver" | "entrepreneur";
    location?: [number, number];
    reason?: string;
    status: "active" | "resolved";
    triggeredAt: Date;
    resolvedAt?: Date;
  }[];

  timeline: {
    status: BookingStatus;
    timestamp: Date;
    note?: string;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true, // Reason: Fast lookup by booking reference code
    },
    entrepreneurId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Reason: Retrieve booking history for an entrepreneur
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      index: true, // Reason: Retrieve active and completed jobs for a driver
    },
    truckId: {
      type: Schema.Types.ObjectId,
      ref: "Truck",
    },

    pickup: {
      address: { type: String, required: true },
      village: { type: String },
      taluka: { type: String },
      district: { type: String, required: true },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
      contactName: { type: String, required: true },
      contactPhone: { type: String, required: true },
    },

    drop: {
      address: { type: String, required: true },
      village: { type: String },
      taluka: { type: String },
      district: { type: String, required: true },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
      receiverName: { type: String, required: true },
      receiverPhone: { type: String, required: true },
    },

    goods: {
      category: {
        type: String,
        enum: ["agricultural_produce", "dairy_milk", "textiles", "handicrafts", "fmcg", "other"],
        default: "agricultural_produce",
      },
      description: { type: String, required: true },
      weightKg: { type: Number, required: true },
      isPerishable: { type: Boolean, default: false },
      isFragile: { type: Boolean, default: false },
      specialNotes: { type: String },
      photos: { type: [String], default: [] },
    },

    truckType: {
      type: String,
      enum: ["tata_ace", "pickup", "truck_14ft", "truck_17ft", "truck_20ft", "truck_32ft"],
      required: true,
    },
    mode: {
      type: String,
      enum: ["direct", "broadcast", "return_load", "pooled"],
      default: "broadcast",
    },

    route: {
      distanceKm: { type: Number, required: true },
      durationMinutes: { type: Number, required: true },
      polyline: { type: String },
    },

    fare: {
      baseFarePaise: { type: Number, required: true },
      distanceFarePaise: { type: Number, required: true },
      handlingFarePaise: { type: Number, required: true },
      tollEstimatePaise: { type: Number, default: 0 },
      perishableSurchargePaise: { type: Number, default: 0 },
      discountPaise: { type: Number, default: 0 },
      subtotalFarePaise: { type: Number, required: true },
      platformFeePaise: { type: Number, required: true },
      gstTaxPaise: { type: Number, required: true },
      totalFarePaise: { type: Number, required: true },
      advance50Paise: { type: Number, required: true },
      delivery50Paise: { type: Number, required: true },
    },

    status: {
      type: String,
      enum: [
        "draft",
        "requested",
        "accepted",
        "pickup_arrived",
        "goods_loaded",
        "in_transit",
        "delivery_arrived",
        "completed",
        "cancelled",
        "disputed",
      ],
      default: "requested",
      index: true,
    },

    payment: {
      advancePaid: { type: Boolean, default: false },
      advancePaymentId: { type: String },
      advancePaidAt: { type: Date },
      deliveryPaid: { type: Boolean, default: false },
      deliveryPaymentId: { type: String },
      deliveryPaidAt: { type: Date },
    },

    dispute: {
      disputedBy: { type: Schema.Types.ObjectId, ref: "User" },
      reason: { type: String },
      details: { type: String },
      status: { type: String, enum: ["open", "resolved"], default: "open" },
      disputedAt: { type: Date, default: Date.now },
      resolvedAt: { type: Date },
      resolutionNote: { type: String },
      refundToEntrepreneurPaise: { type: Number },
      payToDriverPaise: { type: Number },
    },

    deliveryProof: {
      deliveryOtpHash: { type: String },
      qrCodeToken: { type: String, index: true },
      pickupPhotos: [{ type: String }],
      dropPhotos: [{ type: String }],
      verifiedAt: { type: Date },
      verifiedMethod: { type: String, enum: ["otp", "qr"] },
      receiverNotes: { type: String },
    },

    tracking: {
      currentLocation: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [lng, lat]
        },
      },
      heading: { type: Number },
      speedKmh: { type: Number },
      etaMinutes: { type: Number },
      lastUpdatedAt: { type: Date },
    },

    sosAlerts: [
      {
        triggeredBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["driver", "entrepreneur"], required: true },
        location: { type: [Number] },
        reason: { type: String },
        status: { type: String, enum: ["active", "resolved"], default: "active" },
        triggeredAt: { type: Date, default: Date.now },
        resolvedAt: { type: Date },
      },
    ],

    cancellation: {
      cancelledBy: { type: Schema.Types.ObjectId, ref: "User" },
      reason: { type: String },
      stage: { type: String, enum: ["before_accept", "before_pickup", "after_pickup"] },
      refundAmountPaise: { type: Number },
      cancellationFeePaise: { type: Number },
      cancelledAt: { type: Date },
    },

    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
  },
  {
    timestamps: true,
    collection: "bookings",
  }
);

BookingSchema.index({ status: 1, createdAt: -1 });
BookingSchema.index({ "pickup.coordinates": "2dsphere" });

export const BookingModel: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
