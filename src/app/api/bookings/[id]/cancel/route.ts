import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Types } from "mongoose";
import { getCurrentSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { BookingModel } from "@/features/booking/models/booking.model";
import { WalletModel } from "@/features/ledger/models/wallet.model";
import { LedgerEntryModel } from "@/features/ledger/models/ledger-entry.model";
import crypto from "crypto";

const cancelBookingSchema = z.object({
  reason: z.string().trim().min(3, "Cancellation reason is required"),
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
    const parsed = cancelBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { reason } = parsed.data;
    await connectToDatabase();

    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    // Only entrepreneur who created it or platform admin can cancel
    const isOwner = booking.entrepreneurId.toString() === session.userId;
    const isAdmin = ["admin", "support"].includes(session.role);

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, error: "Permission denied" }, { status: 403 });
    }

    if (["completed", "cancelled"].includes(booking.status)) {
      return NextResponse.json(
        { success: false, error: `Booking cannot be cancelled because it is already ${booking.status}` },
        { status: 400 }
      );
    }

    if (["goods_loaded", "in_transit", "delivery_arrived"].includes(booking.status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Goods are already in transit. Direct cancellation is disabled. Please raise a dispute for mediation.",
        },
        { status: 400 }
      );
    }

    let stage: "before_accept" | "before_pickup" = "before_accept";
    let refundAmountPaise = booking.fare.advance50Paise;
    let cancellationFeePaise = 0;

    if (booking.status === "accepted") {
      stage = "before_pickup";
      // 10% driver compensation fee, 90% refund
      cancellationFeePaise = Math.round(booking.fare.advance50Paise * 0.1);
      refundAmountPaise = booking.fare.advance50Paise - cancellationFeePaise;

      // Credit driver wallet with compensation if driver exists
      if (booking.driverId) {
        await WalletModel.findOneAndUpdate(
          { userId: booking.driverId },
          { $inc: { balancePaise: cancellationFeePaise } },
          { upsert: true }
        );

        // Record ledger entry
        await LedgerEntryModel.create({
          transactionGroup: crypto.randomUUID(),
          bookingId: booking._id,
          debitAccount: "escrow:held",
          creditAccount: `driver:${booking.driverId}`,
          amountPaise: cancellationFeePaise,
          type: "driver_tip",
          description: `Cancellation compensation fee for booking ${booking.bookingNumber}`,
        });
      }
    }

    booking.status = "cancelled";
    booking.cancellation = {
      cancelledBy: new Types.ObjectId(session.userId),
      reason,
      stage,
      refundAmountPaise,
      cancellationFeePaise,
      cancelledAt: new Date(),
    };

    booking.timeline.push({
      status: "cancelled",
      timestamp: new Date(),
      note: `Cancelled (${stage}): ${reason}. Refund: ₹${(refundAmountPaise / 100).toFixed(0)}`,
    });

    await booking.save();

    return NextResponse.json({
      success: true,
      message: `Booking cancelled successfully. Refund of ₹${(refundAmountPaise / 100).toFixed(0)} will be returned.`,
      cancellation: booking.cancellation,
    });
  } catch (error) {
    console.error("Error in /api/bookings/[id]/cancel:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
