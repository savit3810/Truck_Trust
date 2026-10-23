import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRoutingProvider } from "@/lib/providers/routing";

const calculateRouteSchema = z.object({
  start: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  end: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = calculateRouteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid coordinates" }, { status: 400 });
    }

    const { start, end } = parsed.data;
    const route = await getRoutingProvider().calculateRoute(start, end);

    return NextResponse.json({
      success: true,
      route,
    });
  } catch (error) {
    console.error("Error in /api/routes/calculate:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Route calculation failed" },
      { status: 500 }
    );
  }
}
