import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { BookingModel } from "@/features/booking/models/booking.model";
import { recordDisputeEscrowFreeze } from "@/features/ledger/ledger-engine";
import { Types } from "mongoose";

const disputeSchema = z.object({
  reason: z.string().trim().min(5, "Dispute reason must be at least 5 characters"),
  details: z.string().trim().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;
    const body = await req.json();
    const parsed = disputeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid dispute details" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    // Must be either the entrepreneur, assigned driver, or admin
    const isEntrepreneur = booking.entrepreneurId.toString() === session.userId;
    const isDriver = booking.driverId?.toString() === session.userId;
    if (!isEntrepreneur && !isDriver && session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (booking.status === "completed" || booking.status === "cancelled") {
      return NextResponse.json(
        { success: false, error: "Cannot dispute a closed or cancelled booking" },
        { status: 400 }
      );
    }

    const disputeAmountPaise = booking.fare.advance50Paise;

    // 1. Freeze Escrow in Double-Entry Ledger
    await recordDisputeEscrowFreeze({
      bookingId: booking._id,
      disputeAmountPaise,
      reason: parsed.data.reason,
    });

    // 2. Mark Booking Disputed
    booking.status = "disputed";
    booking.dispute = {
      disputedBy: new Types.ObjectId(session.userId),
      reason: parsed.data.reason,
      details: parsed.data.details,
      status: "open",
      disputedAt: new Date(),
    };

    booking.timeline.push({
      status: "disputed",
      timestamp: new Date(),
      note: `तक्रार दाखल केली: ${parsed.data.reason} • एस्क्रो रक्कम गोठवण्यात आली (Escrow frozen)`,
    });

    await booking.save();

    return NextResponse.json({
      success: true,
      message: "तक्रार नोंदवण्यात आली असून एस्क्रो रक्कम चौकशीसाठी गोठवण्यात आली आहे (Dispute registered, escrow frozen for admin review)",
      booking: {
        bookingNumber: booking.bookingNumber,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error("Error in /api/bookings/[id]/dispute:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Dispute creation failed" },
      { status: 500 }
    );
  }
}
