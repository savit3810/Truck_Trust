import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { BookingModel } from "@/features/booking/models/booking.model";
import { DriverModel } from "@/features/drivers/models/driver.model";
import { ReviewModel } from "@/features/trust/models/review.model";
import { recalculateAndSaveDriverTrust } from "@/features/trust/trust-engine";
import { Types } from "mongoose";

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  categories: z
    .object({
      punctuality: z.number().int().min(1).max(5).optional(),
      cargoCare: z.number().int().min(1).max(5).optional(),
      communication: z.number().int().min(1).max(5).optional(),
      drivingSafety: z.number().int().min(1).max(5).optional(),
      accurateWeight: z.number().int().min(1).max(5).optional(),
      fairPayment: z.number().int().min(1).max(5).optional(),
    })
    .optional(),
  comment: z.string().trim().max(1000).optional(),
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
    const parsed = createReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid review payload" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "completed") {
      return NextResponse.json(
        { success: false, error: "Reviews can only be submitted for completed deliveries" },
        { status: 400 }
      );
    }

    const authorUserId = new Types.ObjectId(session.userId);
    const isEntrepreneur = booking.entrepreneurId.toString() === session.userId;
    let isDriver = false;
    let driverDoc = null;

    if (booking.driverId) {
      driverDoc = await DriverModel.findById(booking.driverId);
      if (driverDoc && driverDoc.userId.toString() === session.userId) {
        isDriver = true;
      }
    }

    if (!isEntrepreneur && !isDriver && session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "You are not authorized to review this trip" },
        { status: 403 }
      );
    }

    // Determine author and target
    const authorRole = isEntrepreneur ? "entrepreneur" : "driver";
    let targetUserId: Types.ObjectId;
    let targetRole: "driver" | "entrepreneur";

    if (authorRole === "entrepreneur") {
      if (!driverDoc) {
        return NextResponse.json(
          { success: false, error: "No driver assigned to this booking" },
          { status: 400 }
        );
      }
      targetUserId = driverDoc.userId;
      targetRole = "driver";
    } else {
      targetUserId = booking.entrepreneurId;
      targetRole = "entrepreneur";
    }

    // Check duplicate review
    const existing = await ReviewModel.findOne({
      bookingId: booking._id,
      authorId: authorUserId,
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "You have already submitted a review for this trip" },
        { status: 409 }
      );
    }

    // Create review
    const review = await ReviewModel.create({
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      authorId: authorUserId,
      authorRole,
      targetId: targetUserId,
      targetRole,
      rating: parsed.data.rating,
      categories: parsed.data.categories,
      comment: parsed.data.comment,
      isVerifiedTrip: true,
    });

    // If driver was rated, recalculate their trust profile
    let updatedTrust = null;
    if (targetRole === "driver" && driverDoc) {
      updatedTrust = await recalculateAndSaveDriverTrust(driverDoc._id);
    }

    // Append to booking timeline
    booking.timeline.push({
      status: booking.status,
      timestamp: new Date(),
      note: `⭐ ${authorRole === "entrepreneur" ? "ग्राहकाने" : "चालकाने"} ${parsed.data.rating}/५ स्टार अभिप्राय नोंदवला`,
    });
    await booking.save();

    return NextResponse.json({
      success: true,
      message: "अभिप्राय यशस्वीरीत्या नोंदवला गेला (Review submitted successfully)",
      review: {
        id: review._id.toString(),
        rating: review.rating,
        categories: review.categories,
        comment: review.comment,
        createdAt: review.createdAt,
      },
      updatedTrust,
    });
  } catch (error) {
    console.error("Error in /api/bookings/[id]/reviews:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to submit review" },
      { status: 500 }
    );
  }
}
