import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { getPlatformAnalytics } from "@/features/analytics/analytics-engine";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const analytics = await getPlatformAnalytics();

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/analytics:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to load platform analytics" },
      { status: 500 }
    );
  }
}
