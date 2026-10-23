import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { BookingModel } from "@/features/booking/models/booking.model";
import { generateDeliveryProofSecrets } from "@/features/delivery/delivery-proof";
import { getSmsProvider } from "@/lib/providers/sms";

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

    await connectToDatabase();

    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    // Generate fresh cryptographic secrets & QR code
    const secrets = await generateDeliveryProofSecrets(booking.bookingNumber);

    booking.deliveryProof = {
      ...(booking.deliveryProof || {}),
      deliveryOtpHash: secrets.otpHash,
      qrCodeToken: secrets.qrCodeToken,
    };

    await booking.save();

    // Send SMS to receiver
    if (booking.drop.receiverPhone) {
      const smsProvider = getSmsProvider();
      await smsProvider.sendOtp(
        booking.drop.receiverPhone,
        secrets.otp,
        "delivery_proof"
      );
    }

    return NextResponse.json({
      success: true,
      qrCodeDataUrl: secrets.qrCodeDataUrl,
      otp: secrets.otp, // Returned in dev/API for display on receiver's tracking screen
      receiverPhone: booking.drop.receiverPhone,
    });
  } catch (error) {
    console.error("Error in /api/bookings/[id]/delivery-proof/initiate:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to initiate delivery proof" },
      { status: 500 }
    );
  }
}
