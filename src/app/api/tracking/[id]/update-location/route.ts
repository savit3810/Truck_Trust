import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/connection";
import { BookingModel } from "@/features/booking/models/booking.model";
import { broadcastLocationUpdate } from "@/lib/tracking/tracking-events";

const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  heading: z.number().min(0).max(360).optional(),
  speedKmh: z.number().min(0).max(150).optional(),
  etaMinutes: z.number().min(0).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const body = await req.json();
    const parsed = updateLocationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid location coordinates" },
        { status: 400 }
      );
    }

    const { latitude, longitude, heading, speedKmh, etaMinutes } = parsed.data;

    await connectToDatabase();

    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    // Update tracking subdocument
    booking.tracking = {
      currentLocation: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      heading: heading ?? booking.tracking?.heading,
      speedKmh: speedKmh ?? booking.tracking?.speedKmh,
      etaMinutes: etaMinutes ?? booking.tracking?.etaMinutes,
      lastUpdatedAt: new Date(),
    };

    await booking.save();

    // Broadcast live event over SSE
    broadcastLocationUpdate({
      bookingId,
      coordinates: [longitude, latitude],
      heading: booking.tracking.heading,
      speedKmh: booking.tracking.speedKmh,
      etaMinutes: booking.tracking.etaMinutes,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      tracking: booking.tracking,
    });
  } catch (error) {
    console.error("Error in /api/tracking/[id]/update-location:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Location update failed" },
      { status: 500 }
    );
  }
}
