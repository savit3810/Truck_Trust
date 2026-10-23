import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/features/auth/models/user.model";

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  district: z.string().trim().max(100).optional(),
  village: z.string().trim().max(100).optional(),
  businessType: z.string().trim().max(100).optional(),
  language: z.enum(["mr", "hi", "en"]).optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await UserModel.findById(session.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const { name, district, village, businessType, language } = parsed.data;
    if (name !== undefined) user.name = name;
    if (district !== undefined) user.district = district;
    if (village !== undefined) user.village = village;
    if (businessType !== undefined) user.businessType = businessType;
    if (language !== undefined) user.language = language;

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id.toString(),
        phone: user.phone,
        name: user.name,
        role: user.role,
        district: user.district,
        village: user.village,
        businessType: user.businessType,
        language: user.language,
      },
    });
  } catch (error) {
    console.error("Error in PUT /api/auth/profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
