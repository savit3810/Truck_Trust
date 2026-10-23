import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { BookingModel } from "@/features/booking/models/booking.model";
import { DriverModel } from "@/features/drivers/models/driver.model";
import { verifyDeliveryProofSecret } from "@/features/delivery/delivery-proof";
import { recordDeliveryEscrowAndRelease } from "@/features/ledger/ledger-engine";

const verifyDeliverySchema = z.object({
  otp: z.string().trim().length(6).optional(),
  qrToken: z.string().trim().optional(),
  dropPhotos: z.array(z.string()).optional(),
  receiverNotes: z.string().trim().optional(),
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
    const parsed = verifyDeliverySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid delivery verification payload" },
        { status: 400 }
      );
    }

    const { otp, qrToken, dropPhotos, receiverNotes } = parsed.data;

    if (!otp && !qrToken) {
      return NextResponse.json(
        { success: false, error: "कृपया ६-अंकी डिलिव्हरी ओटीपी किंवा क्यूआर कोड द्या (Please provide 6-digit OTP or scan QR)" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "completed") {
      return NextResponse.json({
        success: true,
        message: "Booking is already completed",
        status: "completed",
      });
    }

    // Cryptographic proof verification
    const verification = await verifyDeliveryProofSecret({
      inputOtp: otp,
      inputQrToken: qrToken,
      expectedOtpHash: booking.deliveryProof?.deliveryOtpHash,
      expectedQrToken: booking.deliveryProof?.qrCodeToken,
    });

    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: "अवैध डिलिव्हरी ओटीपी किंवा क्यूआर कोड (Invalid Delivery OTP or QR Token)" },
        { status: 400 }
      );
    }

    // 1. Release Escrow via Double-Entry Ledger Engine
    let driverUserId = session.userId;
    if (booking.driverId) {
      const driver = await DriverModel.findById(booking.driverId);
      if (driver) {
        driverUserId = driver.userId.toString();
        // Increment Driver's successful completed trips counter
        await DriverModel.findByIdAndUpdate(booking.driverId, {
          $inc: { totalTripsCompleted: 1 },
        });
      }
    }

    await recordDeliveryEscrowAndRelease({
      bookingId: booking._id,
      driverId: booking.driverId ? booking.driverId.toString() : session.userId,
      driverUserId,
      totalFarePaise: booking.fare.totalFarePaise,
      delivery50Paise: booking.fare.delivery50Paise,
      platformFeePaise: booking.fare.platformFeePaise,
      gstTaxPaise: booking.fare.gstTaxPaise,
      paymentMethod: "cash",
      paymentReference: `dlv_${Date.now()}`,
    });

    // 2. Update Booking Status and Delivery Proof
    booking.status = "completed";
    booking.payment = {
      ...(booking.payment || { advancePaid: true }),
      deliveryPaid: true,
      deliveryPaidAt: new Date(),
    };

    booking.deliveryProof = {
      ...(booking.deliveryProof || {}),
      dropPhotos: dropPhotos || booking.deliveryProof?.dropPhotos || [],
      verifiedAt: new Date(),
      verifiedMethod: verification.method,
      receiverNotes,
    };

    booking.timeline.push({
      status: "completed",
      timestamp: new Date(),
      note: `माल सुरक्षित पोहोचला • ग्राहकाकडून ${verification.method === "otp" ? "ओटीपी" : "क्यूआर"} पडताळणी पूर्ण झाली व चालकाला भाडे अदा केले.`,
    });

    await booking.save();

    return NextResponse.json({
      success: true,
      message: "डिलिव्हरी यशस्वीरीत्या पूर्ण झाली व एस्क्रो रक्कम चालकाला जमा झाली (Delivery verified & escrow released to driver)",
      status: "completed",
      verifiedMethod: verification.method,
    });
  } catch (error) {
    console.error("Error in /api/bookings/[id]/verify-delivery:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Delivery verification failed" },
      { status: 500 }
    );
  }
}
