import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { Types } from "mongoose";
import { getCurrentSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { BookingModel, BookingMode } from "@/features/booking/models/booking.model";
import { DriverModel } from "@/features/drivers/models/driver.model";
import { TruckModel } from "@/features/trucks/models/truck.model";
import { getRoutingProvider } from "@/lib/providers/routing";
import { calculateFare } from "@/features/booking/fare-engine";

const createBookingSchema = z.object({
  pickup: z.object({
    address: z.string().trim().min(3),
    village: z.string().optional(),
    taluka: z.string().optional(),
    district: z.string().trim().min(2),
    coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
    contactName: z.string().trim().min(2),
    contactPhone: z.string().trim().regex(/^[6-9]\d{9}$/),
  }),
  drop: z.object({
    address: z.string().trim().min(3),
    village: z.string().optional(),
    taluka: z.string().optional(),
    district: z.string().trim().min(2),
    coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
    receiverName: z.string().trim().min(2),
    receiverPhone: z.string().trim().regex(/^[6-9]\d{9}$/),
  }),
  goods: z.object({
    category: z.enum(["agricultural_produce", "dairy_milk", "textiles", "handicrafts", "fmcg", "other"]),
    description: z.string().trim().min(2),
    weightKg: z.coerce.number().min(10),
    isPerishable: z.boolean().default(false),
    isFragile: z.boolean().default(false),
    specialNotes: z.string().optional(),
  }),
  truckType: z.enum(["tata_ace", "pickup", "truck_14ft", "truck_17ft", "truck_20ft", "truck_32ft"]),
  mode: z.enum(["direct", "broadcast", "return_load", "pooled"]).default("broadcast"),
  driverId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please login to create a booking." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    await connectToDatabase();

    // 1. Calculate actual road route using routing provider
    const route = await getRoutingProvider().calculateRoute(
      { latitude: data.pickup.coordinates[1], longitude: data.pickup.coordinates[0] },
      { latitude: data.drop.coordinates[1], longitude: data.drop.coordinates[0] }
    );

    // 2. Compute transparent fare strictly on server (never trust client amounts)
    const fare = calculateFare({
      truckType: data.truckType,
      distanceKm: route.distanceKm,
      isPerishable: data.goods.isPerishable,
      isReturnLoad: data.mode === "return_load",
      isPooled: data.mode === "pooled",
    });

    // 3. Generate unique booking number
    const randomCode = crypto.randomInt(1000, 9999);
    const bookingNumber = `TT-2026-MH-${randomCode}`;

    let assignedDriverId: Types.ObjectId | undefined = undefined;
    let assignedTruckId: Types.ObjectId | undefined = undefined;

    if (data.mode === "direct" && data.driverId) {
      const driver = await DriverModel.findById(data.driverId);
      if (driver && driver.kycStatus === "verified") {
        assignedDriverId = driver._id as Types.ObjectId;
        const truck = await TruckModel.findOne({ driverId: driver._id, isAvailable: true });
        if (truck) assignedTruckId = truck._id as Types.ObjectId;
      }
    }

    // 4. Create Booking
    const booking = await BookingModel.create({
      bookingNumber,
      entrepreneurId: session.userId,
      driverId: assignedDriverId,
      truckId: assignedTruckId,
      pickup: data.pickup,
      drop: data.drop,
      goods: data.goods,
      truckType: data.truckType,
      mode: data.mode as BookingMode,
      route: {
        distanceKm: route.distanceKm,
        durationMinutes: route.durationMinutes,
        polyline: route.polyline,
      },
      fare: {
        baseFarePaise: fare.baseFarePaise,
        distanceFarePaise: fare.distanceFarePaise,
        handlingFarePaise: fare.handlingFarePaise,
        tollEstimatePaise: fare.tollEstimatePaise,
        perishableSurchargePaise: fare.perishableSurchargePaise,
        discountPaise: fare.discountPaise,
        subtotalFarePaise: fare.subtotalFarePaise,
        platformFeePaise: fare.platformFeePaise,
        gstTaxPaise: fare.gstTaxPaise,
        totalFarePaise: fare.totalFarePaise,
        advance50Paise: fare.advance50Paise,
        delivery50Paise: fare.delivery50Paise,
      },
      status: "requested",
      timeline: [
        {
          status: "requested",
          timestamp: new Date(),
          note: "Booking created by entrepreneur. Waiting for driver confirmation.",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      booking: {
        id: booking._id.toString(),
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        route: booking.route,
        fare: booking.fare,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/bookings:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope"); // "open_jobs" for drivers

    let query: Record<string, unknown> = {};

    if (session.role === "entrepreneur") {
      query = {
        $or: [
          { entrepreneurId: session.userId },
          { "pickup.contactPhone": session.phone },
          { "pickup.contactPhone": session.phone.slice(-10) },
        ],
      };
    } else if (session.role === "driver") {
      const driver = await DriverModel.findOne({ userId: session.userId });
      if (!driver) {
        return NextResponse.json({ success: true, bookings: [] });
      }

      if (scope === "open_jobs") {
        // Broadcast jobs waiting for driver acceptance
        query = {
          status: "requested",
          driverId: { $exists: false },
        };
        if (driver.operatingDistricts && driver.operatingDistricts.length > 0) {
          query["pickup.district"] = {
            $in: driver.operatingDistricts.map((d: string) => new RegExp(`^${d.trim()}$`, "i")),
          };
        }
      } else {
        // Bookings assigned to this driver
        query = { driverId: driver._id };
      }
    } else if (["admin", "support"].includes(session.role)) {
      if (scope === "open_jobs") {
        query = {
          status: "requested",
          driverId: { $exists: false },
        };
      } else {
        query = {}; // Admins can view all
      }
    }

    const bookings = await BookingModel.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      count: bookings.length,
      bookings: bookings.map((b) => ({
        id: b._id.toString(),
        bookingNumber: b.bookingNumber,
        status: b.status,
        pickup: b.pickup,
        drop: b.drop,
        goods: b.goods,
        truckType: b.truckType,
        mode: b.mode,
        route: b.route,
        fare: b.fare,
        createdAt: b.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error in GET /api/bookings:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
