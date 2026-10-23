import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { BookingModel } from "@/features/booking/models/booking.model";
import { getPaymentProvider } from "@/lib/providers/payment";

const createOrderSchema = z.object({
  bookingId: z.string().trim().min(1, "Booking ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const booking = await BookingModel.findById(parsed.data.bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    // Access check: only the booking entrepreneur or admin
    if (session.role !== "admin" && booking.entrepreneurId.toString() !== session.userId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (booking.payment?.advancePaid) {
      return NextResponse.json(
        { success: false, error: "५०% उचल रक्कम आधीच भरली आहे (Advance already paid)" },
        { status: 400 }
      );
    }

    const provider = getPaymentProvider();
    const orderResult = await provider.createOrder({
      amountPaise: booking.fare.advance50Paise,
      currency: "INR",
      receipt: booking.bookingNumber,
      notes: {
        bookingId: booking._id.toString(),
        bookingNumber: booking.bookingNumber,
        type: "advance_50",
      },
    });

    return NextResponse.json({
      success: true,
      order: orderResult,
      booking: {
        bookingNumber: booking.bookingNumber,
        advance50Paise: booking.fare.advance50Paise,
        totalFarePaise: booking.fare.totalFarePaise,
      },
    });
  } catch (error) {
    console.error("Error in /api/payments/razorpay/create-order:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}
