import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuditLog extends Document {
  actorId?: mongoose.Types.ObjectId;
  actorRole: string;
  action: string;
  resourceType: string; // e.g. "driver", "document", "payment", "ledger", "user"
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  diff?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true, // Reason: Filter audit trail by specific admin or user
    },
    actorRole: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true, // Reason: Filter by action like "driver.approve", "escrow.release", "payout.request"
    },
    resourceType: {
      type: String,
      required: true,
      index: true, // Reason: Filter by affected entity type
    },
    resourceId: {
      type: String,
      index: true, // Reason: Retrieve complete history for a given document or payment
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    diff: {
      type: Schema.Types.Mixed,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Audit logs are immutable, never updated
    collection: "auditlogs",
  }
);

AuditLogSchema.index({ resourceType: 1, resourceId: 1 });
AuditLogSchema.index({ createdAt: -1 });

export const AuditLogModel: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
