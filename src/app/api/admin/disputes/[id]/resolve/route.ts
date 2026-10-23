import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { BookingModel } from "@/features/booking/models/booking.model";
import { DriverModel } from "@/features/drivers/models/driver.model";
import { recordDisputeResolution } from "@/features/ledger/ledger-engine";

const resolveDisputeSchema = z.object({
  refundToEntrepreneurPaise: z.number().int().min(0),
  payToDriverPaise: z.number().int().min(0),
  platformFeePaise: z.number().int().min(0).default(0),
  resolutionNote: z.string().trim().min(5, "Resolution rationale is required"),
  finalStatus: z.enum(["completed", "cancelled"]).default("completed"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin role required" }, { status: 403 });
    }

    const { id: bookingId } = await params;
    const body = await req.json();
    const parsed = resolveDisputeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid dispute resolution payload" },
        { status: 400 }
      );
    }

    const { refundToEntrepreneurPaise, payToDriverPaise, platformFeePaise, resolutionNote, finalStatus } =
      parsed.data;

    await connectToDatabase();

    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "disputed" && !booking.dispute) {
      return NextResponse.json({ success: false, error: "Booking is not in disputed state" }, { status: 400 });
    }

    const totalDisputedPaise = booking.fare.advance50Paise;

    // Verify sum of resolution equals disputed amount
    if (refundToEntrepreneurPaise + payToDriverPaise + platformFeePaise !== totalDisputedPaise) {
      return NextResponse.json(
        {
          success: false,
          error: `Total split (₹${(refundToEntrepreneurPaise + payToDriverPaise + platformFeePaise) / 100}) must equal disputed escrow (₹${totalDisputedPaise / 100})`,
        },
        { status: 400 }
      );
    }

    let driverUserId: string | undefined;
    if (booking.driverId) {
      const driver = await DriverModel.findById(booking.driverId);
      if (driver) driverUserId = driver.userId.toString();
    }

    // 1. Post dispute resolution legs into double-entry ledger
    await recordDisputeResolution({
      bookingId: booking._id,
      totalDisputedPaise,
      refundToEntrepreneurPaise,
      payToDriverPaise,
      platformFeePaise,
      entrepreneurId: booking.entrepreneurId,
      driverId: booking.driverId ? booking.driverId.toString() : "unassigned",
      driverUserId,
      resolutionNote,
    });

    // 2. Update Booking
    booking.status = finalStatus;
    booking.dispute = {
      ...(booking.dispute || {
        disputedBy: booking.entrepreneurId,
        reason: "Dispute",
        disputedAt: new Date(),
        status: "open",
      }),
      status: "resolved",
      resolvedAt: new Date(),
      resolutionNote,
      refundToEntrepreneurPaise,
      payToDriverPaise,
    };

    booking.timeline.push({
      status: finalStatus,
      timestamp: new Date(),
      note: `तक्रार निवारण पूर्ण: शेतकरी परतावा ₹${(refundToEntrepreneurPaise / 100).toFixed(0)}, चालक भरपाई ₹${(payToDriverPaise / 100).toFixed(0)} (${resolutionNote})`,
    });

    await booking.save();

    return NextResponse.json({
      success: true,
      message: "Dispute successfully resolved and ledger accounts settled",
      booking: {
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        dispute: booking.dispute,
      },
    });
  } catch (error) {
    console.error("Error in /api/admin/disputes/[id]/resolve:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Dispute resolution failed" },
      { status: 500 }
    );
  }
}
