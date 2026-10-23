import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateFare } from "@/features/booking/fare-engine";
import { matchDriversForBooking, MatchedDriver } from "@/features/booking/matching-engine";
import { connectToDatabase } from "@/lib/db/connection";

const estimateFareSchema = z.object({
  truckType: z.enum(["tata_ace", "pickup", "truck_14ft", "truck_17ft", "truck_20ft", "truck_32ft"]),
  distanceKm: z.number().min(0.5),
  isPerishable: z.boolean().default(false),
  isReturnLoad: z.boolean().default(false),
  isPooled: z.boolean().default(false),
  district: z.string().default("Palghar"),
  pickupCoords: z.tuple([z.number(), z.number()]).optional(), // [lng, lat]
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = estimateFareSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid estimation inputs" }, { status: 400 });
    }

    const { truckType, distanceKm, isPerishable, isReturnLoad, isPooled, district, pickupCoords } = parsed.data;

    const fare = calculateFare({
      truckType,
      distanceKm,
      isPerishable,
      isReturnLoad,
      isPooled,
    });

    let matchedDrivers: MatchedDriver[] = [];
    if (pickupCoords) {
      await connectToDatabase();
      matchedDrivers = await matchDriversForBooking(pickupCoords, truckType, district);
    }

    return NextResponse.json({
      success: true,
      fare,
      matchedDrivers,
    });
  } catch (error) {
    console.error("Error in /api/bookings/estimate-fare:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Fare estimation failed" },
      { status: 500 }
    );
  }
}
