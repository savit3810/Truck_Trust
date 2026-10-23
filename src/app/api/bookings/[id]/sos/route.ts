import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { BookingModel } from "@/features/booking/models/booking.model";
import { AuditLogModel } from "@/features/audit/models/audit-log.model";
import { Types } from "mongoose";

const sosSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  reason: z.string().trim().default("Emergency assistance requested"),
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
    const body = await req.json().catch(() => ({}));
    const parsed = sosSchema.safeParse(body);

    await connectToDatabase();

    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    const location: [number, number] | undefined =
      parsed.success && parsed.data.longitude && parsed.data.latitude
        ? [parsed.data.longitude, parsed.data.latitude]
        : booking.tracking?.currentLocation?.coordinates;

    const sosEntry = {
      triggeredBy: new Types.ObjectId(session.userId),
      role: (session.role === "driver" ? "driver" : "entrepreneur") as "driver" | "entrepreneur",
      location,
      reason: parsed.success ? parsed.data.reason : "Emergency SOS",
      status: "active" as const,
      triggeredAt: new Date(),
    };

    booking.sosAlerts = [...(booking.sosAlerts || []), sosEntry];

    booking.timeline.push({
      status: booking.status,
      timestamp: new Date(),
      note: `🚨 तातडीचा SOS इशारा: ${sosEntry.reason} (${session.phone})`,
    });

    await booking.save();

    // High priority audit log
    await AuditLogModel.create({
      actorId: new Types.ObjectId(session.userId),
      actorRole: session.role,
      action: "emergency.sos_triggered",
      resourceType: "booking",
      resourceId: booking._id.toString(),
      metadata: {
        bookingNumber: booking.bookingNumber,
        reason: sosEntry.reason,
        location,
        phone: session.phone,
      },
    });

    return NextResponse.json({
      success: true,
      message: "तातडीचा SOS इशारा पाठवण्यात आला आहे. नियंत्रण कक्ष आणि मदत पथक त्वरित संपर्क करत आहे.",
      emergencyHelplines: [
        { name: "महाराष्ट्र आपत्कालीन सेवा (Emergency Police/Ambulance)", number: "112" },
        { name: "महाराष्ट्र महामार्ग पोलीस (Highway Police)", number: "9822966333" },
        { name: "TruckTrust २४×७ सुरक्षा नियंत्रण कक्ष (Control Room)", number: "1800-209-8782" },
      ],
      alert: {
        triggeredAt: sosEntry.triggeredAt,
        status: sosEntry.status,
      },
    });
  } catch (error) {
    console.error("Error in /api/bookings/[id]/sos:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "SOS dispatch failed" },
      { status: 500 }
    );
  }
}
