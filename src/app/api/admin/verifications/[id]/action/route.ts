import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { DriverModel } from "@/features/drivers/models/driver.model";
import { UserModel } from "@/features/auth/models/user.model";
import { TruckModel } from "@/features/trucks/models/truck.model";
import { DocumentModel } from "@/features/documents/models/document.model";
import { AuditLogModel } from "@/features/audit/models/audit-log.model";

const adminActionSchema = z.object({
  action: z.enum(["approve", "reject", "request_info"]),
  reason: z.string().trim().optional(),
  documentDecisions: z
    .array(
      z.object({
        documentId: z.string(),
        status: z.enum(["approved", "rejected"]),
        reason: z.string().optional(),
      })
    )
    .optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session || !["admin", "support"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Access denied: Admin permissions required." }, { status: 403 });
    }

    const { id: driverId } = await params;
    const body = await req.json();
    const parsed = adminActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { action, reason, documentDecisions } = parsed.data;

    if (action === "reject" && !reason) {
      return NextResponse.json(
        { success: false, error: "A rejection reason is mandatory when rejecting a driver application." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const driver = await DriverModel.findById(driverId);
    if (!driver) {
      return NextResponse.json({ success: false, error: "Driver not found" }, { status: 404 });
    }

    const previousStatus = driver.kycStatus;
    let newKycStatus = "pending";

    if (action === "approve") {
      newKycStatus = "verified";
      driver.kycStatus = "verified";
      driver.verifiedAt = new Date();
      driver.verifiedBy = session.userId as unknown as import("mongoose").Types.ObjectId;
      driver.rejectionReason = undefined;

      // Update User verification
      await UserModel.findByIdAndUpdate(driver.userId, { isVerified: true });
      // Enable driver's truck
      await TruckModel.updateMany({ driverId: driver._id }, { isAvailable: true });

      // Mark all documents approved if not explicitly specified
      if (!documentDecisions || documentDecisions.length === 0) {
        await DocumentModel.updateMany({ ownerId: driver._id }, { status: "approved" });
        const truck = await TruckModel.findOne({ driverId: driver._id });
        if (truck) {
          await DocumentModel.updateMany({ ownerId: truck._id }, { status: "approved" });
        }
      }
    } else if (action === "reject") {
      newKycStatus = "rejected";
      driver.kycStatus = "rejected";
      driver.rejectionReason = reason;

      await UserModel.findByIdAndUpdate(driver.userId, { isVerified: false });
      await TruckModel.updateMany({ driverId: driver._id }, { isAvailable: false });
    } else if (action === "request_info") {
      newKycStatus = "action_needed";
      driver.kycStatus = "action_needed";
      driver.rejectionReason = reason;
      await TruckModel.updateMany({ driverId: driver._id }, { isAvailable: false });
    }

    // Apply individual document decisions if provided
    if (documentDecisions && documentDecisions.length > 0) {
      for (const dec of documentDecisions) {
        await DocumentModel.findByIdAndUpdate(dec.documentId, {
          status: dec.status,
          rejectionReason: dec.reason,
          reviewedBy: session.userId,
          reviewedAt: new Date(),
        });
      }
    }

    await driver.save();

    // Create immutable audit log entry
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    await AuditLogModel.create({
      actorId: session.userId,
      actorRole: session.role,
      action: `driver.kyc.${action}`,
      resourceType: "driver",
      resourceId: driver._id.toString(),
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") || undefined,
      diff: {
        previousStatus,
        newStatus: newKycStatus,
        reason,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Driver verification decision recorded: ${action.toUpperCase()}`,
      driver: {
        id: driver._id.toString(),
        kycStatus: driver.kycStatus,
        rejectionReason: driver.rejectionReason,
      },
    });
  } catch (error) {
    console.error("Error in /api/admin/verifications/[id]/action:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
