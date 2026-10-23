import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { DriverModel } from "@/features/drivers/models/driver.model";
import { ReviewModel } from "@/features/trust/models/review.model";
import { UserModel } from "@/features/auth/models/user.model";
import { Types } from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    // Check by Driver ID or Driver userId
    let driver = null;
    if (Types.ObjectId.isValid(id)) {
      driver = await DriverModel.findById(id);
      if (!driver) {
        driver = await DriverModel.findOne({ userId: new Types.ObjectId(id) });
      }
    }

    if (!driver) {
      return NextResponse.json({ success: false, error: "Driver not found" }, { status: 404 });
    }

    const reviews = await ReviewModel.find({
      targetId: driver.userId,
      targetRole: "driver",
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Star distribution calculation (1 to 5)
    const starCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let punctualitySum = 0;
    let punctualityCount = 0;
    let cargoCareSum = 0;
    let cargoCareCount = 0;
    let communicationSum = 0;
    let communicationCount = 0;
    let drivingSafetySum = 0;
    let drivingSafetyCount = 0;

    for (const r of reviews) {
      if (r.rating >= 1 && r.rating <= 5) {
        starCounts[r.rating] = (starCounts[r.rating] || 0) + 1;
      }
      if (r.categories?.punctuality) {
        punctualitySum += r.categories.punctuality;
        punctualityCount++;
      }
      if (r.categories?.cargoCare) {
        cargoCareSum += r.categories.cargoCare;
        cargoCareCount++;
      }
      if (r.categories?.communication) {
        communicationSum += r.categories.communication;
        communicationCount++;
      }
      if (r.categories?.drivingSafety) {
        drivingSafetySum += r.categories.drivingSafety;
        drivingSafetyCount++;
      }
    }

    const totalReviews = reviews.length;
    const authorIds = reviews.map((r) => r.authorId);
    const authors = await UserModel.find({ _id: { $in: authorIds } }, "name phone role").lean();
    const authorMap = new Map(authors.map((a) => [a._id.toString(), a]));

    const formattedReviews = reviews.map((r) => {
      const author = authorMap.get(r.authorId.toString());
      const maskedName = author?.name
        ? author.name
        : `उद्योजक • ${author?.phone ? author.phone.substring(0, 4) + "****" : "ग्राहक"}`;

      return {
        id: r._id.toString(),
        bookingNumber: r.bookingNumber,
        authorName: maskedName,
        rating: r.rating,
        categories: r.categories,
        comment: r.comment,
        createdAt: r.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      driverId: driver._id.toString(),
      trustScore: driver.trustScore ?? 80,
      trustTier: driver.trustTier ?? "gold",
      averageRating: driver.rating ?? 5.0,
      totalRatingsCount: totalReviews,
      totalTripsCompleted: driver.totalTripsCompleted ?? 0,
      onTimeRate: driver.onTimeRate ?? 100,
      cancellationRate: driver.cancellationRate ?? 0,
      starDistribution: starCounts,
      categoryAverages: {
        punctuality: punctualityCount > 0 ? Math.round((punctualitySum / punctualityCount) * 10) / 10 : 5.0,
        cargoCare: cargoCareCount > 0 ? Math.round((cargoCareSum / cargoCareCount) * 10) / 10 : 5.0,
        communication: communicationCount > 0 ? Math.round((communicationSum / communicationCount) * 10) / 10 : 5.0,
        drivingSafety: drivingSafetyCount > 0 ? Math.round((drivingSafetySum / drivingSafetyCount) * 10) / 10 : 5.0,
      },
      reviews: formattedReviews,
    });
  } catch (error) {
    console.error("Error in GET /api/drivers/[id]/reviews:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to load driver reviews" },
      { status: 500 }
    );
  }
}
