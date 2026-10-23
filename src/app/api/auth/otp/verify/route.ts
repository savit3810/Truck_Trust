import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db/connection";
import { OtpModel } from "@/features/auth/models/otp.model";
import { UserModel, UserRole } from "@/features/auth/models/user.model";
import { DriverModel } from "@/features/drivers/models/driver.model";
import { WalletModel } from "@/features/ledger/models/wallet.model";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

const verifyOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/\D/g, "").slice(-10))
    .pipe(z.string().length(10, "कृपया १०-अंकी मोबाईल नंबर प्रविष्ट करा (Please enter a valid 10-digit mobile number)")),
  otp: z.string().trim().length(6, "OTP must be exactly 6 digits"),
  role: z.enum(["entrepreneur", "driver", "admin", "support", "truck_mitra"]).optional(),
  name: z.string().trim().optional(),
  district: z.string().trim().optional(),
  village: z.string().trim().optional(),
  businessType: z.string().trim().optional(),
  language: z.enum(["mr", "hi", "en"]).default("mr"),
  purpose: z.enum(["login", "delivery_proof"]).default("login"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { phone, otp, role, name, district, village, businessType, language, purpose } = parsed.data;

    await connectToDatabase();

    const isNonProd = process.env.NODE_ENV !== "production";
    const isMasterOtp = isNonProd && otp === "123456";

    const otpRecord = await OtpModel.findOne({ phone, purpose });

    if (!isMasterOtp) {
      if (!otpRecord) {
        return NextResponse.json(
          { success: false, error: "OTP expired or not requested. Please request a new OTP (or use 123456 in dev mode)." },
          { status: 400 }
        );
      }

      if (otpRecord.expiresAt < new Date()) {
        await OtpModel.deleteOne({ _id: otpRecord._id });
        return NextResponse.json(
          { success: false, error: "OTP has expired. Please request a new OTP." },
          { status: 400 }
        );
      }

      if (otpRecord.attempts >= 8) {
        await OtpModel.deleteOne({ _id: otpRecord._id });
        return NextResponse.json(
          { success: false, error: "Too many incorrect attempts. Please request a new OTP." },
          { status: 429 }
        );
      }

      const isMatch = await bcrypt.compare(otp, otpRecord.codeHash);
      if (!isMatch) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        const remaining = 8 - otpRecord.attempts;
        return NextResponse.json(
          { success: false, error: `चुकीचा OTP. ${remaining} प्रयत्न शिल्लक. (Invalid OTP. ${remaining} attempts remaining)` },
          { status: 400 }
        );
      }

      // OTP matched! Remove OTP record immediately
      await OtpModel.deleteOne({ _id: otpRecord._id });
    } else if (otpRecord) {
      await OtpModel.deleteOne({ _id: otpRecord._id });
    }

    // Find or create user automatically for ANY mobile number
    let user = await UserModel.findOne({ phone });
    const isNewUser = !user;

    // Honor the explicitly selected role during login, unless protecting existing admin
    const requestedRole: UserRole = role || "entrepreneur";
    const assignedRole: UserRole =
      user?.role === "admin" && role !== "admin"
        ? "admin"
        : requestedRole;

    const defaultName = assignedRole === "driver" ? `चालक ${phone.slice(-4)}` : `उद्योजक ${phone.slice(-4)}`;
    const finalName = name?.trim() || user?.name || defaultName;

    if (!user) {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
      user = await UserModel.create({
        phone,
        name: finalName,
        role: assignedRole,
        district: district || undefined,
        village: village || undefined,
        businessType: businessType || undefined,
        language,
        isVerified: true,
        isActive: true,
        dpdpConsent: {
          consentedAt: new Date(),
          ipAddress: ip,
        },
      });

      // If user signed up as driver, initialize driver record & wallet
      if (assignedRole === "driver") {
        await DriverModel.create({
          userId: user._id,
          licenseNumber: `MH-${phone.slice(0, 2)}-202000${phone.slice(-4)}`,
          experienceYears: 2,
          operatingDistricts: district ? [district, "Palghar", "Thane", "Nashik"] : ["Palghar", "Thane", "Nashik", "Pune"],
          kycStatus: "verified",
          trustScore: 85,
          trustTier: "gold",
          onTimeRate: 100,
          totalTripsCompleted: 1,
        });

        await WalletModel.create({
          userId: user._id,
          balancePaise: 0,
          escrowBalancePaise: 0,
          totalEarnedPaise: 0,
          totalWithdrawnPaise: 0,
        });
      }
    } else {
      let needsSave = false;
      // User exists. If they explicitly selected a role (e.g. entrepreneur or driver), update their active role
      if (role && user.role !== assignedRole) {
        user.role = assignedRole;
        needsSave = true;
      }
      if (name && name.trim() && user.name !== name.trim()) {
        user.name = name.trim();
        needsSave = true;
      }
      if (district && user.district !== district.trim()) {
        user.district = district.trim();
        needsSave = true;
      }
      if (village && user.village !== village.trim()) {
        user.village = village.trim();
        needsSave = true;
      }
      if (businessType && user.businessType !== businessType.trim()) {
        user.businessType = businessType.trim();
        needsSave = true;
      }

      if (needsSave) {
        await user.save();
      }

      // If switched to driver, ensure driver model and wallet exist
      if (assignedRole === "driver") {
        const existingDriver = await DriverModel.findOne({ userId: user._id });
        if (!existingDriver) {
          await DriverModel.create({
            userId: user._id,
            licenseNumber: `MH-${phone.slice(0, 2)}-202000${phone.slice(-4)}`,
            experienceYears: 2,
            operatingDistricts: ["Palghar", "Thane", "Nashik", "Pune"],
            kycStatus: "verified",
            trustScore: 85,
            trustTier: "gold",
            onTimeRate: 100,
            totalTripsCompleted: 1,
          });
        }
        const existingWallet = await WalletModel.findOne({ userId: user._id });
        if (!existingWallet) {
          await WalletModel.create({
            userId: user._id,
            balancePaise: 0,
            escrowBalancePaise: 0,
            totalEarnedPaise: 0,
            totalWithdrawnPaise: 0,
          });
        }
      }
    }

    // Generate JWT session token
    const token = await createSessionToken({
      userId: user._id.toString(),
      phone: user.phone,
      role: user.role,
      name: user.name,
      isVerified: user.isVerified,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        phone: user.phone,
        name: user.name,
        role: user.role,
        language: user.language,
        district: user.district,
        village: user.village,
        businessType: user.businessType,
        isVerified: user.isVerified,
        isNewUser,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error in /api/auth/otp/verify:", error);
    const err = error as Error;
    const isDbError = err?.message?.includes("ECONNREFUSED") || err?.name === "MongooseServerSelectionError";

    return NextResponse.json(
      {
        success: false,
        error: isDbError
          ? "Cloud database not connected (क्लाउड डेटाबेस जोडलेला नाही). Vercel वर MONGODB_URI (MongoDB Atlas) सेट करा."
          : "Internal server error occurred",
      },
      { status: 500 }
    );
  }
}
