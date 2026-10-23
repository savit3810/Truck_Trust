import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { BookingModel } from "@/features/booking/models/booking.model";
import { getPaymentProvider } from "@/lib/providers/payment";
import { recordAdvanceEscrowHold } from "@/features/ledger/ledger-engine";

const verifyPaymentSchema = z.object({
  bookingId: z.string().trim().min(1, "Booking ID is required"),
  razorpayOrderId: z.string().trim().min(1, "Order ID is required"),
  razorpayPaymentId: z.string().trim().min(1, "Payment ID is required"),
  razorpaySignature: z.string().trim().min(1, "Signature is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = verifyPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid payment payload" },
        { status: 400 }
      );
    }

    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

    await connectToDatabase();

    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    // Verify cryptographic signature
    const provider = getPaymentProvider();
    const isValid = await provider.verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "अवैध स्वाक्षरी (Invalid payment signature verification failed)" },
        { status: 400 }
      );
    }

    // If advance already recorded, return idempotent success
    if (booking.payment?.advancePaid) {
      return NextResponse.json({
        success: true,
        message: "Advance already recorded",
        bookingNumber: booking.bookingNumber,
      });
    }

    // 1. Post to Double-Entry Ledger Engine
    await recordAdvanceEscrowHold({
      bookingId: booking._id,
      entrepreneurId: booking.entrepreneurId,
      amountPaise: booking.fare.advance50Paise,
      paymentMethod: provider.name === "razorpay" ? "razorpay" : "mock",
      paymentReference: razorpayPaymentId,
    });

    // 2. Update Booking
    booking.payment = {
      advancePaid: true,
      advancePaymentId: razorpayPaymentId,
      advancePaidAt: new Date(),
      deliveryPaid: false,
    };

    const advanceRs = (booking.fare.advance50Paise / 100).toFixed(0);
    booking.timeline.push({
      status: booking.status,
      timestamp: new Date(),
      note: `५०% उचल रक्कम भरली (₹${advanceRs}) • एस्क्रोमध्ये सुरक्षित ठेवण्यात आली (Payment ID: ${razorpayPaymentId})`,
    });

    await booking.save();

    return NextResponse.json({
      success: true,
      message: "Advance payment verified and securely held in escrow",
      booking: {
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        advancePaid: true,
      },
    });
  } catch (error) {
    console.error("Error in /api/payments/razorpay/verify:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
