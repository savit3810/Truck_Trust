import { NextRequest, NextResponse } from "next/server";
import { getRoutingProvider } from "@/lib/providers/routing";

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("q") || "";

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, results: [] });
    }

    const results = await getRoutingProvider().geocode(query);
    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error in /api/routes/geocode:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Geocoding failed" },
      { status: 500 }
    );
  }
}
