import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { BookingModel } from "@/features/booking/models/booking.model";
import { DriverModel } from "@/features/drivers/models/driver.model";
import { TruckModel } from "@/features/trucks/models/truck.model";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "driver") {
      return NextResponse.json({ success: false, error: "Only verified drivers can accept freight jobs" }, { status: 403 });
    }

    const { id: bookingId } = await params;
    await connectToDatabase();

    const driver = await DriverModel.findOne({ userId: session.userId });
    if (!driver || driver.kycStatus !== "verified") {
      return NextResponse.json(
        { success: false, error: "Your driver KYC must be verified by admin before accepting freight jobs." },
        { status: 403 }
      );
    }

    const truck = await TruckModel.findOne({ driverId: driver._id, isAvailable: true });
    if (!truck) {
      return NextResponse.json(
        { success: false, error: "No active verified truck found for your account." },
        { status: 400 }
      );
    }

    // Atomic race-condition safe update:
    // First valid accept wins atomically; subsequent simultaneous accepts find status != "requested" and fail safely
    const updatedBooking = await BookingModel.findOneAndUpdate(
      {
        _id: bookingId,
        status: "requested",
        $or: [{ driverId: { $exists: false } }, { driverId: driver._id }],
      },
      {
        status: "accepted",
        driverId: driver._id,
        truckId: truck._id,
        $push: {
          timeline: {
            status: "accepted",
            timestamp: new Date(),
            note: `Job accepted by verified driver (+91 ${session.phone})`,
          },
        },
      },
      { returnDocument: "after" }
    );

    if (!updatedBooking) {
      return NextResponse.json(
        {
          success: false,
          error: "This load has already been accepted by another nearby driver or cancelled.",
        },
        { status: 409 } // 409 Conflict
      );
    }

    return NextResponse.json({
      success: true,
      message: "Job accepted successfully! You can now proceed to pickup location.",
      booking: {
        id: updatedBooking._id.toString(),
        bookingNumber: updatedBooking.bookingNumber,
        status: updatedBooking.status,
        pickup: updatedBooking.pickup,
        drop: updatedBooking.drop,
        fare: updatedBooking.fare,
      },
    });
  } catch (error) {
    console.error("Error in /api/bookings/[id]/accept:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
