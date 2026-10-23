import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { BookingModel } from "@/features/booking/models/booking.model";

const pickupProofSchema = z.object({
  photos: z.array(z.string().min(1)).min(1, "At least one pickup photo is required"),
  notes: z.string().trim().optional(),
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
    const parsed = pickupProofSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid pickup proof" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    booking.deliveryProof = {
      ...(booking.deliveryProof || {}),
      pickupPhotos: parsed.data.photos,
    };

    booking.status = "in_transit";
    booking.timeline.push({
      status: "in_transit",
      timestamp: new Date(),
      note: parsed.data.notes
        ? `माल ट्रकमध्ये भरला: ${parsed.data.notes}`
        : "माल ट्रकमध्ये भरला गेला आणि गाडी निघाली (Goods loaded and in transit)",
    });

    await booking.save();

    return NextResponse.json({
      success: true,
      message: "माल भरल्याची नोंद झाली व गाडी प्रवासात आहे (Goods loaded, trip in transit)",
      status: booking.status,
    });
  } catch (error) {
    console.error("Error in /api/bookings/[id]/pickup-proof:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Pickup proof submission failed" },
      { status: 500 }
    );
  }
}
