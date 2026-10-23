import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { DocumentModel } from "@/features/documents/models/document.model";
import { DriverModel } from "@/features/drivers/models/driver.model";
import { TruckModel } from "@/features/trucks/models/truck.model";
import { AuditLogModel } from "@/features/audit/models/audit-log.model";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "trucktrust_cron_secret_2026";

    if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: "Unauthorized cron execution" }, { status: 401 });
    }

    await connectToDatabase();
    const now = new Date();

    // 1. Process EXPIRED documents
    const expiredDocs = await DocumentModel.find({
      expiryDate: { $lte: now },
      status: "approved",
    });

    const suspendedDriverIds = new Set<string>();

    for (const doc of expiredDocs) {
      doc.status = "rejected";
      doc.rejectionReason = `Document expired on ${doc.expiryDate?.toLocaleDateString("en-IN")}`;
      await doc.save();

      let driverIdToSuspend = doc.ownerId;
      if (doc.ownerType === "truck") {
        const truck = await TruckModel.findById(doc.ownerId);
        if (truck) driverIdToSuspend = truck.driverId;
      }

      if (driverIdToSuspend) {
        await DriverModel.findByIdAndUpdate(driverIdToSuspend, {
          kycStatus: "action_needed",
          rejectionReason: `Suspended: ${doc.docType} expired. Please upload renewed document.`,
        });
        await TruckModel.updateMany({ driverId: driverIdToSuspend }, { isAvailable: false });
        suspendedDriverIds.add(driverIdToSuspend.toString());

        await AuditLogModel.create({
          actorRole: "system",
          action: "document.auto_suspended",
          resourceType: "driver",
          resourceId: driverIdToSuspend.toString(),
          diff: {
            reason: "Document validity expired",
            documentId: doc._id.toString(),
            docType: doc.docType,
            expiredAt: doc.expiryDate,
          },
        });
      }
    }

    // 2. Identify UPCOMING EXPIRATIONS (30, 15, 7 days)
    const thirtyDaysAhead = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const expiringSoonDocs = await DocumentModel.find({
      expiryDate: { $gt: now, $lte: thirtyDaysAhead },
      status: "approved",
    }).lean();

    const reminders = expiringSoonDocs.map((d) => {
      const daysRemaining = Math.ceil(((d.expiryDate?.getTime() || 0) - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        documentId: d._id.toString(),
        docType: d.docType,
        expiryDate: d.expiryDate,
        daysRemaining,
        tier: daysRemaining <= 7 ? "CRITICAL_7_DAYS" : daysRemaining <= 15 ? "WARNING_15_DAYS" : "NOTICE_30_DAYS",
      };
    });

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      expiredCount: expiredDocs.length,
      suspendedDriversCount: suspendedDriverIds.size,
      expiringSoonCount: reminders.length,
      reminders,
    });
  } catch (error) {
    console.error("Error in /api/cron/document-expiry:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
